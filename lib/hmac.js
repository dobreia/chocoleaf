import crypto from "crypto";

// Cal.com webhook verification (HMAC SHA256 over raw body)
// Header: x-cal-signature-256 = sha256=<hexdigest>
export function verifyCalSignature(signatureHeader, rawBody) {
    try {
        if (!signatureHeader || !rawBody) return false;
        const secret = process.env.CAL_WEBHOOK_SECRET;
        if (!secret) return false;

        const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
        const provided = signatureHeader.replace("sha256=", "");
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
        return false;
    }
}

// Barion IPN signature verification.
// Ha a 'Barion-Signature' header nincs beállítva a fiókodban, engedünk (true).
export function verifyBarionSignature(req) {
    try {
        const sig = req.headers["barion-signature"];
        if (!sig) return true; // allow if not provided
        const body = JSON.stringify(req.body);
        const expected = crypto
            .createHmac("sha256", process.env.BARION_POSKEY)
            .update(body, "utf8")
            .digest("hex");
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    } catch {
        return false;
    }
}
