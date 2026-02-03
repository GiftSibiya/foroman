import QuotationService from '../services/quotationService';
import QuotationLineService from '../services/quotationLineService';
import type { Quotation, QuotationLine } from '../types/quotation';
import { formatCurrency } from './currency';

/** Fetch quotation + line items by id, then download PDF. Use from list view. */
export async function downloadQuotationPdfById(quotationId: number): Promise<void> {
  const [quotation, items] = await Promise.all([
    QuotationService.findById(quotationId),
    QuotationLineService.findByQuotationId(quotationId),
  ]);
  if (!quotation) throw new Error('Quotation not found');
  const lineItems = Array.isArray(items) ? items : [];
  await generateQuotationPdf(quotation, lineItems);
}

const PDF = {
  margin: 20,
  pageWidth: 210,
  lineHeight: 6,
  tableHeaderHeight: 8,
  tableRowHeight: 7,
  colWidths: [75, 20, 35, 40] as const,
  get colRight() {
    return this.margin + this.colWidths.reduce((a, b) => a + b, 0);
  },
};

function drawHLine(doc: import('jspdf').jsPDF, y: number, thick = false) {
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(thick ? 0.8 : 0.4);
  doc.line(PDF.margin, y, PDF.pageWidth - PDF.margin, y);
}

export async function generateQuotationPdf(
  quotation: Quotation,
  lineItems: QuotationLine[] = []
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const margin = PDF.margin;
  let y = margin;
  const lh = PDF.lineHeight;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Quotation ${quotation.quotation_number}`, margin, y);
  y += lh + 1;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Status: ${quotation.status}`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += lh + 4;
  drawHLine(doc, y, true);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Customer', margin, y);
  y += lh;
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customer_name, margin, y);
  y += lh;
  if (quotation.customer_email) {
    doc.text(quotation.customer_email, margin, y);
    y += lh;
  }
  if (quotation.customer_address) {
    doc.text(quotation.customer_address, margin, y);
    y += lh;
  }
  y += lh;
  drawHLine(doc, y);
  y += 6;

  doc.setFontSize(9);
  doc.text(`Issue Date: ${new Date(quotation.issue_date).toLocaleDateString()}`, margin, y);
  if (quotation.valid_until) {
    doc.text(`Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}`, margin + 60, y);
  }
  y += lh + 6;

  const subtotalFromLines = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const subtotal = lineItems.length > 0 ? subtotalFromLines : Number(quotation.subtotal) || 0;
  const vatRate = Number(quotation.tax_rate) || 0;
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  if (lineItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Line Items', margin, y);
    y += lh + 4;

    const tableTop = y;
    const colWidths = [...PDF.colWidths];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const colStart = (i: number) => margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, tableWidth, PDF.tableHeaderHeight, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, tableWidth, PDF.tableHeaderHeight, 'S');
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Description', colStart(0) + 2, y + 4);
    doc.text('Qty', colStart(1) + 2, y + 4);
    doc.text('Unit Price', colStart(2) + 2, y + 4);
    doc.text('Line Total', colStart(3) + 2, y + 4);
    y = tableTop + PDF.tableHeaderHeight;
    doc.setFont('helvetica', 'normal');

    lineItems.forEach((item) => {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, margin + tableWidth, y);
      doc.line(colStart(0), tableTop, colStart(0), y);
      doc.line(colStart(1), tableTop, colStart(1), y);
      doc.line(colStart(2), tableTop, colStart(2), y);
      doc.line(colStart(3), tableTop, colStart(3), y);
      doc.line(margin + tableWidth, tableTop, margin + tableWidth, y);

      const desc = String(item.description).slice(0, 35);
      doc.setFontSize(9);
      doc.text(desc, colStart(0) + 2, y + 5);
      doc.text(String(item.quantity), colStart(1) + 2, y + 5);
      const curr = quotation.currency || 'ZAR';
      doc.text(formatCurrency(Number(item.unit_price), curr), colStart(2) + 2, y + 5);
      doc.text(formatCurrency(Number(item.total), curr), colStart(3) + 2, y + 5);
      y += PDF.tableRowHeight;
    });
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, tableTop, tableWidth, y - tableTop, 'S');
    y += 6;
  }

  drawHLine(doc, y);
  y += 6;
  const rightX = PDF.pageWidth - PDF.margin;
  doc.setFontSize(10);
  const curr = quotation.currency || 'ZAR';
  doc.text('Subtotal', margin, y);
  doc.text(formatCurrency(subtotal, curr), rightX, y, { align: 'right' });
  y += lh;
  doc.text(`VAT (${vatRate}%)`, margin, y);
  doc.text(formatCurrency(vatAmount, curr), rightX, y, { align: 'right' });
  y += lh;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total', margin, y);
  doc.text(formatCurrency(total, curr), rightX, y, { align: 'right' });
  y += lh + 2;
  drawHLine(doc, y, true);
  y += 8;

  if (quotation.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, y);
    y += lh;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const split = doc.splitTextToSize(quotation.notes, 170);
    doc.text(split, margin, y);
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`quotation-${quotation.quotation_number}.pdf`);
}
