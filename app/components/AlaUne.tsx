// Server Component
import Image from "next/image";
import { getFeaturedActualites } from "@/lib/actualites";

export default async function AlaUne({ locale = "fr" }: { locale?: string }) {
  const items = await getFeaturedActualites(locale === "en" ? "en" : "fr", 3);

  if (items.length === 0) return null;

  const gridPositions = [
    { gridColumn: "1 / 8", gridRow: "1 / 9", textSize: "text-xl sm:text-3xl lg:text-5xl" },
    { gridColumn: "8 / 13", gridRow: "1 / 7", textSize: "text-base sm:text-xl" },
    { gridColumn: "8 / 13", gridRow: "7 / 13", textSize: "text-base sm:text-xl" },
  ];

  return (
    <section className="bg-white">
      <div
        className="grid grid-cols-12 gap-1"
        style={{ gridAutoRows: "minmax(0, 1fr)", height: "clamp(500px, 70vw, 720px)" }}
      >
        {items.map((item, i) => {
          const pos = gridPositions[i] ?? gridPositions[gridPositions.length - 1];
          return (
            <a
              key={item.id}
              href={item.hrefExternal || `${locale === "en" ? "/en" : ""}/actualites`}
              target={item.hrefExternal ? "_blank" : undefined}
              rel={item.hrefExternal ? "noopener noreferrer" : undefined}
              className="relative overflow-hidden group"
              style={{ gridColumn: pos.gridColumn, gridRow: pos.gridRow }}
            >
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="50vw" />
              ) : (
                <div className="absolute inset-0" style={{ background: "#162233" }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">
                  {item.category}
                </span>
                <h3 className={`${pos.textSize} font-black text-white leading-tight`}>
                  {item.title}
                </h3>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mt-2">
                  {new Date(item.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
