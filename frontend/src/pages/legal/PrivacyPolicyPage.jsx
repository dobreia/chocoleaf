import PageHeader from "../../components/PageHeader";

export default function PrivacyPolicyPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Adatkezelési tájékoztató"
                description="Az adatkezelési tájékoztató Reactes oldalváza."
            />
            <div className="container page-content">
                <p>
                    A teljes jogi szöveg később kerül át a meglévő statikus
                    dokumentumból. Ez a váz nem helyettesíti a végleges tájékoztatót.
                </p>
            </div>
        </section>
    );
}
