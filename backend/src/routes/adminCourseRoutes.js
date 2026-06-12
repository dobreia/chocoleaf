const express = require("express");
const CoursesController = require("../controllers/CoursesController");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const courses = await CoursesController.getAllAdmin();

        res.json(courses);
    } catch (error) {
        console.error("ADMIN COURSES ROUTE ERROR:", error);

        res.status(500).json({
            message: "Hiba történt az admin kurzusok lekérésekor.",
        });
    }
});

router.post("/", async (req, res) => {
    const data = await CoursesController.create(req.body);

    if (data.error) {
        return res.status(data.status).json({
            message: data.error,
        });
    }

    res.status(201).json(data);
});

router.put("/:id", async (req, res) => {
    const data = await CoursesController.update(req.params.id, req.body);

    if (data.error) {
        return res.status(data.status).json({
            message: data.error,
        });
    }

    res.json(data);
});

router.delete("/:id", async (req, res) => {
    const data = await CoursesController.delete(req.params.id);

    if (data.error) {
        return res.status(data.status).json({
            message: data.error,
        });
    }

    res.json(data);
});

module.exports = router;