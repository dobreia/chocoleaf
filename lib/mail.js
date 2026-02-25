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
    const plural = attachments.length > 1 ? "ajándékutalványokat" : "ajándékutalványt";
    const mailOptions = {
        from: process.env.MAIL_FROM, // innen megy az .env-ből
        to: toEmail,
        subject: "Ajándékutalványod megérkezett 🎁",
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

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_ADMIN || process.env.MAIL_FROM,
        subject: "💰 Új ajándékutalvány rendelés érkezett",
        html: `
            <h2>Új ajándékutalvány rendelés</h2>
            <p><b>Név:</b> ${meta.name}</p>
            <p><b>Email:</b> ${meta.email}</p>
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
