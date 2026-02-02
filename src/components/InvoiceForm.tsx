import { useState, useEffect } from 'react';
import type { CreateInvoiceDto, InvoiceStatus } from '../types/invoice';
import InvoiceService from '../services/invoiceService';
import './InvoiceForm.css';

interface InvoiceFormProps {
  invoiceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InvoiceForm({ invoiceId, onSuccess, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateInvoiceDto>({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total: 0,
    notes: '',
  });

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      const invoice = await InvoiceService.findById(invoiceId);
      if (invoice) {
        setFormData({
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          customer_email: invoice.customer_email || '',
          customer_address: invoice.customer_address || '',
          issue_date: invoice.issue_date.split('T')[0],
          due_date: invoice.due_date.split('T')[0],
          status: invoice.status,
          subtotal: invoice.subtotal,
          tax_rate: invoice.tax_rate || 0,
          tax_amount: invoice.tax_amount || 0,
          total: invoice.total,
          notes: invoice.notes || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (subtotal: number, taxRate: number) => {
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { taxAmount, total };
  };

  const handleChange = (field: keyof CreateInvoiceDto, value: any) => {
    const updated = { ...formData, [field]: value };
    
    if (field === 'subtotal' || field === 'tax_rate') {
      const subtotal = field === 'subtotal' ? value : updated.subtotal;
      const taxRate = field === 'tax_rate' ? value : updated.tax_rate || 0;
      const { taxAmount, total } = calculateTotals(subtotal, taxRate);
      updated.tax_amount = taxAmount;
      updated.total = total;
    }
    
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.invoice_number || !formData.customer_name) {
      setError('Invoice number and customer name are required');
      return;
    }

    try {
      setLoading(true);
      if (invoiceId) {
        await InvoiceService.update(invoiceId, formData);
      } else {
        await InvoiceService.create(formData);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loading && invoiceId) {
    return <div className="invoice-form-container">Loading invoice...</div>;
  }

  return (
    <div className="invoice-form-container">
      <h2>{invoiceId ? 'Edit Invoice' : 'Create Invoice'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="invoice_number">Invoice Number *</label>
            <input
              id="invoice_number"
              type="text"
              value={formData.invoice_number}
              onChange={(e) => handleChange('invoice_number', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as InvoiceStatus)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Customer Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_name">Customer Name *</label>
              <input
                id="customer_name"
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_email">Email</label>
              <input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customer_address">Address</label>
            <textarea
              id="customer_address"
              value={formData.customer_address}
              onChange={(e) => handleChange('customer_address', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Dates</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issue_date">Issue Date</label>
              <input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Financial Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subtotal">Subtotal</label>
              <input
                id="subtotal"
                type="number"
                step="0.01"
                min="0"
                value={formData.subtotal}
                onChange={(e) => handleChange('subtotal', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tax_rate">Tax Rate (%)</label>
              <input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.tax_rate}
                onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tax_amount">Tax Amount</label>
              <input
                id="tax_amount"
                type="number"
                step="0.01"
                value={formData.tax_amount}
                readOnly
                className="readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="total">Total</label>
              <input
                id="total"
                type="number"
                step="0.01"
                value={formData.total}
                readOnly
                className="readonly total-field"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Saving...' : invoiceId ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
