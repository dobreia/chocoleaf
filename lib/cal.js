// lib/cal.js
import fetch from "node-fetch";

const CAL_API = process.env.CAL_API_URL?.trim() || "https://api.cal.com/v2";
const CAL_API_VERSION_FALLBACK = "2024-08-13";

function headersJson() {
  const key = process.env.CAL_API_KEY;              // <-- híváskor olvassuk
  const ver = process.env.CAL_API_VERSION || CAL_API_VERSION_FALLBACK;

  if (!key) {
    console.warn("[CAL] Nincs CAL_API_KEY az env-ben! A confirm/cancel 403-mal fog esni.");
  }
  return {
    "Authorization": `Bearer ${key}`,
    "cal-api-version": ver,
    "Content-Type": "application/json",
  };
}

export async function confirmBooking(uid) {
  const res = await fetch(`${CAL_API}/bookings/${uid}/confirm`, {
    method: "POST",
    headers: headersJson(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal confirm failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function cancelBooking(uid, reason = "Payment failed or canceled") {
  const res = await fetch(`${CAL_API}/bookings/${uid}/cancel`, {
    method: "POST",
    headers: headersJson(),
    body: JSON.stringify({ cancellationReason: reason }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal cancel failed ${res.status}: ${text}`);
  }
  return res.json();
}
