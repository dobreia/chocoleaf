import PageHeader from "../components/PageHeader";

export default function HomePage() {
  return (
    <section className="page-section">
      <PageHeader
        title="ChocoLeaf"
        description="A Te szíved, az én kezem"
      />
      <div className="container page-content">
        <p>
          A React főoldal alapja elkészült. A részletes, végleges kezdőoldali
          tartalom későbbi lépésben kerül át.
        </p>
      </div>
    </section>
  );
}
