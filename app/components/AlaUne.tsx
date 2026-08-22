// Server Component : récupère jusqu'à 8 articles "à la une" (RM-002) et
// délègue l'affichage/interaction (défilement, flèches) au carrousel client.
import { getFeaturedActualites } from "@/lib/actualites";
import AlaUneCarousel from "./AlaUneCarousel";

export default async function AlaUne({ locale = "fr" }: { locale?: string }) {
  const items = await getFeaturedActualites(locale === "en" ? "en" : "fr", 8);
  return <AlaUneCarousel items={items} locale={locale} />;
}
