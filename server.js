import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import barionRoutes from "./routes/barion.js";
import calRoutes from "./routes/cal.js";
import { initCoursesWatcher, listCourses } from "./lib/courses.js";

import galleryRoutes from "./routes/galleryRoutes.js";


const app = express();

// ha ngrok / reverse proxy mögött fut
app.set("trust proxy", true);

// __dirname pótlás ESM-ben
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// statikus fájlok (public/)
app.use(express.static(path.join(__dirname, "public")));

app.use(galleryRoutes);

// kurzus-adatbázis betöltése + fájlfigyelés (nem blokkoló)
try {
  initCoursesWatcher();
  console.log("[courses] watcher initialized");
} catch (e) {
  console.warn("[courses] init failed:", e?.message || e);
}

// debug/ellenőrző endpoint — aktuális aktív kurzusok
app.get("/api/courses", async (_req, res) => {
  try {
    const courses = await listCourses();
    res.json(courses);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// API útvonalak
app.use("/api/barion", barionRoutes);
app.use("/api/cal", calRoutes);

// egyszerű healthcheck
app.get("/health", (_req, res) => res.status(200).send("OK"));

// root -> public/index.html (ha létezik)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const base = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
  console.log(`Server running on ${base}`);
});
