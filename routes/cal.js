import { verifyCalSignature } from "../lib/hmac.js";

export async function calWebhook(req, res) {
  const signature = req.headers["x-cal-signature-256"];
  if (!verifyCalSignature(signature, req.body)) {
    return res.status(401).send("Invalid signature");
  }

  const data = JSON.parse(req.body.toString());
  console.log("Cal webhook event:", data.triggerEvent);

  res.status(200).end("ok");
}
