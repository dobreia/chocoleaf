import crypto from "crypto";

export const config = {
    api: {
        bodyParser: false, // így hozzáférsz a raw body-hoz
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Csak POST engedélyezett" });
    }

    const secret = process.env.CALCOM_WEBHOOK_SECRET;
    const signature = req.headers["x-cal-signature"];

    // raw body összegyűjtése
    let rawBody = "";
    for await (const chunk of req) {
        rawBody += chunk;
    }

    // Ellenőrzés
    const computed = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    if (signature !== computed) {
        return res.status(401).json({ error: "Érvénytelen webhook aláírás" });
    }

    try {
        const booking = JSON.parse(rawBody);
        console.log("Webhook érkezett:", booking);

        if (!booking.metadata || booking.metadata.paymentStatus !== "paid") {
            const del = await fetch(`https://api.cal.com/v1/bookings/${booking.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`,
                },
            });

            console.log("Delete response:", del.status, await del.text());
            return res.status(200).json({ message: "Foglalás törölve (nem fizetett)" });
        }

        return res.status(200).json({ message: "Foglalás jóváhagyva" });
    } catch (err) {
        console.error("Webhook hiba:", err);
        return res.status(500).json({ error: "Webhook feldolgozási hiba", details: err.message });
    }
}
