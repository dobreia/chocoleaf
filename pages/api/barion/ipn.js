import { verifyBarionSignature } from "@/lib/hmac";
import { confirmBooking, cancelBooking } from "@/lib/cal";

export default async function handler(req, res) {
  if (!verifyBarionSignature(req)) return res.status(401).end("invalid sig");

  const ipn = req.body;
  const bookingUid = ipn.OrderNumber?.replace("BOOK-", "");
  const status = ipn.Status;

  console.log("Barion IPN:", status, bookingUid);

  if (status === "Succeeded") {
    await confirmBooking(bookingUid);
  } else if (["Canceled", "Expired", "Failed"].includes(status)) {
    await cancelBooking(bookingUid);
  }

  res.status(200).end("ok");
}
