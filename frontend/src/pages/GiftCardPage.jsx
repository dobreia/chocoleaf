import PageHeader from "../components/PageHeader";

export default function GiftCardPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Ajándékutalvány"
                description="Reactes oldalváz a későbbi ajándékutalvány vásárlási folyamathoz."
            />
            <div className="container page-content">
                <p>
                    Az ajándékutalvány oldal route-ja működik. A vásárlási űrlap,
                    fizetési folyamat és PDF-küldés későbbi fejlesztési körben kerül át.
                </p>
            </div>
        </section>
    );
}
