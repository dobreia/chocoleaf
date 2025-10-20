// lib/barion.js
import fetch from "node-fetch";

const BARION_API = (process.env.BARION_API || "https://api.test.barion.com").replace(/\/$/, "");

export async function startPayment(bookingUid, { courseId, courseName, price, name, email, startTime, endTime }) {
  // sikeres / sikertelen redirect URL
  const RedirectUrl = `${process.env.PUBLIC_URL}/api/barion/redirect?bookingUid=${encodeURIComponent(bookingUid)}`;
  const CallbackUrl = `${process.env.PUBLIC_URL}/api/barion/ipn`;

  const payload = {
    POSKey: process.env.BARION_POSKEY,
    PaymentType: "Immediate",
    FundingSources: ["BankCard"],
    OrderNumber: `BOOK-${bookingUid}`,
    PaymentRequestId: `PAY-${bookingUid}`,
    GuestCheckOut: true,
    Locale: "hu-HU",
    Currency: "HUF",
    RedirectUrl,
    CallbackUrl,

    Transactions: [
      {
        POSTransactionId: `T-${bookingUid}`,
        Payee: process.env.BARION_PAYEE_EMAIL,
        Total: Number(price),
        Comment: courseName || "Időpont foglalás",
        Items: [
          {
            Name: courseName || "Foglalás",
            Description: `Kezdés: ${startTime || ""} | Vége: ${endTime || ""} | Név: ${name || ""} | Email: ${email || ""}`,
            Quantity: 1,
            Unit: "db",
            UnitPrice: Number(price),
            ItemTotal: Number(price),
          },
        ],
      },
    ],
  };

  const r = await fetch(`${BARION_API}/v2/Payment/Start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok || !data.GatewayUrl) {
    throw new Error(`Barion start failed ${r.status}: ${JSON.stringify(data)}`);
  }
  return data.GatewayUrl;
}

// ÚJ: Payment állapot lekérdezése IPN-hez
export async function getPaymentState(paymentId) {
  const url = `${BARION_API}/v2/Payment/GetPaymentState?POSKey=${encodeURIComponent(process.env.BARION_POSKEY)}&PaymentId=${encodeURIComponent(paymentId)}`;
  const r = await fetch(url, { method: "GET" });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(`GetPaymentState failed ${r.status}: ${JSON.stringify(data)}`);
  }
  return data; // pl. { Status: "Succeeded", OrderNumber: "BOOK-...", ... }
}
