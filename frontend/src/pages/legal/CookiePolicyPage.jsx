import PageHeader from "../../components/PageHeader";

export default function CookiePolicyPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Sütik"
                description="A sütikezelési tájékoztató Reactes oldalváza."
            />
            <div className="container page-content">
                <p>
                    A részletes süti tájékoztató később kerül át a meglévő
                    statikus oldalból. Ez a váz nem állít be új követési funkciót.
                </p>
            </div>
        </section>
    );
}
