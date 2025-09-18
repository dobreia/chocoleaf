import express from "express";
import fetch from "node-fetch"

const app = express();
app.use(express.json());

app.post("/api/create-booking", async (req, res) => {
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
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));