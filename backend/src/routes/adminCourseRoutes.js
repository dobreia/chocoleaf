const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT *
      FROM courses
      ORDER BY start_time DESC
    `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      start_time,
      end_time,
      price,
      capacity,
      active,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE courses
      SET
        title = $1,
        description = $2,
        start_time = $3,
        end_time = $4,
        price = $5,
        capacity = $6,
        active = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        title,
        description,
        start_time,
        end_time,
        price,
        capacity,
        active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kurzus nem található." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
      UPDATE courses
      SET active = false
      WHERE id = $1
      RETURNING *
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Kurzus nem található." });
        }

        res.json({
            message: "Kurzus inaktiválva.",
            course: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;