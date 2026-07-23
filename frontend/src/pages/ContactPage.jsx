import PageHeader from "../components/PageHeader";

export default function ContactPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Kapcsolat"
                description="Kapcsolati oldalváz a későbbi elérhetőségek és űrlap számára."
            />
            <div className="container page-content">
                <p>
                    A kapcsolatfelvételi felület Reactes váza elkészült. Konkrét
                    üzleti adatok és működő űrlap ebben a körben még nem kerültek ide.
                </p>
            </div>
        </section>
    );
}
