/**
 * Invoice Service
 * Handles all invoice-related API calls
 */

import { skaftinClient } from '../backend';
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto, ApiResponse } from '../types/invoice';

export class InvoiceService {
  private static readonly TABLE_NAME = 'invoices';

  /**
   * Get all invoices
   */
  static async findAll(params?: {
    where?: Record<string, any>;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): Promise<Invoice[]> {
    const response = await skaftinClient.post<{ rows: Invoice[]; rowCount: number }>(
      `/app-api/database/tables/${this.TABLE_NAME}/select`,
      {
        ...params,
        columns: ['*'],
      }
    );
    return response.data.rows || [];
  }

  /**
   * Get invoice by ID
   */
  static async findById(id: number): Promise<Invoice | null> {
    const response = await skaftinClient.post<{ rows: Invoice[] }>(
      `/app-api/database/tables/${this.TABLE_NAME}/select`,
      {
        where: { id },
        limit: 1,
      }
    );
    return response.data.rows?.[0] || null;
  }

  /**
   * Create a new invoice
   */
  static async create(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await skaftinClient.post<Invoice>(
      `/app-api/database/tables/${this.TABLE_NAME}/insert`,
      { data }
    );
    return response.data;
  }

  /**
   * Update an invoice
   */
  static async update(id: number, data: Partial<CreateInvoiceDto>): Promise<{ rowCount: number }> {
    const response = await skaftinClient.put<{ rowCount: number }>(
      `/app-api/database/tables/${this.TABLE_NAME}/update`,
      {
        where: { id },
        data,
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
   */
  static async count(where?: Record<string, any>): Promise<number> {
    const response = await skaftinClient.post<{ rowCount: number }>(
      `/app-api/database/tables/${this.TABLE_NAME}/select`,
      {
        where,
        limit: 1,
      }
    );
    return response.data.rowCount || 0;
  }
}

export default InvoiceService;
