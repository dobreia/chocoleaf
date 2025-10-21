import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";

async function fillVoucherDesign() {
    const bytes = fs.readFileSync("../assets/voucher/utalvany_ures_fillable.pdf");
    const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false });
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();
    const fontBytes = fs.readFileSync("../assets/fonts/BadScript-Regular.ttf");
    const customFont = await pdfDoc.embedFont(fontBytes);

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

    // --- Segédfüggvény: szöveg rajzolása + offset ---
    const drawTextCustom = (field, text, fontSize, align, color, page, yOffset = 0) => {
        const { x, y, width, height } = getRect(field);
        field.setText(""); // ürítjük a form mezőt
        const textWidth = customFont.widthOfTextAtSize(text, fontSize);

        let drawX = x;
        if (align === "right") {
            drawX = x + width - textWidth;
        } else if (align === "center") {
            drawX = x + (width - textWidth) / 2;
        }

        const baseline = y + (height - fontSize) / 2;
        page.drawText(text, {
            x: drawX,
            y: baseline + 2 + yOffset,   // itt adódik hozzá a finomhangolás
            size: fontSize,
            font: customFont,
            color,
        });
    };

    // --- Adatok ---
    const recText = "Andris";
    const serText = "0001";
    const valText = "2025.12.31.";

    const pages = pdfDoc.getPages();

    // Offszetek (pt-ben) – ezeket szabadon állíthatod
    const recipientYOffset = 1;  // pl. +5 ha feljebb akarod
    const serialYOffset = 3;
    const validYOffset = 5;     // dátum feljebb tolva

    // Recipient jobbra, első oldal
    drawTextCustom(recipient, recText, 15, "right", rgb(0, 0, 0), pages[0], recipientYOffset);
    // Serial középre, első és második oldal
    drawTextCustom(serial, serText, 14, "center", rgb(0, 0, 0), pages[0], serialYOffset);
    drawTextCustom(serial, serText, 14, "center", rgb(0, 0, 0), pages[1], serialYOffset);
    // Valid középre, második oldal
    drawTextCustom(valid, valText, 15, "center", rgb(0, 0, 0), pages[1], validYOffset);

    form.flatten();

    const out = await pdfDoc.save();
    let i = 0;
    while (fs.existsSync(`../assets/voucher/filled_voucher_${i}.pdf`)) i++;
    fs.writeFileSync(`../assets/voucher/filled_voucher_${i}.pdf`, out);

    console.log("Voucher kész:", `../assets/voucher/filled_voucher_${i}.pdf`);
}

fillVoucherDesign().catch(err => console.error("Hiba:", err));
