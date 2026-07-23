import PageHeader from "../../components/PageHeader";

export default function ImprintPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Impresszum"
                description="Az impresszum Reactes oldalváza."
            />
            <div className="container page-content">
                <p>
                    A részletes impresszum tartalom később kerül át a meglévő
                    statikus oldalból. Ez az oldal nem tartalmaz kitalált vállalkozási adatot.
                </p>
            </div>
        </section>
    );
}
