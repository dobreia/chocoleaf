import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-md chocoleaf-navbar">
            <div className="container-fluid navbar-container">
                <Link className="navbar-brand chocoleaf-brand" to="/">
                    ChocoLeaf
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Menü megnyitása"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Főoldal
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/courses">
                                Képzések
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/giftcards">
                                Ajándékutalvány
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/courses">
                                Admin
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}