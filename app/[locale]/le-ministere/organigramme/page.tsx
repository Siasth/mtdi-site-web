import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { getDirections } from "@/lib/directions";
import { getStructures } from "@/lib/structures";
import OrganigrammeDownloadButton from "../../../components/OrganigrammeDownloadButton";

const VERT = "#162233";
const JAUNE = "#FFBE00";

const BOX_MINISTER = "#006828";
const BOX_BLUE = "#0369a1";
const BOX_ORANGE = "#ea8c00";
const BOX_GREEN = "#0D9488"; // teal distinct du vert officiel gouvernemental (#006828, réservé au Ministre)
const BOX_WHITE = "white";

function Box({ label, sub, bg, text = "white", border, wide }: { label: string; sub?: string; bg: string; text?: string; border?: string; wide?: boolean }) {
  return (
    <div className={`px-4 py-3 text-center ${wide ? "w-52 sm:w-56" : ""}`} style={{ background: bg, color: text, border: border || "none" }}>
      <p className="text-[11px] font-bold leading-tight">{label}</p>
      {sub && <p className="text-[9px] mt-0.5" style={{ color: text }}>{sub}</p>}
    </div>
  );
}

function Connector({ height = 24 }: { height?: number }) {
  return (
    <div className="flex justify-center" style={{ height }}>
      <div className="w-px h-full" style={{ background: "rgba(0,0,0,0.15)" }} />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-center text-xs font-black uppercase tracking-widest text-anthracite/70 my-6">
      {children}
    </p>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OrganigrammePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.organigramme;
  const prefix = locale === "en" ? "/en" : "";
  const isEn = locale === "en";

  const [directions, structures] = await Promise.all([
    getDirections(isEn ? "en" : "fr"),
    getStructures(isEn ? "en" : "fr"),
  ]);
  // Regroupement automatique : tout ce qui n'est pas explicitement "Direction
  // centrale" tombe dans "Directions techniques" — garde-fou pour ne jamais
  // faire disparaître silencieusement une direction du schéma.
  const directionsCentrales = directions.filter((d) => d.type === "Direction centrale" || d.type === "Central Directorate");
  const directionsTechniques = directions.filter((d) => !(d.type === "Direction centrale" || d.type === "Central Directorate"));

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              {t.breadcrumb}
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              <span style={{ color: JAUNE }}>{t.titre}</span>
            </h1>
          </div>
        </section>

        {/* Organigramme */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle overflow-x-auto">
          <div className="max-w-5xl mx-auto mb-6 flex justify-end">
            <OrganigrammeDownloadButton
              label={isEn ? "Download" : "Télécharger"}
              filename="organigramme-mtdi.pdf"
            />
          </div>
          {/* Légende */}
          <div className="max-w-5xl mx-auto mb-8 flex flex-wrap gap-4 items-center">
            <span className="text-xs font-black uppercase tracking-widest text-anthracite/70 mr-2">{t.legende}</span>
            {[
              { color: "#006828", label: "Ministre" },
              { color: "#0369a1", label: "Secrétariat Général & directions" },
              { color: "#ea8c00", label: "Cabinet & rattachements directs" },
              { color: BOX_GREEN, label: "Organismes sous tutelle" },
              { color: "white", label: "Services administratifs", border: "1px solid rgba(0,0,0,0.15)" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 flex-shrink-0" style={{ background: item.color, border: item.border }} />
                <span className="text-[10px] font-medium text-anthracite/60">{item.label}</span>
              </span>
            ))}
          </div>

          <div id="organigramme-capture" className="max-w-5xl mx-auto min-w-[700px]">

            {/* === MINISTRE === */}
            <div className="flex justify-center">
              <Box label="MINISTRE" bg={BOX_MINISTER} />
            </div>

            <Connector />
            <div className="flex justify-center gap-3 flex-wrap" aria-label="Services directement rattachés au Ministre">
              <Box label="Inspection Générale du Ministre" bg={BOX_ORANGE} text="#1a1a1a" />
              <Box label="Secrétariat Particulier" bg={BOX_BLUE} />
              <Box label="CMAI" bg={BOX_BLUE} />
              <Box label="CMSIC" bg={BOX_BLUE} />
              <Box label="C/PIP" bg={BOX_BLUE} />
            </div>
            <div className="flex justify-center gap-3 flex-wrap mt-3">
              <Box label="Cellule de Contrôle des MP" bg={BOX_ORANGE} text="#1a1a1a" />
              <Box label="PRMP" bg={BOX_ORANGE} text="#1a1a1a" />
              <Box label="Assistant du Ministre" bg={BOX_BLUE} />
              <Box label="Garde du Corps" bg={BOX_BLUE} />
            </div>

            {/* === CABINET + SECRÉTARIAT GÉNÉRAL === */}
            <Connector height={32} />
            <div className="relative flex items-center justify-center mb-0" style={{ height: 24 }}>
              <div className="absolute left-[25%] right-[25%] h-px" style={{ background: "rgba(0,0,0,0.15)", top: "50%" }} />
              <div className="flex justify-around w-full">
                <div className="flex flex-col items-center"><div className="w-px h-4" style={{ background: "rgba(0,0,0,0.15)" }} /></div>
                <div className="flex flex-col items-center"><div className="w-px h-4" style={{ background: "rgba(0,0,0,0.15)" }} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {/* Cabinet */}
              <div>
                <SectionLabel>Cabinet</SectionLabel>
                <div className="flex flex-col items-center gap-2">
                  <Box label="Directeur de Cabinet" bg={BOX_ORANGE} text="#1a1a1a" />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Box label="Assistant DC" bg={BOX_ORANGE} text="#1a1a1a" />
                    <Box label="Secrétariat du Cabinet" bg={BOX_ORANGE} text="#1a1a1a" />
                    <Box label="Point Focal Communication" bg={BOX_ORANGE} text="#1a1a1a" />
                    <Box label="Conseillers Techniques" bg={BOX_ORANGE} text="#1a1a1a" />
                  </div>
                </div>
              </div>

              {/* Secrétariat Général */}
              <div>
                <SectionLabel>Secrétariat Général</SectionLabel>
                <div className="flex flex-col items-center gap-2">
                  <Box label="Secrétariat Général" bg={BOX_BLUE} />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Box label="Assistant SGM" bg={BOX_BLUE} />
                    <Box label="Secrétariat du SGM" bg={BOX_BLUE} />
                    <Box label="CMMR" bg={BOX_BLUE} />
                    <Box label="CTPR" bg={BOX_BLUE} />
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <Box label="Secrétariat Administratif" bg={BOX_WHITE} text="#1a1a1a" border="1px solid rgba(0,0,0,0.12)" />
                    <Box label="Cellule Juridique" bg={BOX_WHITE} text="#1a1a1a" border="1px solid rgba(0,0,0,0.12)" />
                    <Box label="Commission de Passation des Marchés publics" bg={BOX_WHITE} text="#1a1a1a" border="1px solid rgba(0,0,0,0.12)" />
                    <Box label="Cellule de Pilotage de la réforme Administrative et Institutionnelle" bg={BOX_WHITE} text="#1a1a1a" border="1px solid rgba(0,0,0,0.12)" />
                  </div>
                </div>
              </div>
            </div>

            {/* === DIRECTIONS CENTRALES === */}
            {directionsCentrales.length > 0 && (
              <>
                <Connector height={32} />
                <SectionLabel>Directions centrales</SectionLabel>
                <div className={`flex justify-center gap-3 mx-auto ${directionsCentrales.length > 4 ? "flex-wrap max-w-3xl" : "flex-nowrap"}`}>
                  {directionsCentrales.map((d) => (
                    <Box key={d.id} label={d.name} sub={d.acronym} bg={BOX_BLUE} wide />
                  ))}
                </div>
              </>
            )}

            {/* === DIRECTIONS TECHNIQUES === */}
            {directionsTechniques.length > 0 && (
              <>
                <Connector height={32} />
                <SectionLabel>Directions techniques</SectionLabel>
                <div className={`flex justify-center gap-3 mx-auto ${directionsTechniques.length > 4 ? "flex-wrap max-w-3xl" : "flex-nowrap"}`}>
                  {directionsTechniques.map((d) => (
                    <Box key={d.id} label={d.name} sub={d.acronym} bg={BOX_BLUE} wide />
                  ))}
                </div>
              </>
            )}

            {/* === ORGANISMES SOUS TUTELLE === */}
            {structures.length > 0 && (
              <>
                <Connector height={32} />
                <SectionLabel>Organismes sous tutelle</SectionLabel>
                <div className={`flex justify-center gap-3 mx-auto ${structures.length > 4 ? "flex-wrap max-w-3xl" : "flex-nowrap"}`}>
                  {structures.map((s) => (
                    <Box key={s.id} label={s.name} sub={s.acronym} bg={BOX_GREEN} wide />
                  ))}
                </div>
              </>
            )}

          </div>
        </section>

        {/* Lien vers les directions */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
            <Link
              href={`${prefix}/le-ministere/directions`}
              className="inline-flex items-center gap-3 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: VERT, color: "white" }}
            >
              {t.voirDirections}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={`${prefix}/le-ministere/structures`}
              className="inline-flex items-center gap-3 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:gap-5"
              style={{ border: `1px solid ${VERT}`, color: VERT }}
            >
              {t.structuresSousTutelle}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
