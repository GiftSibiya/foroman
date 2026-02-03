import InvoiceService from '../services/invoiceService';
import InvoiceItemService from '../services/invoiceItemService';
import type { Invoice, InvoiceItem } from '../types/invoice';
import { formatCurrency } from './currency';

/** Fetch invoice + line items by id, then download PDF. Use from list view. */
export async function downloadInvoicePdfById(invoiceId: number): Promise<void> {
  const [invoice, items] = await Promise.all([
    InvoiceService.findById(invoiceId),
    InvoiceItemService.findByInvoiceId(invoiceId),
  ]);
  if (!invoice) throw new Error('Invoice not found');
  const lineItems = Array.isArray(items) ? items : [];
  await generateInvoicePdf(invoice, lineItems);
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

export async function generateInvoicePdf(
  invoice: Invoice,
  lineItems: InvoiceItem[] = []
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const margin = PDF.margin;
  let y = margin;
  const lh = PDF.lineHeight;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice ${invoice.invoice_number}`, margin, y);
  y += lh + 1;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Status: ${invoice.status}`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += lh + 4;
  drawHLine(doc, y, true);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Bill To', margin, y);
  y += lh;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_name, margin, y);
  y += lh;
  if (invoice.customer_email) {
    doc.text(invoice.customer_email, margin, y);
    y += lh;
  }
  if (invoice.customer_address) {
    doc.text(invoice.customer_address, margin, y);
    y += lh;
  }
  y += lh;
  drawHLine(doc, y);
  y += 6;

  doc.setFontSize(9);
  doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, margin, y);
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, margin + 60, y);
  y += lh + 6;

  const subtotalFromLines = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const subtotal = lineItems.length > 0 ? subtotalFromLines : Number(invoice.subtotal) || 0;
  const vatRate = Number(invoice.tax_rate) || 0;
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  if (lineItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Invoice Items', margin, y);
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

    const curr = invoice.currency || 'ZAR';
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
  const curr = invoice.currency || 'ZAR';
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

  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, y);
    y += lh;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const split = doc.splitTextToSize(invoice.notes, 170);
    doc.text(split, margin, y);
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`invoice-${invoice.invoice_number}.pdf`);
}
