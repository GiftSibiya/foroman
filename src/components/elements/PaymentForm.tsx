import { useState, useEffect, useCallback } from 'react';
import type { CreatePaymentDto } from '../../types/payment';
import { PAYMENT_METHODS } from '../../types/payment';
import type { Customer } from '../../types/customer';
import PaymentService from '../../services/paymentService';
import CustomerService from '../../services/customerService';
import { useCompanyStore } from '../../stores/data/CompanyStore';
import AppLabledAutocomplete from '../forms/AppLabledAutocomplete';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

interface PaymentFormProps {
  initialCustomerName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ initialCustomerName, onSuccess, onCancel }: PaymentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePaymentDto>({
    customer_name: initialCustomerName ?? '',
    amount: 0,
    currency: 'ZAR',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'eft',
    reference: '',
  });

  useEffect(() => {
    CustomerService.findAll().then(setCustomers);
  }, []);

  useEffect(() => {
    if (initialCustomerName && customers.length > 0 && !selectedCustomer) {
      const match = customers.find(
        (c) => c.name.toLowerCase() === initialCustomerName.toLowerCase()
      );
      if (match) {
        setSelectedCustomer(match);
        setFormData((prev) => ({ ...prev, customer_name: match.name }));
      } else {
        setFormData((prev) => ({ ...prev, customer_name: initialCustomerName }));
      }
    }
  }, [initialCustomerName, customers, selectedCustomer]);

  const handleChange = useCallback((field: keyof CreatePaymentDto, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customer_name: customer.name }));
  }, []);

  const handleCustomerClear = useCallback(() => {
    setSelectedCustomer(null);
    setFormData((prev) => ({ ...prev, customer_name: '' }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name?.trim()) {
      setError('Customer is required');
      return;
    }
    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const companyId = useCompanyStore.getState().currentCompany?.id;
      await PaymentService.create({
        ...formData,
        amount: Number(formData.amount),
        ...(companyId != null && { company_id: companyId }),
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-[inherit]';
  const labelClass = 'mb-1 text-sm font-medium text-gray-700 dark:text-gray-300';
  const groupClass = 'flex flex-col';

  return (
    <div className=" mx-auto">
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Record payment</h2>
      {error && (
        <div className="mb-2 px-3 py-2 text-sm rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <div className="pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
          <AppLabledAutocomplete
            label="Customer *"
            options={customers}
            value={selectedCustomer?.id != null ? String(selectedCustomer.id) : ''}
            displayValue={selectedCustomer?.name ?? formData.customer_name}
            accessor="name"
            valueAccessor="id"
            onSelect={handleCustomerSelect}
            onClear={handleCustomerClear}
            required
            placeholder="Search customer..."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          <div className={groupClass}>
            <label htmlFor="amount" className={labelClass}>
              Amount *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min={0}
              value={formData.amount || ''}
              onChange={(e) => handleChange('amount', e.target.value ? parseFloat(e.target.value) : 0)}
              className={inputClass}
              required
            />
          </div>
          <div className={groupClass}>
            <label htmlFor="currency" className={labelClass}>
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency || 'ZAR'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className={inputClass}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className={groupClass}>
            <label htmlFor="date" className={labelClass}>
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className={groupClass}>
            <label htmlFor="payment_method" className={labelClass}>
              Payment method
            </label>
            <select
              id="payment_method"
              value={formData.payment_method || 'eft'}
              onChange={(e) => handleChange('payment_method', e.target.value)}
              className={inputClass}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className={groupClass}>
            <label htmlFor="reference" className={labelClass}>
              Reference
            </label>
            <input
              id="reference"
              type="text"
              value={formData.reference || ''}
              onChange={(e) => handleChange('reference', e.target.value)}
              className={inputClass}
              placeholder="e.g. bank transfer, cheque #"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Save payment'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
