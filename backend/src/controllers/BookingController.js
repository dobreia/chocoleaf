const pool = require("../db");

const BOOKING_STATUSES_WITH_HELD_CAPACITY = ["pending", "confirmed"];

class BookingController {
    static async initSchema() {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT,
                seats INTEGER NOT NULL DEFAULT 1,
                note TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                payment_status TEXT NOT NULL DEFAULT 'pending',
                payment_method TEXT NOT NULL DEFAULT 'transfer',
                total_price INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seats INTEGER NOT NULL DEFAULT 1`);
        await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS note TEXT`);
        await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'`);
        await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'transfer'`);
        await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price INTEGER NOT NULL DEFAULT 0`);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_course_id
            ON bookings(course_id)
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_status
            ON bookings(status)
        `);
    }

    static async getAvailability({ courseId, year, month }) {
        const filters = ["c.active = true"];
        const params = [];

        if (courseId) {
            params.push(courseId);
            filters.push(`
                c.title = (
                    SELECT selected_course.title
                    FROM courses selected_course
                    WHERE selected_course.id = $${params.length}
                    LIMIT 1
                )
            `);
        }

        if (year && month) {
            const start = `${year}-${String(month).padStart(2, "0")}-01`;
            params.push(start);
            filters.push(`c.start_time >= $${params.length}::date`);

            params.push(start);
            filters.push(`c.start_time < ($${params.length}::date + INTERVAL '1 month')`);
        }

        const result = await pool.query(
            `
            SELECT
                c.id,
                c.title,
                c.description,
                c.start_time,
                c.end_time,
                c.price,
                c.capacity,
                COALESCE(COUNT(b.id) FILTER (
                    WHERE b.status = ANY($${params.length + 1})
                ), 0)::int AS booked_count
            FROM courses c
            LEFT JOIN bookings b ON b.course_id = c.id
            WHERE ${filters.join(" AND ")}
            GROUP BY c.id
            ORDER BY c.start_time ASC
            `,
            [...params, BOOKING_STATUSES_WITH_HELD_CAPACITY]
        );

        return result.rows.map((course) => {
            const capacity = Number(course.capacity) || 0;
            const bookedCount = Number(course.booked_count) || 0;

            return {
                ...course,
                booked_count: bookedCount,
                available_spots: Math.max(capacity - bookedCount, 0),
                is_available: capacity - bookedCount > 0,
            };
        });
    }

    static validateBookingData(data) {
        const {
            courseId,
            customerName,
            customerEmail,
            customerPhone,
            note,
            paymentMethod = "transfer",
        } = data;

        if (!courseId) return { status: 400, error: "Hiányzó képzés azonosító." };
        if (!customerName || !customerName.trim()) return { status: 400, error: "A név megadása kötelező." };
        if (!customerEmail || !customerEmail.trim()) return { status: 400, error: "Az email cím megadása kötelező." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
            return { status: 400, error: "Az email cím formátuma hibás." };
        }

        if (paymentMethod !== "transfer") {
            return { status: 400, error: "Jelenleg csak átutalásos fizetés választható." };
        }

        return {
            courseId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: String(customerPhone || "").trim(),
            note: String(note || "").trim(),
            paymentMethod,
        };
    }

    static async createBooking(data) {
        const validation = this.validateBookingData(data);
        if (validation.error) return validation;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const courseResult = await client.query(
                `
                SELECT *
                FROM courses
                WHERE id = $1 AND active = true
                FOR UPDATE
                `,
                [validation.courseId]
            );

            if (courseResult.rows.length === 0) {
                await client.query("ROLLBACK");
                return { status: 404, error: "A kiválasztott időpont nem található." };
            }

            const course = courseResult.rows[0];
            const bookingCountResult = await client.query(
                `
                SELECT COUNT(*)::int AS booked_count
                FROM bookings
                WHERE course_id = $1
                    AND status = ANY($2)
                `,
                [validation.courseId, BOOKING_STATUSES_WITH_HELD_CAPACITY]
            );
            const bookedCount = Number(bookingCountResult.rows[0]?.booked_count) || 0;
            const availableSpots = Number(course.capacity) - bookedCount;

            if (availableSpots <= 0) {
                await client.query("ROLLBACK");
                return { status: 409, error: "Erre az időpontra már nincs szabad hely." };
            }

            const insertResult = await client.query(
                `
                INSERT INTO bookings (
                    course_id,
                    customer_name,
                    customer_email,
                    customer_phone,
                    seats,
                    note,
                    status,
                    payment_status,
                    payment_method,
                    total_price
                )
                VALUES ($1, $2, $3, $4, 1, $5, 'pending', 'pending', $6, $7)
                RETURNING *
                `,
                [
                    validation.courseId,
                    validation.customerName,
                    validation.customerEmail,
                    validation.customerPhone,
                    validation.note,
                    validation.paymentMethod,
                    Number(course.price) || 0,
                ]
            );

            await client.query("COMMIT");

            return {
                booking: insertResult.rows[0],
                course,
                available_spots: availableSpots - 1,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("BOOKING CREATE ERROR:", error);
            return { status: 500, error: "A foglalás mentése nem sikerült." };
        } finally {
            client.release();
        }
    }
}

module.exports = BookingController;
