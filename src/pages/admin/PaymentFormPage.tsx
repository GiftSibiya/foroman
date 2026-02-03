import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentForm } from '@/components/elements/PaymentForm';

export function PaymentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerName = searchParams.get('customer') ?? undefined;

  return (
    <PaymentForm
      initialCustomerName={customerName}
      onSuccess={() => navigate('/app/payments')}
      onCancel={() => navigate('/app/payments')}
    />
  );
}
