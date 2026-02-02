import { useState, useEffect } from 'react';
import type { Invoice } from '../types/invoice';
import InvoiceService from '../services/invoiceService';
import './InvoiceDetail.css';

interface InvoiceDetailProps {
  invoiceId: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function InvoiceDetail({ invoiceId, onEdit, onDelete }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InvoiceService.findById(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await InvoiceService.delete(invoiceId);
      onDelete?.();
    } catch (err: any) {
      alert('Failed to delete invoice: ' + err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: 'status-draft',
      sent: 'status-sent',
      paid: 'status-paid',
      overdue: 'status-overdue',
      cancelled: 'status-cancelled',
    };
    return statusMap[status] || '';
  };

  if (loading) {
    return (
      <div className="invoice-detail-container">
        <div className="loading">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <div className="error-message">{error || 'Invoice not found'}</div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container">
      <div className="invoice-detail-header">
        <div>
          <h1>Invoice {invoice.invoice_number}</h1>
          <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        <div className="invoice-detail-actions">
          {onEdit && (
            <button onClick={onEdit} className="btn-edit">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={handleDelete} className="btn-delete">
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="invoice-detail-content">
        <div className="invoice-section">
          <h2>Customer Information</h2>
          <div className="invoice-info-grid">
            <div>
              <label>Customer Name</label>
              <p>{invoice.customer_name}</p>
            </div>
            {invoice.customer_email && (
              <div>
                <label>Email</label>
                <p>{invoice.customer_email}</p>
              </div>
            )}
            {invoice.customer_address && (
              <div className="full-width">
                <label>Address</label>
                <p>{invoice.customer_address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="invoice-section">
          <h2>Invoice Details</h2>
          <div className="invoice-info-grid">
            <div>
              <label>Issue Date</label>
              <p>{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <label>Due Date</label>
              <p>{formatDate(invoice.due_date)}</p>
            </div>
          </div>
        </div>

        <div className="invoice-section">
          <h2>Financial Summary</h2>
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_rate && invoice.tax_rate > 0 && (
              <>
                <div className="summary-row">
                  <span>Tax ({invoice.tax_rate}%)</span>
                  <span>{formatCurrency(invoice.tax_amount || 0)}</span>
                </div>
              </>
            )}
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="invoice-section">
            <h2>Notes</h2>
            <p className="invoice-notes">{invoice.notes}</p>
          </div>
        )}

        {invoice.created_at && (
          <div className="invoice-meta">
            <p>
              Created: {new Date(invoice.created_at).toLocaleString()}
              {invoice.updated_at && invoice.updated_at !== invoice.created_at && (
                <> • Updated: {new Date(invoice.updated_at).toLocaleString()}</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
