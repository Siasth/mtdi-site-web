// Server Component
import Image from "next/image";

type HomeDict = Record<string, string>;

export default function MinistryMessage({ dict, locale = "fr" }: { dict?: HomeDict; locale?: string }) {
  const d = dict ?? {};
  const prefix = locale === "en" ? "/en" : "";
  return (
    <section className="py-12 sm:py-20 bg-gris-perle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Portrait */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-sm"
              style={{ paddingBottom: "125%" }}
            >
              <Image
                src="/ministre.png"
                alt="Portrait officiel du Ministre de la Transformation Digitale"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#006828" }} />
            </div>

            <div
              className="absolute -right-4 top-8 px-4 py-2 rounded-sm shadow-lg hidden lg:block"
              style={{ background: "#006828" }}
            >
              <p className="text-white text-xs font-bold uppercase tracking-wider">
                {d.ministreEnCharge ?? "Ministre en charge"}
              </p>
              <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest">
                {d.transformationDigitaleIA ?? "Transformation Digitale & IA"}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-vert-benin">
                {d.motDuMinistre ?? "Le mot du Ministre"}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-anthracite uppercase leading-tight mb-8">
              {d.beninDeploy ?? "Le Bénin déploie."}
              <br />
              {d.beninBuild ?? "Le Bénin construit."}
              <br />
              <span style={{ color: "#006828" }}>{d.beninInnovate ?? "Le Bénin innove."}</span>
            </h2>

            <div className="space-y-4 text-base text-anthracite/80 leading-relaxed">
              <p>
                {d.ministreP1 ?? "La technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté."}
              </p>
              <p>
                {d.ministreP2 ?? "Le Ministère de la Transformation Digitale et de l'Innovation a pour mission de conduire la feuille de route technologique au service des politiques publiques, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-black/10">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-black text-anthracite text-base uppercase tracking-wide">
                    Mahuna Akplogan
                  </p>
                  <p className="text-xs text-anthracite/85 font-semibold uppercase tracking-wider mt-0.5">
                    {d.titreMinistreLong ?? "Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'IA"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <a
                href={`${prefix}/le-ministere/le-ministre`}
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-vert-benin hover:gap-4 transition-all"
              >
                {d.rencontreMinistre ?? "À la rencontre du Ministre"}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href={`${prefix}/ecrire-au-ministre`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-2 transition-all hover:gap-3"
                style={{ borderColor: "#006828", color: "#006828" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {d.ecrireMinistre ?? "Écrire au Ministre"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
