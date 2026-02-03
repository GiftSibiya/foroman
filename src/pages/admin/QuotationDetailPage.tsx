import { useParams, useNavigate } from 'react-router-dom';
import { QuotationDetail } from '@/components/elements/QuotationDetail';

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quotationId = id ? parseInt(id, 10) : NaN;

  if (!id || isNaN(quotationId)) {
    navigate('/app/quotations', { replace: true });
    return null;
  }

  return (
    <QuotationDetail
      quotationId={quotationId}
      onEdit={() => navigate(`/app/quotations/${id}/edit`)}
      onDelete={() => navigate('/app/quotations')}
    />
  );
}
