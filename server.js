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
import { sendVoucherEmail, sendGiftcardAdminEmail } from "./lib/mail.js";

import { transferStore } from "./lib/transferStore.js";

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

// Transfer info endpoint (transfer.html ezt hívja)
app.get("/api/transfer-info", (req, res) => {
  const id = String(req.query.id || "").trim();
  if (!id) return res.status(400).json({ error: "Missing id" });

  const intent = transferStore.get(id);
  if (!intent) return res.status(404).json({ error: "Unknown id" });

  res.json({
    kind: intent.kind,
    amount: intent.amount,
    currency: intent.currency || "HUF",
    notice: intent.notice,

    beneficiary: process.env.TRANSFER_BENEFICIARY || "",
    bankName: process.env.TRANSFER_BANK_NAME || "",
    account: process.env.TRANSFER_ACCOUNT || "",
    iban: process.env.TRANSFER_IBAN || "",
    swift: process.env.TRANSFER_SWIFT || "",
  });
});



// =========================
// 🎁 GIFT CARD – CSAK ÁTUTALÁS (TRANSFER) + KÓD A KÖZLEMÉNYBE
// =========================

function makeId(prefix = "gift") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Banki közleménynek rövid, egyedi kód (csupa nagybetű, kötőjellel)
function makeVoucherBase() {
  // 6 karakteres, nagybetűs alfanumerikus
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GIFT-${code}`;
}
app.get("/api/giftcard/admin/mark-paid", async (req, res) => {
  try {
    const id = String(req.query.id || "").trim();
    const token = String(req.query.token || "").trim();

    if (!id) return res.status(400).send("Missing id");
    if (!process.env.ADMIN_TOKEN) return res.status(500).send("ADMIN_TOKEN not set");
    if (token !== process.env.ADMIN_TOKEN) return res.status(403).send("Forbidden");

    const intent = transferStore.get(id);
    if (!intent) return res.status(404).send("Unknown id");
    if (intent.kind !== "giftcard") return res.status(400).send("Not a giftcard");

    if (intent.generatedAt) {
      return res.send("⚠️ Már korábban generálva lett.");
    }

    const { name, names, email, unitAmount, quantity } = intent.meta;
    const voucherBase = intent.voucherBase || intent.notice;

    const namesToUse = Array.isArray(names) && names.length > 0
      ? names
      : Array.from({ length: quantity }, () => name);

    const attachments = [];

    for (let i = 0; i < quantity; i++) {
      const voucherName = namesToUse[i] || name;
      const serial = `${voucherBase}-${String(i + 1).padStart(2, "0")}`;

      const { outPath } = await fillVoucherDesign(voucherName, unitAmount, serial);

      attachments.push({ path: outPath, serial });
    }

    await sendVoucherEmail(email, name, attachments);

    intent.generatedAt = Date.now();
    transferStore.set(id, intent);

    res.send("✅ Voucher legenerálva és elküldve emailben.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Szerver hiba: " + String(err?.message || err));
  }
});

// 1) átutalás indítása (intent létrehozás) + redirect transfer.html-re
app.post("/api/giftcard/start-payment", async (req, res) => {
  const { name, names, email, amount, quantity } = req.body;

  if (!email || !amount || !quantity) {
    return res.status(400).json({ error: "Hiányzó adatok" });
  }

  const unitAmount = Number(amount);
  const qty = Number(quantity);

  const cleanNames = Array.isArray(names)
    ? names.map(n => String(n || "").trim()).filter(Boolean)
    : [String(name || "").trim()].filter(Boolean);

  if (cleanNames.length !== qty) {
    return res.status(400).json({
      error: "A megadott nevek száma nem egyezik a mennyiséggel"
    });
  }

  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    return res.status(400).json({ error: "Érvénytelen összeg" });
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ error: "Érvénytelen mennyiség" });
  }

  const total = unitAmount * qty;

  const id = makeId("gift");
  const voucherBase = makeVoucherBase();
  const notice = voucherBase;

  transferStore.set(id, {
    kind: "giftcard",
    amount: total,
    currency: "HUF",
    notice,
    voucherBase,
    meta: {
      name: cleanNames[0],
      names: cleanNames,
      email: String(email).trim(),
      unitAmount,
      quantity: qty,
    },
    createdAt: Date.now(),
  });

  const baseUrl = process.env.PUBLIC_URL;
  const approveUrl =
    `${baseUrl}/api/giftcard/admin/mark-paid` +
    `?id=${encodeURIComponent(id)}` +
    `&token=${encodeURIComponent(process.env.ADMIN_TOKEN || "")}`;

  try {
    await sendGiftcardAdminEmail(transferStore.get(id), approveUrl);
  } catch (e) {
    console.error("Admin email send failed:", e?.message || e);
  }

  return res.json({
    redirectUrl: `/transfer.html?id=${encodeURIComponent(id)}`,
    id,
  });
});



// 2) Voucher generálás + email küldés (CSAK id alapján)
/*app.post("/api/giftcard/generate", (_req, res) => {
  return res.status(410).json({ success: false, error: "Disabled. Use admin/mark-paid." });
});*/




// szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const base = process.env.PUBLIC_URL;
  console.log(`Server running on ${base}`);
});


