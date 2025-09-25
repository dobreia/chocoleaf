export async function startPayment(bookingUid, amount = 1000) {
  const payload = {
    OrderNumber: `BOOK-${bookingUid}`,
    PaymentRequestId: `PAY-${bookingUid}`,
    Currency: "HUF",
    RedirectUrl: `${process.env.PUBLIC_URL}/payment/result?bookingUid=${bookingUid}`,
    CallbackUrl: `${process.env.PUBLIC_URL}/api/barion/ipn`,
    Transactions: [
      {
        POSTransactionId: `T-${bookingUid}`,
        Payee: process.env.BARION_PAYEE_EMAIL,
        Total: amount,
        Items: [
          {
            Name: "Időpont foglalás",
            Quantity: 1,
            UnitPrice: amount,
            ItemTotal: amount,
          },
        ],
      },
    ],
  };

  const r = await fetch(`${process.env.BARION_API}/Payment/Start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      POSKey: process.env.BARION_POSKEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await r.json();
  return data.GatewayUrl;
}
