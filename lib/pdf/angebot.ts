import { createDoc, docToBuffer, drawHeader, drawFooter, drawSectionTitle, drawKeyValue, drawSignatureLine, formatEuro, formatDate, BRAND } from './helpers'
import { getPackage, type PackageTier } from '../packages'
import { getUpsellModule } from '../upsells'

export interface AngebotPDFData {
  angebotsNummer: string
  datum: Date
  // Kunde
  firma: string
  ansprechpartner: string
  strasse: string
  plz: string
  ort: string
  ustIdNr?: string
  // Paket
  paket: PackageTier
  upsells: string[]
  // Beträge
  monatsrateCent: number
  werklohnCent: number
  contractYears: number
  contractStart: string
}

export async function generateAngebotPDF(data: AngebotPDFData): Promise<Buffer> {
  const doc = createDoc()
  const bufferPromise = docToBuffer(doc)
  const pkg = getPackage(data.paket)

  // Header
  drawHeader(doc, `Angebot ${data.angebotsNummer}`)

  // Meta
  doc.moveDown(0.5)
  doc.fontSize(9).font('Helvetica').fillColor('#6B7280')
    .text(`Datum: ${formatDate(data.datum)}`, { align: 'right' })
  doc.moveDown(1)

  // Absender
  drawSectionTitle(doc, 'Absender')
  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(BRAND.company)
    .text(BRAND.address.replace(' · ', '\n'))
  doc.moveDown(0.8)

  // Empfänger
  drawSectionTitle(doc, 'Empfänger')
  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(data.firma)
    .text(data.ansprechpartner)
    .text(data.strasse)
    .text(`${data.plz} ${data.ort}`)
  if (data.ustIdNr) {
    doc.text(`USt-IdNr.: ${data.ustIdNr}`)
  }

  doc.moveDown(1)

  // Einleitungstext
  doc.fontSize(10).font('Helvetica').fillColor(BRAND.text)
    .text(`Sehr geehrte/r ${data.ansprechpartner},`, { lineGap: 4 })
    .text('')
    .text('vielen Dank für Ihr Vertrauen. Nachfolgend unser Angebot für Ihren professionellen Webauftritt:', { lineGap: 4 })

  doc.moveDown(0.8)

  // Paket-Details
  drawSectionTitle(doc, 'Gewähltes Paket')
  drawKeyValue(doc, 'Paket', `${pkg.emoji} ${pkg.name}`)
  drawKeyValue(doc, 'Monatspreis', `${pkg.price},00 € netto`)
  drawKeyValue(doc, 'Inkl. Seiten', `Bis zu ${pkg.maxPages}`)

  doc.moveDown(0.3)
  doc.fontSize(9).font('Helvetica').fillColor('#6B7280').text('Enthaltene Leistungen:')
  for (const f of pkg.features) {
    doc.fontSize(9).font('Helvetica').fillColor(BRAND.text).text(`  • ${f}`)
  }

  // Upsells
  if (data.upsells.length > 0) {
    drawSectionTitle(doc, 'Zusatzmodule')

    // Table header
    const tableX = 50
    let tableY = doc.y
    doc.rect(tableX, tableY, 490, 20).fill('#F3F4F6')
    doc.fontSize(9).font('Helvetica-Bold').fillColor(BRAND.text)
      .text('Modul', tableX + 8, tableY + 5, { width: 300 })
      .text('Monatl.', tableX + 370, tableY + 5, { width: 120, align: 'right' })

    tableY += 22

    for (const upsellId of data.upsells) {
      const mod = getUpsellModule(upsellId)
      if (!mod) continue

      doc.fontSize(9).font('Helvetica').fillColor(BRAND.text)
        .text(mod.name, tableX + 8, tableY, { width: 300 })
        .text(`${formatEuro(mod.preisProMonatCent)} €`, tableX + 370, tableY, { width: 120, align: 'right' })

      tableY += 16
      doc.y = tableY
    }
  }

  doc.moveDown(1)

  // Zusammenfassung
  drawSectionTitle(doc, 'Zusammenfassung')

  const basisCent = pkg.price * 100
  const upsellSumme = data.upsells.reduce((sum, id) => {
    const mod = getUpsellModule(id)
    return sum + (mod?.preisProMonatCent || 0)
  }, 0)

  drawKeyValue(doc, 'Basis-Paket', `${formatEuro(basisCent)} €/Monat`)
  if (upsellSumme > 0) {
    drawKeyValue(doc, 'Zusatzmodule', `${formatEuro(upsellSumme)} €/Monat`)
  }

  doc.moveDown(0.3)
  doc.moveTo(50, doc.y).lineTo(540, doc.y).lineWidth(0.5).strokeColor('#E5E7EB').stroke()
  doc.moveDown(0.3)

  drawKeyValue(doc, 'Monatliche Rate', `${formatEuro(data.monatsrateCent)} € netto`)
  drawKeyValue(doc, 'Vertragslaufzeit', `${data.contractYears} Jahre (ab ${formatDate(data.contractStart)})`)
  drawKeyValue(doc, 'Werklohn gesamt', `${formatEuro(data.werklohnCent)} € netto`)

  doc.moveDown(1)

  // Hinweise
  doc.fontSize(9).font('Helvetica').fillColor('#6B7280')
    .text('Alle Preise verstehen sich netto zzgl. der gesetzlichen Umsatzsteuer.', { lineGap: 3 })
    .text('Die Vertragslaufzeit beginnt mit dem Datum der Unterschrift.')
    .text('Kündigung ist zum Vertragsende mit einer Frist von 3 Monaten möglich.')

  // Signatur
  const sigY = Math.max(doc.y + 40, 660)
  drawSignatureLine(doc, 'Ort, Datum', 50, sigY)
  drawSignatureLine(doc, 'Unterschrift Auftraggeber', 310, sigY)

  drawFooter(doc)
  doc.end()
  return bufferPromise
}
