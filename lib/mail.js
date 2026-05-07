import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. transporter létrehozása
const transporter = nodemailer.createTransport({
    service: "gmail", // vagy "hotmail", "outlook", "yahoo" vagy saját SMTP
    auth: {
        user: process.env.MAIL_USER,   // pl. saját gmail
        pass: process.env.MAIL_PASS    // app password
    }
});

// 2. e-mail küldés függvény
export async function sendVoucherEmail(toEmail, recipientName, attachments) {
    const isMultiple = attachments.length > 1;
    const plural = isMultiple ? "ajándékutalványokat" : "ajándékutalványt";
    const subject = isMultiple
        ? "Ajándékutalványaid megérkeztek 🎁"
        : "Ajándékutalványod megérkezett 🎁";
    const mailOptions = {
        from: process.env.MAIL_FROM, // innen megy az .env-ből
        to: toEmail,
        subject: subject,
        text: `Kedves ${recipientName},\n\nKöszönjük a vásárlást! Az ${plural} csatolmányként megtalálod.\n\nÜdv,\nChocoLeaf`,
        attachments: attachments.map(a => ({
            filename: `voucher_${a.serial}.pdf`,
            path: a.path
        }))
    };


    await transporter.sendMail(mailOptions);
    console.log("📧 E-mail elküldve:", toEmail);
}

export async function sendGiftcardAdminEmail(intent, approveUrl) {
    const { meta, amount, notice } = intent;

    const names = Array.isArray(meta.names) && meta.names.length > 0
        ? meta.names
        : [meta.name];

    const namesHtml = names
        .map((name, index) => `<li>${index + 1}. ${name}</li>`)
        .join("");

    const namesText = names
        .map((name, index) => `${index + 1}. ${name}`)
        .join("\n");
    const isMultiple = names.length > 1;
    const nameLabel = isMultiple
        ? "Utalványokon szereplő nevek"
        : "Utalványon szereplő név";

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_ADMIN || process.env.MAIL_FROM,
        subject: "💰 Új ajándékutalvány rendelés érkezett",
        text: `
Új ajándékutalvány rendelés

Megrendelő email: ${meta.email}

Összeg: ${amount} Ft
Darabszám: ${meta.quantity}
Közlemény: ${notice}

Kifizetve → Voucher küldése:
${approveUrl}

Csak akkor kattints, ha az utalás ténylegesen megérkezett.
        `,
        html: `
            <h2>Új ajándékutalvány rendelés</h2>

            <p><b>Megrendelő email:</b> ${meta.email}</p>

           ${isMultiple
                ? `
                    <p><b>${nameLabel}:</b></p>
                    <ul>${namesHtml}</ul>
                    `
                : `
                    <p><b>${nameLabel}:</b> ${names[0]}</p>
                `
            }

            <p><b>Összeg:</b> ${amount} Ft</p>
            <p><b>Darabszám:</b> ${meta.quantity}</p>
            <p><b>Közlemény:</b> <code>${notice}</code></p>

            <hr/>

            <p>
                <a href="${approveUrl}" style="
                    display:inline-block;
                    padding:10px 16px;
                    background:#6C485C;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                ">
                    ✅ Kifizetve → Voucher küldése
                </a>
            </p>

            <p style="color:#666;font-size:12px">
                Csak akkor kattints, ha az utalás ténylegesen megérkezett.
            </p>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Admin értesítő elküldve");
}
