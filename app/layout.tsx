import type { Metadata } from "next";
import { Montserrat, Baskervville } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const baskervville = Baskervville({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-baskervville",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ministère de la Transformation Digitale :République du Bénin",
  description:
    "Ministère de la Transformation Digitale et de l'Innovation en charge de la Stratégie Nationale de l'Intelligence Artificielle :République du Bénin",
  keywords: ["Bénin", "transformation digitale", "intelligence artificielle", "innovation", "numérique"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const locale = hdrs.get("x-locale") || "fr";
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${montserrat.variable} ${baskervville.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <div id="main-content" tabIndex={-1} className="flex flex-col flex-1 outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
