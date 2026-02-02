import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceDetail } from '../components/InvoiceDetail';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = id ? parseInt(id, 10) : NaN;

  if (!id || isNaN(invoiceId)) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <InvoiceDetail
      invoiceId={invoiceId}
      onEdit={() => navigate(`/invoices/${id}/edit`)}
      onDelete={() => navigate('/')}
    />
  );
}
