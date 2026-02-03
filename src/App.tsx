import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/elements/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from '@pages/auth/Login';
import { Register } from '@pages/auth/Register';
import { VerifyOtp } from '@pages/auth/VerifyOtp';
import { ForgotPassword } from '@pages/auth/ForgotPassword';
import { VerifyForgotPasswordOtp } from '@pages/auth/VerifyForgotPasswordOtp';
import { ResetPassword } from '@pages/auth/ResetPassword';
import { Onboard } from '@pages/admin/Onboard';
import { DashboardPage } from '@pages/admin/DashboardPage';
import { InvoiceListPage } from '@pages/admin/InvoiceListPage';
import { InvoiceDetailPage } from '@pages/admin/InvoiceDetailPage';
import { InvoiceFormPage } from '@pages/admin/InvoiceFormPage';
import { CustomersPage } from '@pages/admin/CustomersPage';
import { CustomerDetailPage } from '@pages/admin/CustomerDetailPage';
import { CustomerFormPage } from '@pages/admin/CustomerFormPage';
import { ItemsPage } from '@pages/admin/ItemsPage';
import { ItemDetailPage } from '@pages/admin/ItemDetailPage';
import { ItemFormPage } from '@pages/admin/ItemFormPage';
import { QuotationListPage } from '@pages/admin/QuotationListPage';
import { QuotationDetailPage } from '@pages/admin/QuotationDetailPage';
import { QuotationFormPage } from '@pages/admin/QuotationFormPage';
import { StatementsPage } from '@pages/admin/StatementsPage';
import { PaymentsPage } from '@pages/admin/PaymentsPage';
import { PaymentFormPage } from '@pages/admin/PaymentFormPage';
import { SettingsPage } from '@pages/admin/SettingsPage';
import { ProfileSettingsPage } from '@pages/admin/settings/ProfileSettingsPage';
import { CompanySettingsPage } from '@pages/admin/settings/CompanySettingsPage';
import { PreferencesSettingsPage } from '@pages/admin/settings/PreferencesSettingsPage';
import './App.css';
import { AppLayout } from './layouts/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/verify" element={<VerifyForgotPasswordOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<Outlet />}>
          <Route index element={<CustomersPage />} />
          <Route path="create" element={<CustomerFormPage />} />
          <Route path=":id" element={<CustomerDetailPage />} />
        </Route>
        <Route path="invoices" element={<Outlet />}>
          {/* Nested invoice routes */}
          <Route index element={<InvoiceListPage />} />
          <Route path="create" element={<InvoiceFormPage />} />
          <Route path=":id" element={<InvoiceDetailPage />} />
          <Route path=":id/edit" element={<InvoiceFormPage />} />
        </Route>
        <Route path="items" element={<Outlet />}>
          <Route index element={<ItemsPage />} />
          <Route path="create" element={<ItemFormPage />} />
          <Route path=":id" element={<ItemDetailPage />} />
          <Route path=":id/edit" element={<ItemFormPage />} />
        </Route>
        <Route path="quotations" element={<Outlet />}>
          <Route index element={<QuotationListPage />} />
          <Route path="create" element={<QuotationFormPage />} />
          <Route path=":id" element={<QuotationDetailPage />} />
          <Route path=":id/edit" element={<QuotationFormPage />} />
        </Route>
        <Route path="payments" element={<Outlet />}>
          <Route index element={<PaymentsPage />} />
          <Route path="create" element={<PaymentFormPage />} />
        </Route>
        <Route path="statements" element={<StatementsPage />} />
        <Route path="settings" element={<SettingsPage />}>
          <Route index element={<ProfileSettingsPage />} />
          <Route path="company" element={<CompanySettingsPage />} />
          <Route path="preferences" element={<PreferencesSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
