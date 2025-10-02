// routes/barion.js
import express from "express";
import { startPayment, getPaymentState } from "../lib/barion.js";
import { confirmBooking, cancelBooking } from "../lib/cal.js";
import { getCourseBySlug } from "../lib/courses.js";

const router = express.Router();

// Fizetés indítása (nem változott)
router.post("/start", async (req, res) => {
    try {
        const { bookingUid, course: courseSlug, name, email, startTime, endTime } = req.body || {};
        if (!bookingUid || !courseSlug) {
            return res.status(400).json({ error: "Hiányzó adatok (bookingUid, course kötelező)." });
        }
        const course = await getCourseBySlug(courseSlug);
        if (!course) return res.status(404).json({ error: `Ismeretlen vagy inaktív kurzus: ${courseSlug}` });

        const redirectUrl = await startPayment(bookingUid, {
            courseId: course.id,
            courseName: course.title,
            price: course.priceHUF,
            name, email, startTime, endTime,
        });

        res.json({ redirectUrl });
    } catch (e) {
        console.error("Barion /start error", e);
        res.status(500).json({ error: String(e.message || e) });
    }
});

// IPN: PaymentId -> GetPaymentState -> Cal confirm/cancel
router.post("/ipn", express.json(), async (req, res) => {
    try {
        console.log("---- IPN RAW BODY ----");
        console.log(JSON.stringify(req.body, null, 2));

        const paymentId = req.body?.PaymentId || req.body?.PaymentID || req.body?.paymentId;
        if (!paymentId) {
            console.warn("IPN without PaymentId");
            return res.sendStatus(200); // acknowledge, de nem tudunk mit tenni
        }

        // lekérdezzük az állapotot
        const state = await getPaymentState(paymentId);
        const status = state?.Status || state?.PaymentStatus; // Barion a GetPaymentState-ben tipikusan 'Status'-t ad
        const orderNumber = state?.OrderNumber || "";
        const bookingUid = orderNumber.replace(/^BOOK-/, "");

        console.log("IPN state:", { paymentId, status, orderNumber, bookingUid });

        if (!bookingUid) {
            console.warn("Missing bookingUid from OrderNumber:", orderNumber);
            return res.sendStatus(200);
        }

        if (status === "Succeeded") {
            try {
                const out = await confirmBooking(bookingUid);
                console.log("Cal confirm OK:", out?.status || out);
            } catch (err) {
                console.error("Cal confirm ERROR:", err?.message || err);
            }
        } else if (["Canceled", "Expired", "Failed"].includes(status)) {
            try {
                const out = await cancelBooking(bookingUid, `Barion status: ${status}`);
                console.log("Cal cancel OK:", out?.status || out);
            } catch (err) {
                console.error("Cal cancel ERROR:", err?.message || err);
            }
        } else {
            console.log("No action for status:", status);
        }

        res.sendStatus(200);
    } catch (e) {
        console.error("IPN processing error:", e);
        res.sendStatus(500);
    }
});

export default router;
