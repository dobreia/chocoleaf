import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";

async function fillVoucherDesign() {
    const bytes = fs.readFileSync("../assets/voucher/utalvany_ures_fillable.pdf");
    const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false });
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();
    const fontBytes = fs.readFileSync("../assets/fonts/bellaboo-1.ttf");
    const customFont = await pdfDoc.embedFont(fontBytes);

    const fontBytes2 = fs.readFileSync("../assets/fonts/OpenSans-Bold.ttf");
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
    const recText = "Döbrei András Árpád";
    const valText = "2025.12.31.";

    const pages = pdfDoc.getPages();

    const recipientYOffset = 3;
    const serialYOffset = 3;
    const validYOffset = 1;

    let counter = 0;
    let serText = counter.toString().padStart(4, "0");
    while (fs.existsSync(`../assets/voucher/filled_voucher_${serText}.pdf`)) {
        counter++;
        serText = counter.toString().padStart(4, "0");
    }

    // Rajzolások
    drawTextCustom(recipient, recText, 20, "center", rgb(1, 1, 1), pages[0], recipientYOffset);
    drawTextCustom(serial, serText, 14, "right", rgb(1, 1, 1), pages[0], serialYOffset);
    drawTextCustom(serial, serText, 14, "right", rgb(1, 1, 1), pages[1], serialYOffset);
    drawTextCustom(valid, valText, 15, "center", rgb(1, 1, 1), pages[1], validYOffset, dateFont);

    // --- Töröljük a form mezőket teljesen ---
    form.removeField(recipient);
    form.removeField(serial);
    form.removeField(valid);

    const out = await pdfDoc.save();
    fs.writeFileSync(`../assets/voucher/filled_voucher_${serText}.pdf`, out);

    console.log("Voucher kész:", `../assets/voucher/filled_voucher_${serText}.pdf`);
}

fillVoucherDesign().catch(err => console.error("Hiba:", err));
