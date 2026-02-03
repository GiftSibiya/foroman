/**
 * Company Service
 * Handles company and user_companies API calls
 */

import { skaftinClient } from '../backend';
import type { Company, CreateCompanyDto, UserCompany } from '../types/company';

export class CompanyService {
  static async create(data: CreateCompanyDto): Promise<Company> {
    const response = await skaftinClient.post<Company>(
      '/app-api/database/tables/companies/insert',
      { data }
    );
    return response.data;
  }

  static async linkUserToCompany(userId: number, companyId: number): Promise<UserCompany> {
    const response = await skaftinClient.post<UserCompany>(
      '/app-api/database/tables/user_companies/insert',
      { data: { user_id: userId, company_id: companyId } }
    );
    return response.data;
  }

  static async getUserCompanyIds(userId: number): Promise<number[]> {
    const response = await skaftinClient.post<
      { rows: UserCompany[]; rowCount: number } | UserCompany[]
    >('/app-api/database/tables/user_companies/select', {
      where: { user_id: userId },
      limit: 100,
      offset: 0,
    });
    const data = response.data;
    const rows = Array.isArray(data) ? data : data?.rows || [];
    return rows.map((r) => r.company_id).filter(Boolean);
  }

  static async getCompaniesForUser(userId: number): Promise<Company[]> {
    const companyIds = await this.getUserCompanyIds(userId);
    if (companyIds.length === 0) return [];

    const companies: Company[] = [];
    for (const id of companyIds) {
      const company = await this.getById(id);
      if (company) companies.push(company);
    }
    return companies;
  }

  static async getById(id: number): Promise<Company | null> {
    const response = await skaftinClient.post<
      { rows: Company[] } | Company[]
    >('/app-api/database/tables/companies/select', {
      where: { id },
      limit: 1,
      offset: 0,
    });
    const data = response.data;
    if (Array.isArray(data)) return data[0] || null;
    return data?.rows?.[0] || null;
  }

  static async getDefaultCompanyForUser(userId: number): Promise<Company | null> {
    const companies = await this.getCompaniesForUser(userId);
    return companies[0] || null;
  }
}

export default CompanyService;
