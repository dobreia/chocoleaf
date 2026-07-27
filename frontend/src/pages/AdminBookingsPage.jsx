import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminBookings, updateBooking } from "../api/courses";
import "../styles/AdminCoursePage.css";
import "../styles/AdminBookingsPage.css";

const bookingStatusLabels = {
    pending: "Függőben",
    confirmed: "Visszaigazolt",
    cancelled: "Lemondva",
};

const paymentStatusLabels = {
    pending: "Függőben",
    paid: "Fizetve",
    refunded: "Visszatérítve",
    failed: "Sikertelen",
};

const paymentMethodLabels = {
    transfer: "Átutalás",
    barion: "Barion",
};

function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("hu-HU", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatPrice(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "-";
    return `${numericValue.toLocaleString("hu-HU")} Ft`;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    async function loadBookings() {
        try {
            const data = await getAdminBookings();
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        getAdminBookings()
            .then((data) => {
                if (isMounted) setBookings(data);
            })
            .catch((err) => {
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleStatusChange(id, field, value) {
        setMessage("");
        setError("");

        try {
            await updateBooking(id, { [field]: value });
            setMessage("Foglalás sikeresen frissítve.");
            await loadBookings();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="admin-page admin-bookings-page container-md">
            <h1>Foglalások kezelése</h1>

            <div className="admin-bookings-toolbar">
                <Link className="admin-button" to="/admin/courses">
                    Kurzusok kezelése
                </Link>
                <button className="admin-button secondary" type="button" onClick={loadBookings}>
                    Frissítés
                </button>
            </div>

            <div className="admin-card admin-list-card container-md">
                {message && <div className="admin-message">{message}</div>}
                {error && <div className="admin-error">{error}</div>}

                {isLoading ? (
                    <p>Foglalások betöltése...</p>
                ) : bookings.length === 0 ? (
                    <p>Nincs még foglalás.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table admin-bookings-table">
                            <thead>
                                <tr>
                                    <th>Képzés</th>
                                    <th>Időpont</th>
                                    <th>Foglaló</th>
                                    <th>Elérhetőség</th>
                                    <th>Hely</th>
                                    <th>Összeg</th>
                                    <th>Foglalás</th>
                                    <th>Fizetés</th>
                                    <th>Létrehozva</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <strong>{booking.course_title}</strong>
                                            {booking.note && (
                                                <p className="admin-bookings-note">{booking.note}</p>
                                            )}
                                        </td>
                                        <td>
                                            {formatDateTime(booking.start_time)}
                                            <br />
                                            <span className="admin-bookings-muted">
                                                vége: {formatTime(booking.end_time)}
                                            </span>
                                        </td>
                                        <td>{booking.customer_name}</td>
                                        <td>
                                            <a href={`mailto:${booking.customer_email}`}>
                                                {booking.customer_email}
                                            </a>
                                            {booking.customer_phone && (
                                                <>
                                                    <br />
                                                    <a href={`tel:${booking.customer_phone}`}>
                                                        {booking.customer_phone}
                                                    </a>
                                                </>
                                            )}
                                        </td>
                                        <td>{booking.seats} fő</td>
                                        <td>{formatPrice(booking.total_price)}</td>
                                        <td>
                                            <select
                                                className={`admin-bookings-select admin-bookings-select--${booking.status}`}
                                                value={booking.status}
                                                onChange={(event) =>
                                                    handleStatusChange(booking.id, "status", event.target.value)
                                                }
                                            >
                                                {Object.entries(bookingStatusLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className={`admin-bookings-select admin-bookings-select--${booking.payment_status}`}
                                                value={booking.payment_status}
                                                onChange={(event) =>
                                                    handleStatusChange(booking.id, "payment_status", event.target.value)
                                                }
                                            >
                                                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                            <p className="admin-bookings-muted">
                                                {paymentMethodLabels[booking.payment_method] || booking.payment_method}
                                            </p>
                                        </td>
                                        <td>{formatDateTime(booking.created_at)}</td>
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
