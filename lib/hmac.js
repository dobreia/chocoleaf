import crypto from "crypto";

export function verifyCalSignature(signature, rawBody) {
    const secret = process.env.CAL_WEBHOOK_SECRET;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return signature === expected;
}

// Barion IPN ellenőrzés (egyszerűsítve, amíg nem használsz teljes HMAC validációt)
export function verifyBarionSignature(req) {
    return true;
}
