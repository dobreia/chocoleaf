const pool = require("../db");

class CoursesController {
  static validateCourseData(data) {
    const {
      title,
      start_time,
      end_time,
      price,
      capacity,
      active,
    } = data;

    if (!title || title.trim() === "") {
      return {
        error: "A kurzus címe kötelező.",
        status: 400,
      };
    }

    if (!start_time) {
      return {
        error: "A kezdési idő megadása kötelező.",
        status: 400,
      };
    }

    if (!end_time) {
      return {
        error: "A befejezési idő megadása kötelező.",
        status: 400,
      };
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (Number.isNaN(startDate.getTime())) {
      return {
        error: "A kezdési idő formátuma hibás.",
        status: 400,
      };
    }

    if (Number.isNaN(endDate.getTime())) {
      return {
        error: "A befejezési idő formátuma hibás.",
        status: 400,
      };
    }

    if (endDate <= startDate) {
      return {
        error: "A befejezési időnek későbbinek kell lennie, mint a kezdési idő.",
        status: 400,
      };
    }

    if (price === "" || price === null || price === undefined || Number.isNaN(Number(price))) {
      return {
        error: "Az ár megadása kötelező.",
        status: 400,
      };
    }

    if (Number(price) <= 0) {
      return {
        error: "Az árnak pozitív számnak kell lennie.",
        status: 400,
      };
    }

    if (
      capacity === "" ||
      capacity === null ||
      capacity === undefined ||
      Number.isNaN(Number(capacity))
    ) {
      return {
        error: "A kapacitás megadása kötelező.",
        status: 400,
      };
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return {
        error: "A kapacitásnak pozitív egész számnak kell lennie.",
        status: 400,
      };
    }

    if (active !== undefined && typeof active !== "boolean") {
      return {
        error: "Az aktív státusznak igaz/hamis értéknek kell lennie.",
        status: 400,
      };
    }

    return null;
  }

  static async getAllPublic() {
    const result = await pool.query(`
      SELECT *
      FROM courses
      WHERE active = true
      ORDER BY start_time ASC
    `);

    return result.rows;
  }

  static async getAllAdmin() {
    const result = await pool.query(`
      SELECT *
      FROM courses
      ORDER BY start_time DESC
    `);

    return result.rows;
  }

  static async create(data) {
    const validationError = this.validateCourseData(data);

    if (validationError) {
      return validationError;
    }

    const {
      title,
      description,
      start_time,
      end_time,
      price,
      capacity,
      active = true,
    } = data;

    try {
      const result = await pool.query(
        `
        INSERT INTO courses (
          title,
          description,
          start_time,
          end_time,
          price,
          capacity,
          active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          title.trim(),
          description || "",
          start_time,
          end_time,
          Number(price),
          Number(capacity),
          active,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error("COURSE CREATE ERROR:", error);

      return {
        error: "A kurzus létrehozása nem sikerült.",
        status: 500,
      };
    }
  }

  static async update(id, data) {
    const validationError = this.validateCourseData(data);

    if (validationError) {
      return validationError;
    }

    const {
      title,
      description,
      start_time,
      end_time,
      price,
      capacity,
      active,
    } = data;

    try {
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
          title.trim(),
          description || "",
          start_time,
          end_time,
          Number(price),
          Number(capacity),
          active,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return {
          error: "A kurzus nem található.",
          status: 404,
        };
      }

      return result.rows[0];
    } catch (error) {
      console.error("COURSE UPDATE ERROR:", error);

      return {
        error: "A kurzus módosítása nem sikerült.",
        status: 500,
      };
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        `
        DELETE FROM courses
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return {
          error: "A kurzus nem található.",
          status: 404,
        };
      }

      return {
        message: "A kurzus sikeresen törölve.",
        course: result.rows[0],
      };
    } catch (error) {
      console.error("COURSE DELETE ERROR:", error);

      return {
        error: "A kurzus törlése nem sikerült.",
        status: 500,
      };
    }
  }
}

module.exports = CoursesController;