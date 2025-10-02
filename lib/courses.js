import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURSES_PATH =
    process.env.COURSES_PATH ||
    path.join(__dirname, "..", "data", "courses.json");

let cache = null;
let mtimeMs = 0;

async function loadFile() {
    const stat = await fsp.stat(COURSES_PATH);
    if (stat.mtimeMs !== mtimeMs || !cache) {
        const raw = await fsp.readFile(COURSES_PATH, "utf8");
        cache = JSON.parse(raw);
        mtimeMs = stat.mtimeMs;
        // egyszerű normalizálás
        for (const [slug, c] of Object.entries(cache)) {
            c.id ||= slug;
            c.title ||= slug;
            c.currency ||= "HUF";
            if (typeof c.priceHUF !== "number") throw new Error(`priceHUF hiányzik vagy nem szám: ${slug}`);
            c.active = c.active !== false;
        }
    }
    return cache;
}

export async function initCoursesWatcher() {
    await loadFile(); // első betöltés
    try {
        fs.watch(COURSES_PATH, { persistent: false }, async () => {
            try { await loadFile(); console.log("[courses] reloaded"); } catch (e) { console.error(e); }
        });
    } catch (e) {
        console.warn("[courses] fs.watch nem elérhető, kézi újraindítás szükséges módosításkor.");
    }
}

export async function getCourseBySlug(slug) {
    const data = await loadFile();
    const c = data?.[slug];
    if (!c || !c.active) return null;
    return c;
}

export async function listCourses() {
    const data = await loadFile();
    return Object.values(data).filter(c => c.active);
}
