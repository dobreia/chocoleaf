import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav>
            <Link to="/">Főoldal</Link>{" "}
            <Link to="/courses">Képzések</Link>{" "}
            <Link to="/giftcards">Ajándékutalvány</Link>
            <Link to="/admin/courses">Admin</Link>
        </nav>
    );
}