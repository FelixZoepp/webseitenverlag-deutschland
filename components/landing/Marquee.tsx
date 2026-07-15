const items = [
  "Webdesign",
  "SEO-Optimierung",
  "Responsive Design",
  "Hosting inklusive",
  "DSGVO-konform",
  "24h Lieferzeit",
  "SSL-Zertifikat",
  "Content-Management",
  "Google My Business",
  "E-Mail-Integration",
  "Performance-Optimierung",
  "Persönlicher Support",
];

export default function Marquee() {
  const track = items.map((item, i) => (
    <span key={i} className="marquee-item">{item}</span>
  ));

  return (
    <div className="marquee-section">
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {track}
          {track}
        </div>
      </div>
    </div>
  );
}
