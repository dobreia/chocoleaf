import PageHeader from "../components/PageHeader";

export default function AboutPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Rólam"
                description="Bemutatkozó oldal a ChocoLeaf mögötti alkotói szemlélethez."
            />
            <div className="container page-content">
                <p>
                    Ez az oldal a bemutatkozó tartalom Reactes helye. A végleges
                    szövegek és képek később kerülnek át a régi oldalról.
                </p>
            </div>
        </section>
    );
}
