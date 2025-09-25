import { startPayment } from "@/lib/barion";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { bookingUid } = req.body;
  if (!bookingUid) return res.status(400).json({ error: "Missing bookingUid" });

  const redirectUrl = await startPayment(bookingUid, 1000); // fix ár vagy később dinamikus
  res.status(200).json({ redirectUrl });
}
