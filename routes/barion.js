import { startPayment } from "../lib/barion.js";
import { confirmBooking, cancelBooking } from "../lib/cal.js";

export async function barionStart(req, res) {
    const { bookingUid } = req.body;
    if (!bookingUid) return res.status(400).json({ error: "Missing bookingUid" });

    const redirectUrl = await startPayment(bookingUid, 1000);
    res.status(200).json({ redirectUrl });
}

export async function barionIpn(req, res) {
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
