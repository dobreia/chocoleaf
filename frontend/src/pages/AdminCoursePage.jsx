import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: null,
        startTime: "10:00",
        endTime: "12:00",
        price: "",
        capacity: 6,
        active: true,
    });

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

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

    function resetForm() {
        setFormData({
            title: "",
            description: "",
            date: null,
            startTime: "10:00",
            endTime: "12:00",
            price: "",
            capacity: 6,
            active: true,
        });
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleCreateNew() {
        setMessage("");
        setError("");
        setFormError("");
        setEditingCourseId(null);
        resetForm();
        setIsModalOpen(true);
    }

    function handleEdit(course) {
        setMessage("");
        setError("");
        setFormError("");
        setEditingCourseId(course.id);

        const startDate = new Date(course.start_time);
        const endDate = new Date(course.end_time);

        setFormData({
            title: course.title || "",
            description: course.description || "",
            date: startDate,
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            price: course.price,
            capacity: course.capacity,
            active: course.active,
        });

        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingCourseId(null);
        setFormError("");
        resetForm();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setFormError("");

        try {
            const start_time = `${formatDate(formData.date)}T${formData.startTime}:00`;
            const end_time = `${formatDate(formData.date)}T${formData.endTime}:00`;

            const payload = {
                title: formData.title,
                description: formData.description,
                start_time,
                end_time,
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

            setEditingCourseId(null);
            setIsModalOpen(false);
            resetForm();
            await loadCourses();
        } catch (err) {
            setFormError(err.message);
        }
    }

    async function handleDelete(id) {
        const confirmDelete = window.confirm(
            "Biztosan törlöd ezt a kurzust?"
        );

        if (!confirmDelete) return;

        setMessage("");
        setError("");
        setFormError("");

        try {
            await deleteCourse(id);
            setMessage("Kurzus sikeresen törölve.");
            await loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="admin-page">
            <h1>Kurzusok kezelése</h1>

            <div className="admin-card admin-list-card">
                <div className="admin-header">
                    <button
                        type="button"
                        className="admin-button"
                        onClick={handleCreateNew}
                    >
                        + Új kurzus
                    </button>
                </div>

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

                                        <td>
                                            {course.price.toLocaleString("hu-HU")} Ft
                                        </td>

                                        <td>
                                            {course.capacity} fő
                                        </td>

                                        <td className="text-center">
                                            <span
                                                className={`status-dot ${course.active ? "active" : "inactive"}`}
                                                title={course.active ? "Aktív" : "Inaktív"}
                                            ></span>
                                        </td>

                                        <td>
                                            <div className="admin-actions">
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
                                                    Törlés
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h2>
                                {editingCourseId
                                    ? "Kurzus szerkesztése"
                                    : "Új kurzus létrehozása"}
                            </h2>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        {formError && (
                            <div className="admin-error modal-error">
                                {formError}
                            </div>
                        )}

                        <form className="admin-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Cím</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Ár (Ft)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-grid three-columns">
                                <div className="form-row">
                                    <label>Dátum</label>
                                    <DatePicker
                                        selected={formData.date}
                                        onChange={(date) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                date,
                                            }))
                                        }
                                        dateFormat="yyyy. MM. dd."
                                        placeholderText="Válassz dátumot"
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Kezdés</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-row">
                                    <label>Befejezés</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Kapacitás</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                    />
                                </div>

                                <label className="checkbox-row checkbox-row-inline">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={(event) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                active: event.target.checked,
                                            }))
                                        }
                                    />
                                    Aktív kurzus
                                </label>
                            </div>

                            <div className="form-row">
                                <label>Leírás</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="admin-button" type="submit">
                                    {editingCourseId ? "Mentés" : "Létrehozás"}
                                </button>

                                <button
                                    type="button"
                                    className="admin-button secondary"
                                    onClick={handleCloseModal}
                                >
                                    Mégse
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}