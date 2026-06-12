const express = require("express");
const CoursesController = require("../controllers/CoursesController");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const courses = await CoursesController.getAllPublic();

    res.json(courses);
  } catch (error) {
    console.error("PUBLIC COURSES ROUTE ERROR:", error);

    res.status(500).json({
      message: "Hiba történt a kurzusok lekérésekor.",
    });
  }
});

module.exports = router;