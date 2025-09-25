// server.js
import express from "express";
import bodyParser from "body-parser";
import { calWebhook } from "./routes/cal.js";
import { barionStart, barionIpn } from "./routes/barion.js";

const app = express();

// raw body kell a Cal aláíráshoz
app.use("/api/cal/webhook", express.raw({ type: "*/*" }), calWebhook);

// normál JSON body
app.use(express.json());

app.post("/api/barion/start", barionStart);
app.post("/api/barion/ipn", barionIpn);

// statikus fájlok (HTML frontend)
app.use(express.static("public"));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
