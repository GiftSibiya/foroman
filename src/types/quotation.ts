/**
 * Quotation types
 */

export interface Quotation {
  id?: number;
  company_id?: number | null;
  quotation_number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  issue_date: string;
  valid_until?: string;
  status: QuotationStatus;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface QuotationLine {
  id?: number;
  quotation_id?: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateQuotationDto {
  company_id?: number | null;
  quotation_number: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  issue_date: string;
  valid_until?: string;
  status: QuotationStatus;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  notes?: string;
  items?: Omit<QuotationLine, 'id' | 'quotation_id'>[];
}
