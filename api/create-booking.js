export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Csak POST engedélyezett" });
  }

  try {
    const response = await fetch("https://api.cal.com/v1/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.CALCOM_API_KEY
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Hiba a Cal.com API hívásnál", details: err.message });
  }
}
