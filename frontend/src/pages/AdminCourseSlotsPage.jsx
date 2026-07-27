import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    createCourse,
    deleteCourse,
    getAdminCourseSlots,
    updateCourse,
} from "../api/courses";
import "../styles/AdminCoursePage.css";
import "../styles/AdminCourseSlotsPage.css";

const weekdayLabels = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];
const monthFormatter = new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
});
const selectedDayFormatter = new Intl.DateTimeFormat("hu-HU", {
    weekday: "long",
    month: "long",
    day: "numeric",
});

function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function getCalendarDays(monthDate) {
    const firstDay = getMonthStart(monthDate);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
    });
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function formatTime(value) {
    return new Date(value).toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateTime(value) {
    return new Date(value).toLocaleString("hu-HU", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function groupSlotsByDay(slots) {
    return slots.reduce((days, slot) => {
        const key = getDateKey(new Date(slot.start_time));
        if (!days[key]) days[key] = [];
        days[key].push(slot);
        return days;
    }, {});
}

export default function AdminCourseSlotsPage() {
    const { id } = useParams();
    const [courseGroup, setCourseGroup] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedDateKey, setSelectedDateKey] = useState("");
    const [monthDate, setMonthDate] = useState(() => getMonthStart(new Date()));
    const [editingSlotId, setEditingSlotId] = useState(null);
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

    const slotsByDay = useMemo(() => groupSlotsByDay(slots), [slots]);
    const calendarDays = useMemo(() => getCalendarDays(monthDate), [monthDate]);
    const selectedDaySlots = selectedDateKey ? slotsByDay[selectedDateKey] || [] : [];

    async function loadSlots() {
        setError("");

        try {
            const data = await getAdminCourseSlots(id);
            setCourseGroup(data.course);
            setSlots(data.slots);

            if (!selectedDateKey) {
                const firstFutureSlot = data.slots.find((slot) => new Date(slot.start_time) >= new Date());
                if (firstFutureSlot) {
                    const key = getDateKey(new Date(firstFutureSlot.start_time));
                    setSelectedDateKey(key);
                    setMonthDate(getMonthStart(new Date(firstFutureSlot.start_time)));
                }
            }
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadSlots();
    }, [id]);

    function resetForm(baseSlot = slots[0]) {
        setFormData({
            title: baseSlot?.title || courseGroup?.title || "",
            description: baseSlot?.description || "",
            date: selectedDateKey ? new Date(`${selectedDateKey}T12:00:00`) : null,
            startTime: "10:00",
            endTime: "12:00",
            price: baseSlot?.price || "",
            capacity: baseSlot?.capacity || 6,
            active: true,
        });
    }

    function openCreateModal() {
        setEditingSlotId(null);
        setFormError("");
        resetForm();
        setIsModalOpen(true);
    }

    function openEditModal(slot) {
        const startDate = new Date(slot.start_time);
        const endDate = new Date(slot.end_time);

        setEditingSlotId(slot.id);
        setFormError("");
        setFormData({
            title: slot.title || "",
            description: slot.description || "",
            date: startDate,
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            price: slot.price,
            capacity: slot.capacity,
            active: slot.active,
        });
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingSlotId(null);
        setFormError("");
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");
        setFormError("");

        try {
            const start_time = `${formatDate(formData.date)}T${formData.startTime}`;
            const end_time = `${formatDate(formData.date)}T${formData.endTime}`;
            const payload = {
                title: formData.title,
                description: formData.description,
                start_time,
                end_time,
                price: Number(formData.price),
                capacity: Number(formData.capacity),
                active: formData.active ?? true,
            };

            if (editingSlotId) {
                await updateCourse(editingSlotId, payload);
                setMessage("Időpont sikeresen frissítve.");
            } else {
                await createCourse(payload);
                setMessage("Új időpont sikeresen létrehozva.");
            }

            closeModal();
            await loadSlots();
        } catch (err) {
            setFormError(err.message);
        }
    }

    async function handleDelete(slotId) {
        if (!window.confirm("Biztosan törlöd ezt az időpontot?")) return;

        setMessage("");
        setError("");

        try {
            await deleteCourse(slotId);
            setMessage("Időpont sikeresen törölve.");
            await loadSlots();
        } catch (err) {
            setError(err.message);
        }
    }

    function moveMonth(delta) {
        setMonthDate((currentDate) => {
            const nextDate = new Date(currentDate);
            nextDate.setMonth(currentDate.getMonth() + delta);
            return getMonthStart(nextDate);
        });
    }

    return (
        <main className="admin-page admin-course-slots-page container-md">
            <h1>{courseGroup?.title || "Kurzus időpontok"}</h1>

            <div className="admin-course-toolbar">
                <Link className="admin-button" to="/admin/courses">
                    Vissza a kurzusokhoz
                </Link>
                <button className="admin-button" type="button" onClick={openCreateModal}>
                    + Új időpont
                </button>
            </div>

            <div className="admin-card admin-course-slots-card container-md">
                {message && <div className="admin-message">{message}</div>}
                {error && <div className="admin-error">{error}</div>}

                <div className="admin-course-slots-layout">
                    <section className="admin-slot-calendar" aria-label="Admin naptár">
                        <div className="admin-slot-calendar__monthbar">
                            <h2>{monthFormatter.format(monthDate)}</h2>
                            <div>
                                <button type="button" onClick={() => moveMonth(-1)}>‹</button>
                                <button type="button" onClick={() => moveMonth(1)}>›</button>
                            </div>
                        </div>

                        <div className="admin-slot-calendar__legend" aria-hidden="true">
                            <span><i className="admin-slot-calendar__legend-dot admin-slot-calendar__legend-dot--available"></i>Van időpont</span>
                            <span><i className="admin-slot-calendar__legend-dot admin-slot-calendar__legend-dot--empty"></i>Nincs időpont</span>
                        </div>

                        <div className="admin-slot-calendar__weekdays">
                            {weekdayLabels.map((label, index) => (
                                <span key={`${label}-${index}`}>{label}</span>
                            ))}
                        </div>

                        <div className="admin-slot-calendar__grid">
                            {calendarDays.map((date) => {
                                const key = getDateKey(date);
                                const daySlots = slotsByDay[key] || [];
                                const isSelected = key === selectedDateKey;
                                const isCurrentMonth = date.getMonth() === monthDate.getMonth();
                                const hasSlots = daySlots.length > 0;

                                return (
                                    <button
                                        className={[
                                            "admin-slot-calendar__day",
                                            isCurrentMonth ? "admin-slot-calendar__day--current" : "admin-slot-calendar__day--outside",
                                            hasSlots ? "admin-slot-calendar__day--has-slots" : "admin-slot-calendar__day--empty",
                                            isSelected ? "admin-slot-calendar__day--selected" : "",
                                        ].join(" ")}
                                        key={key}
                                        type="button"
                                        aria-label={`${key}: ${hasSlots ? `${daySlots.length} időpont` : "nincs időpont"}`}
                                        title={hasSlots ? `${daySlots.length} időpont` : "Nincs időpont"}
                                        onClick={() => setSelectedDateKey(key)}
                                    >
                                        <span>{date.getDate()}</span>
                                        <small>{hasSlots ? daySlots.length : ""}</small>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="admin-slot-list">
                        <div className="admin-slot-list__header">
                            <h2>
                                {selectedDateKey
                                    ? selectedDayFormatter.format(new Date(`${selectedDateKey}T12:00:00`))
                                    : "Válassz napot"}
                            </h2>
                            <button className="admin-small-button" type="button" onClick={openCreateModal}>
                                + Időpont
                            </button>
                        </div>

                        {selectedDaySlots.length === 0 ? (
                            <p>Erre a napra nincs időpont.</p>
                        ) : (
                            <div className="admin-slot-items">
                                {selectedDaySlots.map((slot) => (
                                    <article className="admin-slot-item" key={slot.id}>
                                        <div>
                                            <strong>
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </strong>
                                            <p>
                                                {slot.booked_count || 0} foglalt / {slot.capacity} kapacitás
                                                {" "}({slot.available_spots} szabad)
                                            </p>
                                            <p>{Number(slot.price).toLocaleString("hu-HU")} Ft</p>
                                        </div>
                                        <div className="admin-actions">
                                            <span
                                                className={`status-dot ${slot.active ? "active" : "inactive"}`}
                                                title={slot.active ? "Aktív" : "Inaktív"}
                                            ></span>
                                            <button
                                                className="admin-small-button"
                                                type="button"
                                                onClick={() => openEditModal(slot)}
                                            >
                                                Szerkesztés
                                            </button>
                                            <button
                                                className="admin-small-button danger"
                                                type="button"
                                                onClick={() => handleDelete(slot.id)}
                                            >
                                                Törlés
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h2>{editingSlotId ? "Időpont szerkesztése" : "Új időpont létrehozása"}</h2>
                            <button className="modal-close" type="button" onClick={closeModal}>×</button>
                        </div>

                        {formError && <div className="admin-error modal-error">{formError}</div>}

                        <form className="admin-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Cím</label>
                                    <input name="title" type="text" value={formData.title} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>Ár (Ft)</label>
                                    <input name="price" type="number" value={formData.price} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-grid three-columns">
                                <div className="form-row">
                                    <label>Dátum</label>
                                    <DatePicker
                                        selected={formData.date}
                                        dateFormat="yyyy. MM. dd."
                                        placeholderText="Válassz dátumot"
                                        onChange={(date) => setFormData((currentData) => ({ ...currentData, date }))}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Kezdés</label>
                                    <input name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>Befejezés</label>
                                    <input name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Kapacitás</label>
                                    <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} />
                                </div>
                                <label className="checkbox-row checkbox-row-inline">
                                    <input
                                        checked={formData.active}
                                        type="checkbox"
                                        onChange={(event) =>
                                            setFormData((currentData) => ({
                                                ...currentData,
                                                active: event.target.checked,
                                            }))
                                        }
                                    />
                                    Aktív időpont
                                </label>
                            </div>

                            <div className="form-row">
                                <label>Leírás</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} />
                            </div>

                            <div className="modal-actions">
                                <button className="admin-button" type="submit">
                                    {editingSlotId ? "Mentés" : "Létrehozás"}
                                </button>
                                <button className="admin-button secondary" type="button" onClick={closeModal}>
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
