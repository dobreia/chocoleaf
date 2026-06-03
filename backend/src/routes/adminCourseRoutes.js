const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      price,
      capacity = 6,
    } = req.body;

    if (!title || !start_time || !end_time || !price) {
      return res.status(400).json({
        message: "Cím, kezdési idő, befejezési idő és ár megadása kötelező.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO courses (
        title,
        description,
        start_time,
        end_time,
        price,
        capacity
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [title, description, start_time, end_time, price, capacity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;