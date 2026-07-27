const express = require("express");
const { transferStore } = require("../lib/transferStore");

const router = express.Router();

router.get("/", (req, res) => {
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

module.exports = router;
