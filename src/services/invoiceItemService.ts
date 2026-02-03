/**
 * Invoice line items – stored in invoice_items table (not on invoices)
 */

import { skaftinClient } from '../backend';
import type { InvoiceItem } from '../types/invoice';

const TABLE_NAME = 'invoice_items';

export interface CreateInvoiceItemRow {
  invoice_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export class InvoiceItemService {
  static async findByInvoiceId(invoiceId: number): Promise<InvoiceItem[]> {
    const response = await skaftinClient.post(
      `/app-api/database/tables/${TABLE_NAME}/select`,
      {
        where: { invoice_id: invoiceId },
        limit: 500,
        offset: 0,
      }
    );
    const r = response as unknown as Record<string, unknown>;
    if (Array.isArray(r?.data)) return r.data as InvoiceItem[];
    if (Array.isArray(r?.rows)) return r.rows as InvoiceItem[];
    if (Array.isArray(r)) return r as InvoiceItem[];
    return [];
  }

  static async insertMany(
    invoiceId: number,
    items: (Omit<InvoiceItem, 'id' | 'invoice_id'> & { item_id?: number })[]
  ): Promise<void> {
    for (const item of items) {
      const row: CreateInvoiceItemRow = {
        invoice_id: invoiceId,
        ...(item.item_id != null && { item_id: item.item_id }),
        description: item.description,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      };
      await skaftinClient.post(
        `/app-api/database/tables/${TABLE_NAME}/insert`,
        { data: row }
      );
    }
  }

  static async deleteByInvoiceId(invoiceId: number): Promise<void> {
    await skaftinClient.delete<{ rowCount?: number }>(
      `/app-api/database/tables/${TABLE_NAME}/delete`,
      { where: { invoice_id: invoiceId } }
    );
  }
}

export default InvoiceItemService;
