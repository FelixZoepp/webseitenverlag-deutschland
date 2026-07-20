import PDFDocument from 'pdfkit'

// WVD Branding
export const BRAND = {
  primary: '#1E4A82',
  gold: '#C9A24E',
  dark: '#0B1322',
  text: '#374151',
  light: '#F9FAFB',
  company: 'ZH Digitalisierung UG',
  address: 'Rhinstraße 137A · 10315 Berlin',
  brand: 'Webseiten-Verlag Deutschland',
}

export function createDoc(): PDFKit.PDFDocument {
  return new PDFDocument({ size: 'A4', margin: 50 })
}

export function docToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  const buffers: Buffer[] = []
  doc.on('data', (chunk) => buffers.push(chunk))
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)
  })
}

export function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function drawHeader(doc: PDFKit.PDFDocument, title: string) {
  // Blue header bar
  doc.rect(0, 0, doc.page.width, 80).fill(BRAND.primary)

  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .fillColor('#FFFFFF')
    .text(title, 50, 30, { width: doc.page.width - 100, align: 'center' })

  doc.y = 100
}

export function drawFooter(doc: PDFKit.PDFDocument) {
  const y = doc.page.height - 40
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#9CA3AF')
    .text(`${BRAND.company} · ${BRAND.address}`, 50, y, {
      width: doc.page.width - 100,
      align: 'center',
    })
}

export function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.8)
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(BRAND.primary)
    .text(title.toUpperCase(), { characterSpacing: 0.5 })
  doc.moveDown(0.4)
  doc.fillColor(BRAND.text)
}

export function drawKeyValue(doc: PDFKit.PDFDocument, key: string, value: string) {
  const startY = doc.y
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(BRAND.text)
    .text(key + ':', 50, startY, { continued: false, width: 150 })

  doc
    .font('Helvetica')
    .text(value, 210, startY, { width: 320 })

  if (doc.y < startY + 16) doc.y = startY + 16
}

export function drawSignatureLine(doc: PDFKit.PDFDocument, label: string, x: number, y: number) {
  doc.moveTo(x, y).lineTo(x + 200, y).lineWidth(0.5).strokeColor('#9CA3AF').stroke()
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#9CA3AF')
    .text(label, x, y + 4, { width: 200, align: 'center' })
}
