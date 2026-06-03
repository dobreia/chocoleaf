import { useState } from "react";
import { createCourse } from "../api/courses";
import "../styles/AdminCoursePage.css";

export default function AdminCoursesPage() {
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
            await createCourse({
                ...formData,
                price: Number(formData.price),
                capacity: Number(formData.capacity),
            });

            setMessage("Kurzus sikeresen létrehozva.");

            setFormData({
                title: "",
                description: "",
                start_time: "",
                end_time: "",
                price: "",
                capacity: 6,
            });
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
                        Kurzus létrehozása
                    </button>
                </form>
            </div>
        </main>
    );
}