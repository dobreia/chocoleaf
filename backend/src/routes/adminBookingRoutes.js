const express = require("express");
const pool = require("../db");

const router = express.Router();

const allowedStatuses = ["pending", "confirmed", "cancelled"];
const allowedPaymentStatuses = ["pending", "paid", "refunded", "failed"];

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.id,
                b.course_id,
                b.customer_name,
                b.customer_email,
                b.customer_phone,
                b.seats,
                b.note,
                b.status,
                b.payment_status,
                b.payment_method,
                b.total_price,
                b.created_at,
                c.title AS course_title,
                c.start_time,
                c.end_time,
                c.capacity
            FROM bookings b
            JOIN courses c ON c.id = b.course_id
            ORDER BY c.start_time DESC, b.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("ADMIN BOOKINGS ROUTE ERROR:", error);
        res.status(500).json({
            message: "Nem sikerült lekérni a foglalásokat.",
        });
    }
});

router.patch("/:id", async (req, res) => {
    const { status, payment_status } = req.body;

    if (status !== undefined && !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Érvénytelen foglalási státusz." });
    }

    if (payment_status !== undefined && !allowedPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({ message: "Érvénytelen fizetési státusz." });
    }

    try {
        const result = await pool.query(
            `
            UPDATE bookings
            SET
                status = COALESCE($1, status),
                payment_status = COALESCE($2, payment_status)
            WHERE id = $3
            RETURNING *
            `,
            [status ?? null, payment_status ?? null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "A foglalás nem található." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("ADMIN BOOKING UPDATE ERROR:", error);
        res.status(500).json({
            message: "Nem sikerült frissíteni a foglalást.",
        });
    }
});

module.exports = router;
