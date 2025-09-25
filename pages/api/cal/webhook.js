import { verifyCalSignature } from "@/lib/hmac";

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
    return new Promise((resolve) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

export default async function handler(req, res) {
    const body = await rawBody(req);
    const signature = req.headers["x-cal-signature-256"];

    if (!verifyCalSignature(signature, body)) {
        return res.status(401).send("Invalid signature");
    }

    const data = JSON.parse(body.toString());
    console.log("Cal webhook event:", data.triggerEvent, data.payload);

    // itt nem mentjük DB-be → csak logolunk
    res.status(200).end("ok");
}
