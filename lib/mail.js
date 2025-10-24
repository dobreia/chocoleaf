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
