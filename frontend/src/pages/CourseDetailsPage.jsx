import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function CourseDetailsPage() {
    const { id } = useParams();

    return (
        <section className="page-section">
            <PageHeader
                title="Képzés részletei"
                description="A React alapú kurzusrészletező oldal váza elkészült."
            />
            <div className="container page-content">
                <p>
                    Kurzus azonosító: <strong>{id}</strong>
                </p>
                <p>
                    Ebben a körben ez az oldal még nem hív API-t. A későbbi lépésben
                    ide kerülnek a részletes kurzusadatok és a foglalási lehetőségek.
                </p>
                <Link className="button-link" to="/courses">
                    Vissza a képzésekhez
                </Link>
            </div>
        </section>
    );
}
