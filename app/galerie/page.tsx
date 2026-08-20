import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT = "#162233";

export default function GaleriePage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Galerie
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              Albums photos
            </p>
          </div>
        </section>

        {/* Albums Flickr */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Albums photos sur Flickr
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              <Link
                href="https://www.flickr.com/photos/numeriquebenin/albums/72177720334380465/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-8 bg-gris-perle hover:bg-white transition-colors"
              >
                <h3 className="text-anthracite font-black text-base uppercase mb-2 group-hover:text-vert-benin transition-colors">
                  CRSSI : Conférence des RSSI
                </h3>
                <p className="text-anthracite/50 text-sm font-medium mb-4">
                  Photos de la 2ème Conférence des Responsables de la Sécurité des Systèmes d'Information.
                </p>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: VERT }}>
                  Voir sur Flickr →
                </span>
              </Link>
              <Link
                href="https://www.flickr.com/photos/numeriquebenin/albums/72177720331866991/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-8 bg-gris-perle hover:bg-white transition-colors"
              >
                <h3 className="text-anthracite font-black text-base uppercase mb-2 group-hover:text-vert-benin transition-colors">
                  Séminaire stratégique numérique
                </h3>
                <p className="text-anthracite/50 text-sm font-medium mb-4">
                  Photos du séminaire stratégique sur le numérique au Bénin.
                </p>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: VERT }}>
                  Voir sur Flickr →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
