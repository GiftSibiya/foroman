/**
 * Invoice Types
 */

export interface Invoice {
  id?: number;
  company_id?: number | null;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  currency?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateInvoiceDto {
  company_id?: number | null;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  currency?: string;
  notes?: string;
  items?: Omit<InvoiceItem, 'id' | 'invoice_id'>[];
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {
  id: number;
}
