import { useParams, useNavigate } from 'react-router-dom';
import { QuotationForm } from '@/components/elements/QuotationForm';

export function QuotationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quotationId = id ? parseInt(id, 10) : undefined;

  return (
    <QuotationForm
      quotationId={quotationId}
      onSuccess={() => navigate('/app/quotations')}
      onCancel={() =>
        quotationId ? navigate(`/app/quotations/${quotationId}`) : navigate('/app/quotations')
      }
    />
  );
}
