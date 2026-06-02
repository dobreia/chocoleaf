const API_URL = import.meta.env.VITE_API_URL;

export async function getCourses() {
  const response = await fetch(`${API_URL}/courses`);

  if (!response.ok) {
    throw new Error("Nem sikerült lekérni a kurzusokat.");
  }

  return response.json();
}