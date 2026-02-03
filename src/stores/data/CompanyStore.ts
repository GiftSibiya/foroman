import { create } from 'zustand';
import CompanyService from '../../services/companyService';
import type { Company } from '../../types/company';

interface CompanyState {
  currentCompany: Company | null;
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetchUserCompanies: (userId: number) => Promise<void>;
  setCurrentCompany: (company: Company | null) => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  currentCompany: null,
  companies: [],
  loading: false,
  error: null,

  fetchUserCompanies: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      const companies = await CompanyService.getCompaniesForUser(userId);
      set({
        companies,
        currentCompany: companies[0] || null,
        loading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load companies';
      set({ error: message, loading: false, companies: [], currentCompany: null });
      console.error('Failed to load companies:', err);
    }
  },

  setCurrentCompany: (company: Company | null) => {
    set({ currentCompany: company });
  },
}));
