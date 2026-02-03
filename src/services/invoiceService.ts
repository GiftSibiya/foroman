/**
 * Invoice Service
 * Handles all invoice-related API calls
 */

import { skaftinClient } from '../backend';
import type { Invoice, CreateInvoiceDto } from '../types/invoice';

export class InvoiceService {
  private static readonly TABLE_NAME = 'invoices';

  /** Normalize select response: API may return { data: T[] } or { rows: T[] } */
  private static normalizeRows<T>(response: unknown): T[] {
    const r = response as Record<string, unknown>;
    if (Array.isArray(r?.data)) return r.data as T[];
    if (Array.isArray(r?.rows)) return r.rows as T[];
    if (Array.isArray(r)) return r as T[];
    return [];
  }

  /**
   * Get all invoices
   * POST /app-api/database/tables/invoices/select with limit & offset
   */
  static async findAll(params?: {
    where?: Record<string, unknown>;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): Promise<Invoice[]> {
    const response = await skaftinClient.post(
      `/app-api/database/tables/${this.TABLE_NAME}/select`,
      {
        limit: params?.limit ?? 5000,
        offset: params?.offset ?? 0,
        ...(params?.where && { where: params.where }),
        ...(params?.orderBy && { orderBy: params.orderBy }),
        ...(params?.orderDirection && { orderDirection: params.orderDirection }),
      }
    );
    const rows = this.normalizeRows<Record<string, unknown>>(response);
    return rows.map((inv) => this.normalizeInvoice(inv));
  }

  /**
   * Get invoice by ID
   * POST /app-api/database/tables/invoices/select with limit & offset
   */
  static async findById(id: number): Promise<Invoice | null> {
    const response = await skaftinClient.post(
      `/app-api/database/tables/${this.TABLE_NAME}/select`,
      {
        where: { id },
        limit: 1,
        offset: 0,
      }
    );
    const rows = this.normalizeRows<Record<string, unknown>>(response);
    const inv = rows[0] ?? null;
    return inv ? this.normalizeInvoice(inv) : null;
  }

  /** Ensure numeric fields are numbers (API may return strings) */
  private static normalizeInvoice(raw: Record<string, unknown>): Invoice {
    return {
      ...raw,
      id: raw.id != null ? Number(raw.id) : undefined,
      subtotal: Number(raw.subtotal) || 0,
      tax_rate: raw.tax_rate != null ? Number(raw.tax_rate) : undefined,
      tax_amount: raw.tax_amount != null ? Number(raw.tax_amount) : undefined,
      total: Number(raw.total) || 0,
    } as Invoice;
  }

  /**
   * Create a new invoice (line items go to invoice_items table via InvoiceItemService)
   */
  static async create(data: CreateInvoiceDto): Promise<Invoice> {
    const { items: _items, ...invoiceRow } = data;
    const response = await skaftinClient.post<Invoice>(
      `/app-api/database/tables/${this.TABLE_NAME}/insert`,
      { data: invoiceRow }
    );
    return response.data;
  }

  /**
   * Update an invoice (line items are managed separately via InvoiceItemService)
   */
  static async update(id: number, data: Partial<CreateInvoiceDto>): Promise<{ rowCount: number }> {
    const { items: _items, ...invoiceRow } = data;
    const response = await skaftinClient.put<{ rowCount: number }>(
      `/app-api/database/tables/${this.TABLE_NAME}/update`,
      {
        where: { id },
        data: invoiceRow,
      }
    );
    return response.data;
  }

  /**
   * Delete an invoice
   */
  static async delete(id: number): Promise<{ rowCount: number }> {
    const response = await skaftinClient.delete<{ rowCount: number }>(
      `/app-api/database/tables/${this.TABLE_NAME}/delete`,
      {
        where: { id },
      }
    );
    return response.data;
  }

  /**
   * Get invoices by status
   */
  static async findByStatus(status: string): Promise<Invoice[]> {
    return this.findAll({
      where: { status },
      orderBy: 'issue_date',
      orderDirection: 'DESC',
    });
  }

  /**
   * Count invoices
   * POST /app-api/database/tables/invoices/select with limit & offset
   */
  static async count(where?: Record<string, unknown>): Promise<number> {
    const response = await skaftinClient.post(
      `/app-api/database/tables/${this.TABLE_NAME}/select`,
      {
        ...(where && { where }),
        limit: 1,
        offset: 0,
      }
    );
    const r = response as unknown as Record<string, unknown>;
    if (typeof r?.rowCount === 'number') return r.rowCount;
    const rows = this.normalizeRows(r);
    return rows.length;
  }
}

export default InvoiceService;
