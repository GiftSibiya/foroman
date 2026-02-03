import { create } from 'zustand';
import CustomerService from '../../services/customerService';
import { useCompanyStore } from './CompanyStore';
import type { Customer } from '../../types/customer';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  removeCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    const companyId = useCompanyStore.getState().currentCompany?.id;
    const where = companyId != null ? { company_id: companyId } : undefined;
    set({ loading: true, error: null });
    try {
      const data = await CustomerService.findAll({
        where,
        orderBy: 'name',
        orderDirection: 'ASC',
      });
      set({ customers: data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
      set({ error: message, loading: false });
      console.error('Failed to load customers:', err);
    }
  },

  removeCustomer: async (id: number) => {
    try {
      await CustomerService.delete(id);
      set({ customers: get().customers.filter((c) => c.id !== id) });
    } catch (err) {
      throw err;
    }
  },
}));
