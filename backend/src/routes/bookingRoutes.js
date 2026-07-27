const express = require("express");
const BookingController = require("../controllers/BookingController");

const router = express.Router();

router.get("/availability", async (req, res) => {
    try {
        const { courseId, year, month } = req.query;
        const availability = await BookingController.getAvailability({
            courseId,
            year: year ? Number(year) : null,
            month: month ? Number(month) : null,
        });

        res.json(availability);
    } catch (error) {
        console.error("BOOKING AVAILABILITY ROUTE ERROR:", error);
        res.status(500).json({ message: "Nem sikerült lekérni a szabad időpontokat." });
    }
});

router.post("/", async (req, res) => {
    const result = await BookingController.createBooking(req.body);

    if (result.error) {
        return res.status(result.status).json({ message: result.error });
    }

    res.status(201).json(result);
});

module.exports = router;
