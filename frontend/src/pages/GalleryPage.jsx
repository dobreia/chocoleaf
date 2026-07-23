import PageHeader from "../components/PageHeader";

export default function GalleryPage() {
    return (
        <section className="page-section">
            <PageHeader
                title="Galéria"
                description="Válogatás a ChocoLeaf munkáiból és hangulatából."
            />
            <div className="container page-content">
                <p>
                    A React galéria oldal alapja elkészült. A képek betöltése és a
                    végleges galériaelrendezés egy későbbi fejlesztési lépés része.
                </p>
            </div>
        </section>
    );
}
