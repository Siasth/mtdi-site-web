// Server Component
import Image from "next/image";
import { getMinistreSettings } from "@/lib/ministre-settings";

type HomeDict = Record<string, string>;

export default async function MinistryMessage({ dict, locale = "fr" }: { dict?: HomeDict; locale?: string }) {
  const d = dict ?? {};
  const prefix = locale === "en" ? "/en" : "";
  const isEn = locale === "en";
  const m = await getMinistreSettings();

  const title = (isEn && m.titleEn) || m.titleFr;
  const badge = (isEn && m.badgeEn) || m.badgeFr;
  const badgeSub = (isEn && m.badgeSubEn) || m.badgeSubFr;
  const headingLines = ((isEn && m.headingEn) || m.headingFr).split("\n").filter(Boolean);
  const content = (isEn && m.contentEn) || m.contentFr;

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
                src={m.photo}
                alt=""
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
                {badge}
              </p>
              <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest">
                {badgeSub}
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
              {headingLines.map((line, i) => (
                <span key={i}>
                  {i === headingLines.length - 1 ? (
                    <span style={{ color: "#006828" }}>{line}</span>
                  ) : (
                    <>
                      {line}
                      <br />
                    </>
                  )}
                </span>
              ))}
            </h2>

            <div
              className="space-y-4 text-base text-anthracite/80 leading-relaxed prose-ministre"
              // Contenu HTML déjà assaini côté serveur à l'enregistrement
              // (voir sanitizeRichText dans /api/admin/ministre-settings).
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <style>{`
              .prose-ministre h1, .prose-ministre h2, .prose-ministre h3 { font-weight: 900; margin: 0.6em 0 0.3em; }
              .prose-ministre ul { list-style: disc; padding-left: 1.4em; margin: 0.5em 0; }
              .prose-ministre ol { list-style: decimal; padding-left: 1.4em; margin: 0.5em 0; }
              .prose-ministre blockquote { border-left: 3px solid #006828; padding-left: 1em; font-style: italic; margin: 0.6em 0; }
              .prose-ministre table { border-collapse: collapse; margin: 0.8em 0; width: 100%; }
              .prose-ministre td, .prose-ministre th { border: 1px solid rgba(0,0,0,0.12); padding: 6px 10px; }
              .prose-ministre th { background: rgba(0,0,0,0.03); font-weight: 700; }
            `}</style>

            <div className="mt-8 pt-6 border-t border-black/10">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-black text-anthracite text-base uppercase tracking-wide">
                    {m.name}
                  </p>
                  <p className="text-xs text-anthracite/85 font-semibold uppercase tracking-wider mt-0.5">
                    {title}
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
