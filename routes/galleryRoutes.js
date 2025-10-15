import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/api/gallery", (req, res) => {
    const galleryDir = path.join(__dirname, "../public/assets/gallery");
    fs.readdir(galleryDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Nem sikerült beolvasni a képeket." });
        }

        const images = files
            .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            .map(f => `/assets/gallery/${f}`);

        res.json(images);
    });
});

export default router;
