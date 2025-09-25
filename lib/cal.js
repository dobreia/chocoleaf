export async function confirmBooking(uid) {
  await fetch(`${process.env.CAL_API_URL}/bookings/${uid}/confirm`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}` },
  });
}

export async function cancelBooking(uid) {
  await fetch(`${process.env.CAL_API_URL}/bookings/${uid}/cancel`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}` },
  });
}
