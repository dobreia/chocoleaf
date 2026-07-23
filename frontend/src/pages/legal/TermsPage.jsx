import PageHeader from "../../components/PageHeader";

export default function TermsPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Rendelési feltételek"
                description="A rendelési feltételek Reactes oldalváza."
            />
            <div className="container page-content">
                <p>
                    A végleges feltételek szövege későbbi tartalmi migrációval
                    kerül ide. Ez az oldal jelenleg csak a route stabil helyét adja.
                </p>
            </div>
        </section>
    );
}
