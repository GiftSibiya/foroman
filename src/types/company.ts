/**
 * Company types
 */

export interface Company {
  id?: number;
  user_id?: number;
  name: string;
  address?: string;
  tax_id?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyDto {
  name: string;
  address?: string;
  tax_id?: string;
}

export interface UserCompany {
  id?: number;
  user_id: number;
  company_id: number;
  created_at?: string;
  updated_at?: string;
}
