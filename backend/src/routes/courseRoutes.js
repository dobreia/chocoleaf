const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        start_time,
        end_time,
        price,
        capacity,
        active,
        created_at
      FROM courses
      WHERE active = true
      ORDER BY start_time ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;