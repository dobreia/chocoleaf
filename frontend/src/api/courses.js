const API_URL = import.meta.env.VITE_API_URL;

export async function getCourses() {
  const response = await fetch(`${API_URL}/courses`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a kurzusokat.");
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
  const response = await fetch(
    `${API_URL}/admin/courses`
  );

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a kurzusokat.");
  }

  return response.json();
}