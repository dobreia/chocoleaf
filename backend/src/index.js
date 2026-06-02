const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);


const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});