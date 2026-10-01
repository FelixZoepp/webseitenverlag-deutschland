# Eitzen Scroll-Scrub Referenz — gespeichert für Implementierung

Siehe User-Message vom 2026-07-25 mit vollständiger Anleitung.
Kernpunkte für die Flagship-Pipeline:

## Aktueller Fehler in unserer Pipeline

Wir generieren EIN 6-Sekunden-Video aus dem Hero-Bild und nennen es "Scrub".
Das ist KEIN echter Scroll-Scrub. Ein echter Scrub braucht:

1. **5 separate Video-Clips** (je 5s) mit Start-Frame-Chaining
2. **Encoding mit kurzen GOPs** (GOP 8 Desktop, GOP 4 Mobile) + faststart
3. **Scroll-Controller** der video.currentTime an Scroll-Position bindet
4. **Linger-Effekt** an den Szenen-Übergängen

## Was wir ändern müssen

### Video-Generierung
- Statt 1 Video → 5 Videos generieren (Start-Frame-Chaining)
- Entry Still als erstes Bild
- Letzter Frame von Video N → start_image für Video N+1
- Seedance 2.0 / Higgsfield mit mode: std, genre: epic, 5s, 1080p, 16:9

### Encoding
- Desktop: GOP 8, CRF 18, 1080p, faststart, -an, -sc_threshold 0
- Mobile: GOP 4, CRF 20, 720p, faststart, -an, -sc_threshold 0
- Poster: 1. Frame als JPEG (q:v 3)

### Frontend-Rendering
- Zwei-Spalten-Grid: links Videos (sticky), rechts Texte (erzeugen Scrollhöhe)
- Videos übereinander gestapelt, opacity-gesteuert
- requestAnimationFrame für smooth Scrubbing
- video.currentTime = progress * duration (mit Interpolation)
- Linger-Effekt: Verweildauer an Szenen-Enden

### Szenen-Konfiguration pro Branche
- 5 Szenen mit: id, label, kicker, title, body, tags
- Je Szene: clip, mobileClip, poster, mobilePoster
- scroll (Gewichtung), linger, objectPosition, align (left/right)
