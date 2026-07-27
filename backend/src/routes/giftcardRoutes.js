const express = require("express");
const { fillVoucherDesign } = require("../lib/fillVoucher");
const { sendGiftcardAdminEmail, sendVoucherEmail } = require("../lib/mail");
const { makeIntentId, transferStore } = require("../lib/transferStore");

const router = express.Router();

function makeVoucherBase() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `GIFT-${code}`;
}

function getBaseUrl(req) {
    const configured = process.env.BACKEND_PUBLIC_URL || process.env.API_PUBLIC_URL;
    if (configured) return configured.replace(/\/$/, "");
    return `${req.protocol}://${req.get("host")}`;
}

router.post("/start-payment", async (req, res) => {
    const {
        name,
        names,
        email,
        amount,
        quantity,
        billingData,
        paymentMethod = "transfer",
    } = req.body;

    if (paymentMethod !== "transfer") {
        return res.status(400).json({ error: "A Barion fizetés még nincs bekötve." });
    }

    if (!email || !amount || !quantity) {
        return res.status(400).json({ error: "Hiányzó adatok" });
    }

    if (!billingData || !billingData.buyerType) {
        return res.status(400).json({ error: "Hiányzó számlázási adatok" });
    }

    if (billingData.buyerType === "company") {
        if (!billingData.companyName || !billingData.companyAddress || !billingData.taxNumber) {
            return res.status(400).json({ error: "Hiányzó céges számlázási adatok" });
        }
    } else if (!billingData.privateName || !billingData.privateAddress) {
        return res.status(400).json({ error: "Hiányzó magánszemély számlázási adatok" });
    }

    const unitAmount = Number(amount);
    const qty = Number(quantity);

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        return res.status(400).json({ error: "Érvénytelen összeg" });
    }

    if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: "Érvénytelen mennyiség" });
    }

    const cleanNames = Array.isArray(names)
        ? names.map((item) => String(item || "").trim()).filter(Boolean)
        : [String(name || "").trim()].filter(Boolean);

    if (cleanNames.length !== qty) {
        return res.status(400).json({
            error: "A megadott nevek száma nem egyezik a mennyiséggel",
        });
    }

    const id = makeIntentId("gift");
    const voucherBase = makeVoucherBase();
    const notice = voucherBase;

    transferStore.set(id, {
        kind: "giftcard",
        amount: unitAmount * qty,
        currency: "HUF",
        notice,
        voucherBase,
        meta: {
            name: cleanNames[0],
            names: cleanNames,
            email: String(email).trim(),
            unitAmount,
            quantity: qty,
            billingData,
            paymentMethod,
        },
        createdAt: Date.now(),
    });

    const approveUrl =
        `${getBaseUrl(req)}/api/giftcard/admin/mark-paid` +
        `?id=${encodeURIComponent(id)}` +
        `&token=${encodeURIComponent(process.env.ADMIN_TOKEN || "")}`;

    try {
        await sendGiftcardAdminEmail(transferStore.get(id), approveUrl);
    } catch (error) {
        console.error("Admin email send failed:", error?.message || error);
    }

    res.json({
        id,
        redirectUrl: `/transfer?id=${encodeURIComponent(id)}`,
    });
});

router.get("/admin/mark-paid", async (req, res) => {
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
            return res.send("Már korábban generálva lett.");
        }

        const { name, names, email, unitAmount, quantity } = intent.meta;
        const namesToUse = Array.isArray(names) && names.length > 0
            ? names
            : Array.from({ length: quantity }, () => name);
        const voucherBase = intent.voucherBase || intent.notice;
        const attachments = [];

        for (let index = 0; index < quantity; index += 1) {
            const voucherName = namesToUse[index] || name;
            const serial = `${voucherBase}-${String(index + 1).padStart(2, "0")}`;
            const { outPath } = await fillVoucherDesign(voucherName, unitAmount, serial);
            attachments.push({ path: outPath, serial });
        }

        await sendVoucherEmail(email, name, attachments);

        intent.generatedAt = Date.now();
        transferStore.set(id, intent);

        res.send("Voucher legenerálva és elküldve emailben.");
    } catch (error) {
        console.error(error);
        res.status(500).send(`Szerver hiba: ${String(error?.message || error)}`);
    }
});

router.post("/generate", (req, res) => {
    res.status(410).json({
        success: false,
        error: "Disabled. Use admin/mark-paid.",
    });
});

module.exports = router;
