export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Csak POST engedélyezett" });
  }

  try {
    const booking = req.body;

    console.log("Új webhook esemény:", booking);

    // Példa: foglalás metaadat ellenőrzés
    // Ha még nincs paymentStatus, akkor töröld
    if (!booking.metadata || booking.metadata.paymentStatus !== "paid") {
      // Foglalás törlése a Cal.com API-val
      await fetch(`https://api.cal.com/v1/bookings/${booking.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`
        }
      });

      return res.status(200).json({ message: "Foglalás törölve, mert nem volt fizetés." });
    }

    return res.status(200).json({ message: "Foglalás rendben van." });

  } catch (err) {
    console.error("Webhook hiba:", err);
    return res.status(500).json({ error: "Webhook feldolgozási hiba", details: err.message });
  }
}
