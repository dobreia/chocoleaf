import express from "express";
import { confirmBooking, cancelBooking } from "../lib/cal.js";

const router = express.Router();

// Manual confirm (debug)
router.post("/:uid/confirm", async (req, res) => {
  try {
    const out = await confirmBooking(req.params.uid);
    res.json({ ok: true, out });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Manual cancel (debug)
router.post("/:uid/cancel", async (req, res) => {
  try {
    const out = await cancelBooking(req.params.uid, req.body?.reason);
    res.json({ ok: true, out });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
