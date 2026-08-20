import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const cabinetMembers = [
  {
    rôle: "Ministre",
    direction: "Ministère de la Transformation Digitale et de l'Innovation",
    description:
      "Autorité politique en charge de la définition et de la mise en œuvre de la politique gouvernementale en matière de transformation digitale, d'innovation et d'intelligence artificielle.",
    accent: "#006828",
    level: 0,
  },
  {
    rôle: "Directeur de Cabinet",
    direction: "Cabinet du Ministre",
    description:
      "Coordonne l'ensemble des activités du cabinet ministériel, assure la liaison avec les autres institutions gouvernementales et supervise la mise en œuvre des décisions du Ministre.",
    accent: VERT,
    level: 1,
  },
  {
    rôle: "Secrétaire Général du Ministère",
    direction: "Secrétariat Général",
    description:
      "Assure la coordination administrative de l'ensemble des directions et services du ministère. Garantit la continuité et la cohérence de l'action ministérielle.",
    accent: VERT,
    level: 1,
  },
];


export default function CabinetPage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-14 pb-20"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">

            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              Le Ministère
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              <span style={{ color: JAUNE }}>Cabinet</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              Le cabinet du Ministère de la Transformation Digitale et de l'Innovation.
            </p>
          </div>
        </section>

        {/* Cabinet */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Cabinet ministériel
            </h2>

            <div className="flex flex-col gap-0">
              {cabinetMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-start gap-6 py-8"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {/* Level indicator */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${member.accent}14` }}
                    >
                      <svg width="20" height="20" fill="none" stroke={member.accent} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-anthracite font-black text-lg uppercase leading-snug">
                        {member.rôle}
                      </h3>
                      {member.level === 0 && (
                        <span
                          className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white"
                          style={{ background: "#006828" }}
                        >
                          Autorité politique
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: member.accent }}
                    >
                      {member.direction}
                    </p>
                    <p className="text-anthracite/55 text-sm font-medium leading-relaxed max-w-2xl">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </>
  );
}
