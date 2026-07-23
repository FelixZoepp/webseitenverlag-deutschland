import type { Metadata } from "next";
import KundenmeinungenPage from "@/components/landing/KundenmeinungenPage";

export const metadata: Metadata = {
  title: "Kundenmeinungen – Webseiten ab 99 € netto im Monat | Webseiten-Verlag Deutschland",
  description: "Echte Erfolgsgeschichten unserer Kunden: Vom Handwerker bis zum Berater. Sieh, wie unsere 99 € netto/Monat-Webseiten sechsstellige Umsätze generieren – ohne 5.000€ Vorabinvestition.",
  openGraph: {
    title: "Kundenmeinungen – Echte Ergebnisse mit 99 € netto/Monat-Webseiten",
    description: "Über 120.000€ Zusatzumsatz, 250.000€ Auftragsvolumen – und das ohne hohe Vorabinvestition. Sieh die Erfolgsgeschichten.",
    type: "website",
    locale: "de_DE",
  },
};

export default function Kundenmeinungen() {
  return <KundenmeinungenPage />;
}
