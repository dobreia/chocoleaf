const pool = require("../db");

const courseTemplates = [
    {
        title: "Csokoládé Alapélmény",
        description: "Az első lépés a csokoládékészítés világába.",
        price: 19000,
        capacity: 6,
        durationHours: 2,
        starts: [
            "2026-07-28T11:30:00",
            "2026-07-28T12:00:00",
            "2026-08-08T10:00:00",
            "2026-08-22T11:30:00",
            "2026-09-05T10:00:00",
        ],
    },
    {
        title: "Csokoládé Alkotóműhely",
        description: "Amikor a csokoládé már nem csak tábla, hanem alkotás.",
        price: 39900,
        capacity: 6,
        durationHours: 4,
        starts: [
            "2026-08-01T10:00:00",
            "2026-08-15T10:00:00",
            "2026-09-12T10:00:00",
        ],
    },
    {
        title: "Limitált Ízek Laborja",
        description: "Itt nincs szabály. Csak kíváncsiság.",
        price: 29000,
        capacity: 6,
        durationHours: 3,
        starts: [
            "2026-08-06T17:00:00",
            "2026-08-27T17:00:00",
            "2026-09-17T17:00:00",
        ],
    },
    {
        title: "Saját Csokoládé Mesterkurzus - Étcsokoládé",
        description: "Az intenzív, karakteres ízek szerelmeseinek.",
        price: 185900,
        capacity: 4,
        durationHours: 5,
        starts: [
            "2026-08-29T10:00:00",
            "2026-09-26T10:00:00",
        ],
    },
    {
        title: "Saját Csokoládé Mesterkurzus - Fehércsokoládé",
        description: "Ritka, különleges, kreatív.",
        price: 185900,
        capacity: 4,
        durationHours: 5,
        starts: [
            "2026-09-19T10:00:00",
            "2026-10-17T10:00:00",
        ],
    },
];

function addHours(isoDate, hours) {
    const date = new Date(isoDate);
    date.setHours(date.getHours() + hours);
    return date.toISOString().slice(0, 19);
}

async function seedCourses() {
    let insertedCount = 0;
    let skippedCount = 0;

    for (const template of courseTemplates) {
        for (const startTime of template.starts) {
            const existing = await pool.query(
                `
                SELECT id
                FROM courses
                WHERE title = $1
                    AND start_time = $2
                LIMIT 1
                `,
                [template.title, startTime]
            );

            if (existing.rows.length > 0) {
                skippedCount += 1;
                continue;
            }

            await pool.query(
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
                VALUES ($1, $2, $3, $4, $5, $6, true)
                `,
                [
                    template.title,
                    template.description,
                    startTime,
                    addHours(startTime, template.durationHours),
                    template.price,
                    template.capacity,
                ]
            );

            insertedCount += 1;
        }
    }

    return { insertedCount, skippedCount };
}

seedCourses()
    .then((result) => {
        console.log(`Courses seed complete. Inserted: ${result.insertedCount}, skipped: ${result.skippedCount}.`);
    })
    .catch((error) => {
        console.error("Courses seed failed:", error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
