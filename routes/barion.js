// routes/barion.js
import express from "express";
import { getCourseBySlug } from "../lib/courses.js";
import { transferStore, makeIntentId } from "../lib/transferStore.js";

const router = express.Router();

function buildTransferNotice({ name, startTime, courseSlug, bookingUid }) {
    // Név – max 2 szó
    const safeName = (name || "")
        .split(" ")
        .slice(0, 2)
        .join(" ")
        .replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ ]/g, "")
        .trim();

    // Dátum: MM.DD
    let datePart = "";
    if (startTime) {
        const d = new Date(startTime);
        if (!isNaN(d)) {
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            datePart = `${mm}.${dd}`;
        }
    }

    // Kurzus ID / slug
    const safeCourse = (courseSlug || "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toUpperCase();

    return [safeName, datePart, safeCourse]
        .filter(Boolean)
        .join(" – ");
}



// Fizetés indítása (MOST: Barion helyett átutalás)
router.post("/start", async (req, res) => {
    try {
        const { bookingUid, course: courseSlug, name, email, startTime, endTime, eventName } = req.body || {};
        if (!bookingUid || !courseSlug) {
            return res.status(400).json({ error: "Hiányzó adatok (bookingUid, course kötelező)." });
        }

        const course = await getCourseBySlug(courseSlug);
        if (!course) return res.status(404).json({ error: `Ismeretlen vagy inaktív kurzus: ${courseSlug}` });

        const intentId = makeIntentId("book");
        const notice = buildTransferNotice({
            name,
            startTime,
            courseSlug,
            bookingUid,
        });




        transferStore.set(intentId, {
            kind: "booking",
            bookingUid,
            courseSlug,
            courseId: course.id,
            courseName: course.title,
            amount: course.priceHUF,
            currency: "HUF",
            notice,
            name: name || "",
            email: email || "",
            startTime: startTime || "",
            endTime: endTime || "",
            createdAt: Date.now(),
        });

        res.json({ redirectUrl: `/transfer.html?id=${encodeURIComponent(intentId)}` });
    } catch (e) {
        console.error("Transfer /start error", e);
        res.status(500).json({ error: String(e.message || e) });
    }
});

// IPN: Barion nélkül NO-OP (meghagyjuk későbbre)
router.post("/ipn", express.json(), async (req, res) => {
    console.log("IPN received, but Barion is disabled.");
    return res.sendStatus(200);
});

export default router;
