const API_URL = import.meta.env.VITE_API_URL;

export async function getCourses() {
  const response = await fetch(`${API_URL}/courses`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a kurzusokat.");
  }

  return response.json();
}

export async function getCourseAvailability({ courseId, year, month }) {
  const searchParams = new URLSearchParams();

  if (courseId) searchParams.set("courseId", courseId);
  if (year) searchParams.set("year", year);
  if (month) searchParams.set("month", month);

  const response = await fetch(`${API_URL}/bookings/availability?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a szabad időpontokat.");
  }

  return response.json();
}

export async function createBooking(bookingData) {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Nem sikerült menteni a foglalást.");
  }

  return response.json();
}

export async function createCourse(courseData) {
  const response = await fetch(`${API_URL}/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Nem sikerült létrehozni a kurzust.");
  }

  return response.json();
}

export async function getAdminCourses() {
  const response = await fetch(`${API_URL}/admin/courses`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni az admin kurzusokat.");
  }

  return response.json();
}

export async function updateCourse(id, courseData) {
  const response = await fetch(`${API_URL}/admin/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Nem sikerült frissíteni a kurzust.");
  }

  return response.json();
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_URL}/admin/courses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Nem sikerült inaktiválni a kurzust.");
  }

  return response.json();
}

export async function getAdminCourseSlots(id) {
  const response = await fetch(`${API_URL}/admin/courses/${id}/slots`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a kurzus időpontjait.");
  }

  return response.json();
}

export async function getAdminBookings() {
  const response = await fetch(`${API_URL}/admin/bookings`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a foglalásokat.");
  }

  return response.json();
}

export async function updateBooking(id, bookingData) {
  const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Nem sikerült frissíteni a foglalást.");
  }

  return response.json();
}
