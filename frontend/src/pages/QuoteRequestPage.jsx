import PageHeader from "../components/PageHeader";

export default function QuoteRequestPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Ajánlatkérés"
                description="Oldalváz egy későbbi egyedi ajánlatkérő folyamathoz."
            />
            <div className="container page-content">
                <p>
                    Az ajánlatkérő oldal route-ja készen áll. A végleges űrlap és a
                    beküldési logika külön fejlesztési feladat lesz.
                </p>
            </div>
        </section>
    );
}
