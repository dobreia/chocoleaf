import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

import barionRoutes from "./routes/barion.js";
import calRoutes from "./routes/cal.js";
import { initCoursesWatcher, listCourses } from "./lib/courses.js";
import { getPaymentState } from "./lib/barion.js";
import galleryRoutes from "./routes/galleryRoutes.js";

import { fillVoucherDesign } from "./lib/fill_voucher.js";
import { sendVoucherEmail } from "./lib/mail.js";
const app = express();

// ha ngrok / reverse proxy mögött fut
app.set("trust proxy", true);

// __dirname pótlás ESM-ben
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// statikus fájlok (public/)
app.use(express.static(path.join(__dirname, "public")));

// galéria route
app.use(galleryRoutes);

// kurzus-adatbázis betöltése + fájlfigyelés (nem blokkoló)
try {
  initCoursesWatcher();
  console.log("[courses] watcher initialized");
} catch (e) {
  console.warn("[courses] init failed:", e?.message || e);
}

// debug/ellenőrző endpoint — aktuális aktív kurzusok
app.get("/api/courses", async (_req, res) => {
  try {
    const courses = await listCourses();
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// API útvonalak
app.use("/api/barion", barionRoutes);
app.use("/api/cal", calRoutes);

// egyszerű healthcheck
app.get("/health", (_req, res) => res.status(200).send("OK"));

// root -> public/index.html (ha létezik)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Booking redirect (meglévő)
app.get("/api/barion/redirect", async (req, res) => {
  try {
    // A Barion "Id" paramétert küld, nem "PaymentId"-t
    const paymentId = req.query.paymentId || req.query.PaymentId || req.query.Id;
    const bookingUid = req.query.bookingUid;

    if (!paymentId) {
      console.warn("❌ Nincs PaymentId az URL-ben!", req.query);
      return res.redirect(`/booking-status.html?status=error&bookingUid=${encodeURIComponent(bookingUid || "")}`);
    }

    // Lekérdezzük az állapotot
    const state = await getPaymentState(paymentId);

    console.log("💳 Barion payment state:", state.Status, paymentId);

    if (state.Status === "Succeeded") {
      return res.redirect(`/booking-status.html?status=success&bookingUid=${encodeURIComponent(bookingUid || "")}`);
    } else {
      return res.redirect(`/booking-status.html?status=error&bookingUid=${encodeURIComponent(bookingUid || "")}`);
    }
  } catch (e) {
    console.error("Redirect check error:", e);
    res.redirect(`/booking-status.html?status=error`);
  }
});


// =========================
// 🎁 GIFT CARD INTEGRÁCIÓ
// =========================
const POSKey = process.env.BARION_POSKEY || "d85be135-f5bc-4c84-a8fe-fc3bc55012bb";
const MerchantId = process.env.BARION_MERCHANT || "dobreiandras@gmail.com";

// ideiglenes store (élesben DB!)
const giftcardStore = new Map();

// 1. fizetés indítása
app.post("/api/giftcard/start-payment", async (req, res) => {
  const { name, email, amount, quantity } = req.body;
  if (!name || !email || !amount || !quantity) {
    return res.status(400).json({ error: "Hiányzó adatok" });
  }

  const total = amount * quantity;
  const paymentRequestId = "giftcard-" + Date.now();

  // tárolás (később DB-be érdemes)
  giftcardStore.set(paymentRequestId, { name, email, amount, quantity });

  const paymentRequest = {
    POSKey,
    PaymentType: "Immediate",
    GuestCheckOut: true,
    FundingSources: ["All"],
    PaymentRequestId: paymentRequestId,
    OrderNumber: "GC-" + Date.now(),
    Currency: "HUF",
    RedirectUrl: `${process.env.PUBLIC_URL || "http://localhost:3000"}/giftcard_redirect.html`,
    Transactions: [
      {
        POSTransactionId: "T" + Date.now(),
        Payee: MerchantId,
        Total: total,
        Comment: `Ajándékutalvány ${quantity} × ${amount} Ft`,
        Items: [
          {
            Name: "ChocoLeaf Ajándékutalvány",
            Description: `${quantity} × ${amount} Ft értékű ajándékutalvány`,
            Quantity: quantity,
            Unit: "db",
            UnitPrice: amount,
            ItemTotal: total
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch("https://api.test.barion.com/v2/Payment/Start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentRequest)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Giftcard Barion Start error:", err);
    res.status(500).json({ error: "Nem sikerült a Barion hívás" });
  }
});

// 2. redirect után lekérdezés
app.get("/api/giftcard/status", async (req, res) => {
  const paymentId = req.query.paymentId;
  if (!paymentId) return res.status(400).json({ error: "Nincs paymentId" });

  try {
    const response = await fetch(
      `https://api.test.barion.com/v2/Payment/GetPaymentState?POSKey=${POSKey}&PaymentId=${paymentId}`
    );
    const data = await response.json();

    const requestId = data.PaymentRequestId;
    const stored = giftcardStore.get(requestId);

    if (stored) {
      res.json({
        success: data.Status === "Succeeded",
        userData: stored
      });
    } else {
      res.json({ success: false, error: "Nincs tárolt adat ehhez a fizetéshez" });
    }
  } catch (err) {
    console.error("Giftcard status lekérdezés hiba:", err);
    res.status(500).json({ error: "Nem sikerült lekérdezni" });
  }
});

app.post("/api/giftcard/generate", async (req, res) => {
  try {
    const { name, email, amount, quantity } = req.body;
    console.log("📩 Generate request:", { name, email, amount, quantity });

    if (!name) throw new Error("Nincs név megadva");

    const attachments = [];
    for (let i = 0; i < quantity; i++) {
      const { outPath, serial } = await fillVoucherDesign(name, amount);
      attachments.push({ path: outPath, serial });
    }

    await sendVoucherEmail(email, name, attachments);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Voucher generálás hiba:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});


// szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const base = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
  console.log(`Server running on ${base}`);
});


