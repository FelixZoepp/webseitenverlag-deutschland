import type { Metadata } from "next";
import ErgebnissePage from "@/components/landing/ErgebnissePage";

export const metadata: Metadata = {
  title: "Kundenergebnisse & Fallstudien – Webseitenverlag Deutschland",
  description: "Echte Ergebnisse unserer Kunden: Mehr Anfragen, mehr Sichtbarkeit, mehr Umsatz. Fallstudien von Handwerkern, Beratern und lokalen Unternehmen.",
};

export default function Ergebnisse() {
  return <ErgebnissePage />;
}
