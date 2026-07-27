import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createBooking, getCourseAvailability, getCourses } from "../api/courses";
import "../styles/BookingCalendarPage.css";

const monthFormatter = new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
});
const dayTitleFormatter = new Intl.DateTimeFormat("hu-HU", {
    weekday: "long",
    month: "long",
    day: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
});
const weekdayLabels = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];

function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

function groupSlotsByDay(slots) {
    return slots.reduce((days, slot) => {
        const key = getDateKey(new Date(slot.start_time));
        if (!days[key]) days[key] = [];
        days[key].push(slot);
        return days;
    }, {});
}

function getPeriodLabel(date) {
    const hour = date.getHours();
    if (hour < 12) return "Délelőtt";
    if (hour < 18) return "Délután";
    return "Este";
}

export default function BookingCalendarPage() {
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [monthDate, setMonthDate] = useState(() => getMonthStart(new Date()));
    const [slots, setSlots] = useState([]);
    const [selectedDateKey, setSelectedDateKey] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState("");
    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        note: "",
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCourse = useMemo(
        () => courses.find((course) => String(course.id || course.slug) === String(id)),
        [courses, id]
    );
    const availableSlots = useMemo(
        () => slots.filter((slot) => slot.is_available),
        [slots]
    );
    const slotsByDay = useMemo(
        () => groupSlotsByDay(availableSlots),
        [availableSlots]
    );
    const calendarDays = useMemo(() => getCalendarDays(monthDate), [monthDate]);
    const selectedDate = selectedDateKey ? new Date(`${selectedDateKey}T12:00:00`) : null;
    const selectedDaySlots = selectedDateKey ? slotsByDay[selectedDateKey] || [] : [];
    const selectedSlot = selectedDaySlots.find((slot) => String(slot.id) === String(selectedSlotId));

    useEffect(() => {
        getCourses()
            .then(setCourses)
            .catch((error) => setStatus({ type: "error", message: error.message }));
    }, []);

    useEffect(() => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1;

        setIsLoading(true);
        setStatus({ type: "", message: "" });

        getCourseAvailability({ courseId: id, year, month })
            .then((items) => {
                setSlots(items);
                const firstAvailable = items.find((slot) => slot.is_available);
                const firstAvailableKey = firstAvailable
                    ? getDateKey(new Date(firstAvailable.start_time))
                    : "";
                setSelectedDateKey((currentKey) =>
                    currentKey && items.some((slot) => getDateKey(new Date(slot.start_time)) === currentKey && slot.is_available)
                        ? currentKey
                        : firstAvailableKey
                );
                setSelectedSlotId("");
            })
            .catch((error) => setStatus({ type: "error", message: error.message }))
            .finally(() => setIsLoading(false));
    }, [id, monthDate]);

    function moveMonth(delta) {
        setMonthDate((currentDate) => {
            const nextDate = new Date(currentDate);
            nextDate.setMonth(currentDate.getMonth() + delta);
            return getMonthStart(nextDate);
        });
    }

    function updateFormField(field, value) {
        setFormData((currentData) => ({
            ...currentData,
            [field]: value,
        }));
    }

    async function submitBooking(event) {
        event.preventDefault();

        if (!selectedSlot) {
            setStatus({ type: "error", message: "Válassz egy szabad időpontot." });
            return;
        }

        try {
            setIsSubmitting(true);
            setStatus({ type: "", message: "" });

            await createBooking({
                courseId: selectedSlot.id,
                ...formData,
                paymentMethod: "transfer",
            });

            setStatus({
                type: "success",
                message: "A foglalás mentve. Hamarosan felvesszük veled a kapcsolatot.",
            });
            setSelectedSlotId("");
            setFormData({
                customerName: "",
                customerEmail: "",
                customerPhone: "",
                note: "",
            });

            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;
            const refreshedSlots = await getCourseAvailability({ courseId: id, year, month });
            setSlots(refreshedSlots);
        } catch (error) {
            setStatus({ type: "error", message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="booking-calendar-page">
            <div className="booking-calendar-shell">
                <div className="booking-calendar-header">
                    <div>
                        <p className="booking-calendar-eyebrow">Időpontfoglalás</p>
                        <h1>{selectedCourse?.title || "Képzés foglalása"}</h1>
                    </div>
                    <Link className="booking-calendar-backlink" to="/courses">
                        Vissza a képzésekhez
                    </Link>
                </div>

                <div className="booking-calendar-card">
                    <section className="booking-calendar-month" aria-label="Naptár havi nézet">
                        <div className="booking-calendar-monthbar">
                            <h2>{monthFormatter.format(monthDate)}</h2>
                            <div className="booking-calendar-controls">
                                <button type="button" onClick={() => moveMonth(-1)} aria-label="Előző hónap">
                                    ‹
                                </button>
                                <button type="button" onClick={() => moveMonth(1)} aria-label="Következő hónap">
                                    ›
                                </button>
                            </div>
                        </div>

                        <div className="booking-calendar-weekdays">
                            {weekdayLabels.map((label, index) => (
                                <span key={`${label}-${index}`}>{label}</span>
                            ))}
                        </div>

                        <div className="booking-calendar-grid">
                            {calendarDays.map((date) => {
                                const key = getDateKey(date);
                                const isCurrentMonth = date.getMonth() === monthDate.getMonth();
                                const isAvailable = Boolean(slotsByDay[key]?.length);
                                const isSelected = selectedDateKey === key;

                                return (
                                    <button
                                        className={[
                                            "booking-calendar-day",
                                            isCurrentMonth ? "booking-calendar-day--current-month" : "booking-calendar-day--outside-month",
                                            isAvailable ? "booking-calendar-day--available" : "booking-calendar-day--disabled",
                                            isSelected ? "booking-calendar-day--selected" : "",
                                        ].join(" ")}
                                        disabled={!isAvailable}
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDateKey(key);
                                            setSelectedSlotId("");
                                        }}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="booking-calendar-slots" aria-live="polite">
                        {isLoading ? (
                            <p className="booking-calendar-empty">Időpontok betöltése...</p>
                        ) : selectedDate && selectedDaySlots.length > 0 ? (
                            <>
                                <h2>{dayTitleFormatter.format(selectedDate)}</h2>
                                <p className="booking-calendar-period">
                                    {getPeriodLabel(new Date(selectedDaySlots[0].start_time))}
                                </p>

                                <div className="booking-calendar-slot-list">
                                    {selectedDaySlots.map((slot) => (
                                        <button
                                            className={`booking-calendar-slot ${String(selectedSlotId) === String(slot.id) ? "booking-calendar-slot--selected" : ""}`}
                                            key={slot.id}
                                            type="button"
                                            onClick={() => setSelectedSlotId(slot.id)}
                                        >
                                            {timeFormatter.format(new Date(slot.start_time))}
                                            <span>{slot.available_spots} hely</span>
                                        </button>
                                    ))}
                                </div>

                                <form className="booking-calendar-form" onSubmit={submitBooking}>
                                    <h3>Foglalási adatok</h3>
                                    <div className="booking-calendar-form-grid">
                                        <label>
                                            Név
                                            <input
                                                required
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(event) => updateFormField("customerName", event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Email
                                            <input
                                                required
                                                type="email"
                                                value={formData.customerEmail}
                                                onChange={(event) => updateFormField("customerEmail", event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Telefonszám
                                            <input
                                                type="tel"
                                                value={formData.customerPhone}
                                                onChange={(event) => updateFormField("customerPhone", event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Megjegyzés
                                            <textarea
                                                rows="3"
                                                value={formData.note}
                                                onChange={(event) => updateFormField("note", event.target.value)}
                                            />
                                        </label>
                                    </div>
                                    <button className="booking-calendar-submit" disabled={isSubmitting} type="submit">
                                        {isSubmitting ? "Foglalás mentése..." : "Foglalás elküldése"}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <p className="booking-calendar-empty">
                                Ebben a hónapban nincs szabad időpont ehhez a képzéshez.
                            </p>
                        )}

                        {status.message && (
                            <p className={`booking-calendar-status booking-calendar-status--${status.type}`}>
                                {status.message}
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </section>
    );
}
