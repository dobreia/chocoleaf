const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const BookingController = require("./controllers/BookingController");

const app = express();


app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

const adminCourseRoutes = require("./routes/adminCourseRoutes");
app.use("/api/admin/courses", adminCourseRoutes);

const adminBookingRoutes = require("./routes/adminBookingRoutes");
app.use("/api/admin/bookings", adminBookingRoutes);

const galleryRoutes = require("./routes/galleryRoutes");
app.use("/api/gallery", galleryRoutes);

const transferRoutes = require("./routes/transferRoutes");
app.use("/api/transfer-info", transferRoutes);

const giftcardRoutes = require("./routes/giftcardRoutes");
app.use("/api/giftcard", giftcardRoutes);

const PORT = process.env.PORT || 3001;

BookingController.initSchema()
    .catch((error) => {
        console.error("BOOKING SCHEMA INIT ERROR:", error);
    })
    .finally(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
