import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import path from "path";
import { fileURLToPath } from "url";


export async function fillVoucherDesign(recipientText) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const pdfPath = path.join(__dirname, "../public/assets/voucher/utalvany_ures_fillable.pdf");
    const bytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false });
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();
    const fontPath = path.join(__dirname, "../public/assets/fonts/bellaboo-1.ttf");
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const fontPath2 = path.join(__dirname, "../public/assets/fonts/OpenSans-Bold.ttf");
    const fontBytes2 = fs.readFileSync(fontPath2);
    const dateFont = await pdfDoc.embedFont(fontBytes2);


    form.deleteXFA?.();

    const recipient = form.getTextField("recipient");
    const serial = form.getTextField("serial");
    const valid = form.getTextField("valid_until");

    // --- Helper: mező rect ---
    const getRect = (field) => {
        const acro = field.acroField ?? field;
        const widget = acro.getWidgets()[0];
        const rect = widget.getRectangle?.() ?? widget.getRect?.();
        if (!rect) throw new Error("Nem sikerült rect-et kiolvasni");

        const { x, y, width, height } = Array.isArray(rect)
            ? { x: rect[0], y: rect[1], width: rect[2] - rect[0], height: rect[3] - rect[1] }
            : rect;

        return { x, y, width, height };
    };

    // --- Segédfüggvény: szöveg rajzolása ---
    const drawTextCustom = (field, text, fontSize, align, color, page, yOffset = 0, font = customFont) => {
        const { x, y, width, height } = getRect(field);
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let drawX = x;
        if (align === "right") {
            drawX = x + width - textWidth;
        } else if (align === "center") {
            drawX = x + (width - textWidth) / 2;
        }

        const baseline = y + (height - fontSize) / 2;
        page.drawText(text, {
            x: drawX,
            y: baseline + 2 + yOffset,
            size: fontSize,
            font,          // itt már paraméterből jön
            color,
        });
    };


    // --- Adatok ---
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setMonth(validUntil.getMonth() + 3);

    // magyar formátum pl.
    const validText = validUntil.toISOString().split("T")[0];
    // vagy pl.: validUntil.toLocaleDateString("hu-HU")


    const pages = pdfDoc.getPages();

    const recipientYOffset = 3;
    const serialYOffset = 3;
    const validYOffset = 1;

    function generateSerial() {
        const today = new Date();

        // dátum: YYMMDD
        const yy = today.getFullYear().toString().slice(-2);
        const mm = (today.getMonth() + 1).toString().padStart(2, "0");
        const dd = today.getDate().toString().padStart(2, "0");
        const datePart = `${yy}${mm}${dd}`;

        // fájlok listázása
        const dir = path.join(__dirname, "../public/assets/voucher");
        const files = fs.readdirSync(dir).filter(f => f.startsWith("filled_voucher_"));

        // csak az adott napi fájlokat számoljuk
        const todays = files.filter(f => f.includes(`filled_voucher_${datePart}`));

        // következő napi sorszám
        const next = todays.length > 0 ? todays.length + 1 : 1;

        // összeállítjuk a serialt
        return `${datePart}-${next}`;
    }

    // Rajzolások
    const serialText = generateSerial();
    drawTextCustom(recipient, recipientText, 20, "center", rgb(1, 1, 1), pages[0], recipientYOffset);
    drawTextCustom(serial, serialText, 14, "right", rgb(1, 1, 1), pages[0], serialYOffset);
    drawTextCustom(serial, serialText, 14, "right", rgb(1, 1, 1), pages[1], serialYOffset);
    drawTextCustom(valid, validText, 15, "center", rgb(1, 1, 1), pages[1], validYOffset, dateFont);

    // --- Töröljük a form mezőket teljesen ---
    form.removeField(recipient);
    form.removeField(serial);
    form.removeField(valid);

    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, `../public/assets/voucher/filled_voucher_${serialText}.pdf`);
    fs.writeFileSync(outPath, out);

    console.log("Voucher kész:", outPath, "Serial:", serialText);



}

