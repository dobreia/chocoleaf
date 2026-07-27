const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);

const adminCourseRoutes = require("./routes/adminCourseRoutes");
app.use("/api/admin/courses", adminCourseRoutes);

const galleryRoutes = require("./routes/galleryRoutes");
app.use("/api/gallery", galleryRoutes);

const transferRoutes = require("./routes/transferRoutes");
app.use("/api/transfer-info", transferRoutes);

const giftcardRoutes = require("./routes/giftcardRoutes");
app.use("/api/giftcard", giftcardRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
