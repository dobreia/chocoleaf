import { useEffect, useState } from "react";
import {
    createCourse,
    getAdminCourses,
    updateCourse,
    deleteCourse,
} from "../api/courses";
import "../styles/AdminCoursePage.css";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [editingCourseId, setEditingCourseId] = useState(null);

    async function loadCourses() {
        try {
            const data = await getAdminCourses();
            setCourses(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadCourses();
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        price: "",
        capacity: 6,
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                capacity: Number(formData.capacity),
                active: formData.active ?? true,
            };

            if (editingCourseId) {
                await updateCourse(editingCourseId, payload);
                setMessage("Kurzus sikeresen frissítve.");
            } else {
                await createCourse(payload);
                setMessage("Kurzus sikeresen létrehozva.");
            }

            setFormData({
                title: "",
                description: "",
                start_time: "",
                end_time: "",
                price: "",
                capacity: 6,
                active: true,
            });

            setEditingCourseId(null);
            await loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

    function handleEdit(course) {
        setEditingCourseId(course.id);

        setFormData({
            title: course.title,
            description: course.description || "",
            start_time: course.start_time.slice(0, 16),
            end_time: course.end_time.slice(0, 16),
            price: course.price,
            capacity: course.capacity,
            active: course.active,
        });
    }

    async function handleDelete(id) {
        const confirmDelete = window.confirm(
            "Biztosan inaktiválod ezt a kurzust?"
        );

        if (!confirmDelete) return;

        try {
            await deleteCourse(id);
            setMessage("Kurzus sikeresen inaktiválva.");
            await loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }


    return (
        <main className="admin-page">
            <div className="admin-card">
                <h1>Admin — új kurzus létrehozása</h1>

                {message && (
                    <div className="admin-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label>Cím</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>Leírás</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-row">
                            <label>Kezdés</label>
                            <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label>Befejezés</label>
                            <input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-row">
                            <label>Ár (Ft)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label>Kapacitás</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <button className="admin-button" type="submit">
                        <h1>
                            {editingCourseId
                                ? "Kurzus szerkesztése"
                                : "Új kurzus létrehozása"}
                        </h1>
                    </button>
                    {editingCourseId && (
                        <button
                            type="button"
                            className="admin-button secondary"
                            onClick={() => {
                                setEditingCourseId(null);
                                setFormData({
                                    title: "",
                                    description: "",
                                    start_time: "",
                                    end_time: "",
                                    price: "",
                                    capacity: 6,
                                    active: true,
                                });
                            }}
                        >
                            Mégse
                        </button>
                    )}
                </form>
            </div>
            <div className="admin-card admin-list-card">
                <h2>Meglévő kurzusok</h2>

                {courses.length === 0 ? (
                    <p>Nincs még kurzus.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Cím</th>
                                    <th>Dátum</th>
                                    <th>Ár</th>
                                    <th>Kapacitás</th>
                                    <th>Státusz</th>
                                    <th>Művelet</th>
                                </tr>
                            </thead>

                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.title}</td>
                                        <td>
                                            {new Date(course.start_time).toLocaleString("hu-HU")}
                                        </td>
                                        <td>{course.price.toLocaleString("hu-HU")} Ft</td>
                                        <td>{course.capacity} fő</td>
                                        <td>{course.active ? "Aktív" : "Inaktív"}</td>
                                        <td>
                                            {course.active && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="admin-small-button"
                                                        onClick={() => handleEdit(course)}
                                                    >
                                                        Szerkesztés
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="admin-small-button danger"
                                                        onClick={() => handleDelete(course.id)}
                                                    >
                                                        Inaktiválás
                                                    </button>
                                                </>
                                            )}
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