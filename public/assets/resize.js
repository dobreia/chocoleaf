import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputFolder = "gallery";  // képek mappája
const maxWidth = 300;
const maxHeight = 250;

// beolvassuk a fájlokat
const files = fs.readdirSync(inputFolder).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
});

// meglévő imgN fájlok legnagyobb száma
let maxIndex = 0;
for (const file of files) {
    const match = file.match(/^img(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
    }
}

let counter = maxIndex + 1;

for (const file of files) {
    // ha már imgN formátumú, akkor kihagyjuk
    if (/^img\d+\.(jpg|jpeg|png|webp)$/i.test(file)) {
        continue;
    }

    const inputPath = path.join(inputFolder, file);
    const newName = `img${counter}.jpg`; // konvertáljuk egységesen JPG-re
    const newPath = path.join(inputFolder, newName);

    try {
        const data = await sharp(inputPath)
            .resize({ width: maxWidth, height: maxHeight, fit: "inside" })
            .jpeg({ quality: 90 }) // mindenből JPG lesz
            .toBuffer();

        fs.writeFileSync(newPath, data);
        fs.unlinkSync(inputPath); // régi törlése

        console.log(`✅ ${file} → ${newName}`);
        counter++;
    } catch (err) {
        console.error(`❌ Hiba: ${file}`, err);
    }
}
