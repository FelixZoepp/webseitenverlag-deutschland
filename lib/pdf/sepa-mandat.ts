import { createDoc, docToBuffer, drawHeader, drawFooter, drawSectionTitle, drawSignatureLine, BRAND } from './helpers'

export interface SepaMandatPDFData {
  firma: string
  ansprechpartner: string
  strasse: string
  plz: string
  ort: string
  ibanKunde: string
  bicKunde?: string
  mandatsReferenz: string
  glaeubigerId: string
}

export async function generateSepaMandatPDF(data: SepaMandatPDFData): Promise<Buffer> {
  const doc = createDoc()
  const bufferPromise = docToBuffer(doc)

  // Header
  drawHeader(doc, 'SEPA-Lastschriftmandat')

  doc.moveDown(0.3)
  doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
    .text('Mandat zur Erteilung einer wiederkehrenden Lastschrift', { align: 'center' })

  doc.moveDown(1.5)

  // Gläubiger
  drawSectionTitle(doc, 'Zahlungsempfänger (Gläubiger)')
  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(BRAND.company)
    .text('Rhinstraße 137A')
    .text('10315 Berlin')
    .text(`Gläubiger-Identifikationsnummer: ${data.glaeubigerId || '[wird nachgetragen]'}`)
    .text(`Mandatsreferenz: ${data.mandatsReferenz}`)

  doc.moveDown(1.2)

  // Zahlungspflichtiger
  drawSectionTitle(doc, 'Zahlungspflichtiger (Kunde)')
  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(data.firma)
    .text(data.ansprechpartner)
    .text(data.strasse)
    .text(`${data.plz} ${data.ort}`)
    .text(`IBAN: ${data.ibanKunde}`)
  if (data.bicKunde) {
    doc.text(`BIC: ${data.bicKunde}`)
  }

  doc.moveDown(1.5)

  // Mandatstext (EPC-Pflichttext)
  drawSectionTitle(doc, 'Ermächtigung')
  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(
      `Ich/Wir ermächtige(n) ${BRAND.company}, Zahlungen von meinem/unserem ` +
      `Konto mittels Lastschrift einzuziehen. Zugleich weise(n) ich/wir mein/unser ` +
      `Kreditinstitut an, die von ${BRAND.company} auf mein/unser Konto gezogenen ` +
      `Lastschriften einzulösen.`,
      { align: 'justify', lineGap: 4 }
    )

  doc.moveDown(0.5)

  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(
      'Hinweis: Ich kann/Wir können innerhalb von acht Wochen, beginnend mit dem ' +
      'Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten ' +
      'dabei die mit meinem/unserem Kreditinstitut vereinbarten Bedingungen.',
      { align: 'justify', lineGap: 4 }
    )

  doc.moveDown(1.2)

  // Zahlungsart
  doc.fontSize(10).font('Helvetica-Bold').fillColor(BRAND.text)
    .text('Zahlungsart: ', { continued: true })
    .font('Helvetica')
    .text('Wiederkehrende Zahlungen')

  // Signatur
  const sigY = Math.max(doc.y + 50, 620)
  drawSignatureLine(doc, 'Ort, Datum', 50, sigY)
  drawSignatureLine(doc, 'Unterschrift Kontoinhaber', 310, sigY)

  drawFooter(doc)
  doc.end()
  return bufferPromise
}
