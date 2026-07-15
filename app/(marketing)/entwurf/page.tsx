import type { Metadata } from "next";
import EntwurfForm from "@/components/landing/EntwurfForm";

export const metadata: Metadata = {
  title: "Kostenloser Webseiten-Entwurf – Webseitenverlag Deutschland",
  description: "Fordern Sie jetzt Ihren kostenlosen, unverbindlichen Webseiten-Entwurf an. In 24 Stunden erhalten Sie einen individuellen Vorschlag.",
};

export default function EntwurfPage() {
  return <EntwurfForm />;
}
