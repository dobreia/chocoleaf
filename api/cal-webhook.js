import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Csak POST engedélyezett" });
    }

    const secret = process.env.CALCOM_WEBHOOK_SECRET;
    const signature = req.headers["x-cal-signature"];

    // Ellenőrizzük az aláírást
    const computed = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (signature !== computed) {
        return res.status(401).json({ error: "Érvénytelen webhook aláírás" });
    }

    try {
        const booking = req.body;
        console.log("Webhook érkezett:", booking);

        // Ha nincs fizetve → töröljük a foglalást
        if (!booking.metadata || booking.metadata.paymentStatus !== "paid") {
            await fetch(`https://api.cal.com/v1/bookings/${booking.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`
                }
            });

            return res.status(200).json({ message: "Foglalás törölve (nem fizetett)" });
        }

        return res.status(200).json({ message: "Foglalás jóváhagyva" });
    } catch (err) {
        console.error("Webhook hiba:", err);
        return res.status(500).json({ error: "Webhook feldolgozási hiba", details: err.message });
    }
}
