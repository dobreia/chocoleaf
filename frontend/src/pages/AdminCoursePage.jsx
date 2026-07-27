import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminCourses } from "../api/courses";
import "../styles/AdminCoursePage.css";

function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("hu-HU", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatPrice(value) {
    const price = Number(value);
    if (!Number.isFinite(price)) return "-";
    return `${price.toLocaleString("hu-HU")} Ft`;
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    async function loadCourses() {
        setError("");
        setIsLoading(true);

        try {
            const data = await getAdminCourses();
            setCourses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadCourses();
    }, []);

    return (
        <main className="admin-page container-md">
            <h1>Kurzusok kezelése</h1>

            <div className="admin-course-toolbar">
                <Link className="admin-button" to="/admin/bookings">
                    Foglalások
                </Link>
                <button className="admin-button secondary" type="button" onClick={loadCourses}>
                    Frissítés
                </button>
            </div>

            <div className="admin-card admin-list-card container-md">
                {error && <div className="admin-error">{error}</div>}

                {isLoading ? (
                    <p>Kurzusok betöltése...</p>
                ) : courses.length === 0 ? (
                    <p>Nincs még kurzus.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Cím</th>
                                    <th>Következő időpont</th>
                                    <th>Ár</th>
                                    <th>Kapacitás</th>
                                    <th>Időpontok</th>
                                    <th>Aktív</th>
                                    <th>Művelet</th>
                                </tr>
                            </thead>

                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>
                                            <strong>{course.title}</strong>
                                            {course.description && (
                                                <p className="admin-course-description">
                                                    {course.description}
                                                </p>
                                            )}
                                        </td>
                                        <td>{formatDateTime(course.next_start_time || course.start_time)}</td>
                                        <td>{formatPrice(course.price)}</td>
                                        <td>{course.capacity} fő</td>
                                        <td>
                                            {course.active_slots || 0} aktív / {course.total_slots || 0} összes
                                        </td>
                                        <td className="text-center">
                                            <span
                                                className={`status-dot ${(course.active_slots || 0) > 0 ? "active" : "inactive"}`}
                                                title={(course.active_slots || 0) > 0 ? "Van aktív időpont" : "Nincs aktív időpont"}
                                            ></span>
                                        </td>
                                        <td>
                                            <Link
                                                className="admin-small-button admin-link-button"
                                                to={`/admin/courses/${course.id}`}
                                            >
                                                Időpontok
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
