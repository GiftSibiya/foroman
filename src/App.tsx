import { Routes, Route, Navigate } from 'react-router-dom';
import { InvoicesLayout } from './layouts/InvoicesLayout';
import { InvoiceListPage } from './pages/InvoiceListPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { InvoiceFormPage } from './pages/InvoiceFormPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<InvoicesLayout />}>
        <Route index element={<InvoiceListPage />} />
        <Route path="invoices/create" element={<InvoiceFormPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
