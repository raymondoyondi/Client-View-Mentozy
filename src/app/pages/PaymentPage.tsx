import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanState {
  planName: string;
  planType: 'student' | 'teacher';
  amountINR: number;
  priceLabel: string;
}

type PaymentStatus = 'idle' | 'loading' | 'success' | 'failed';

function detectNetwork(num: string) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return null;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state as PlanState | null;

  const [amount, setAmount] = useState(plan?.amountINR ?? 500);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentId, setPaymentId] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const cvvRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);

  const network = detectNetwork(cardNumber);
  const description = plan ? `${plan.planName} Plan – Monthly Subscription` : 'Mentorship Session Payment';

  const isFormValid =
    cardName.trim().length > 1 &&
    cardNumber.replace(/\s/g, '').length >= 15 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:3001/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const order = await res.json();

      const [expiryMonth, expiryYear] = expiry.split('/');

      const rzp = new window.Razorpay({
        key: 'rzp_test_SbsDY1EgH8rPZb',
        name: 'Mentozy',
        description,
        order_id: order.id,
        notes: plan ? { plan_name: plan.planName, plan_type: plan.planType } : {},
        theme: { color: '#f59e0b' },
      });

      rzp.on('payment.success', function (resp: any) {
        setPaymentId(resp.razorpay_payment_id);
        setStatus('success');
      });

      rzp.on('payment.error', function (err: any) {
        setErrorMsg(err?.error?.description || 'Payment failed. Please check your card details.');
        setStatus('failed');
      });

      rzp.createPayment({
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        method: 'card',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          expiry_month: expiryMonth,
          expiry_year: `20${expiryYear}`,
          cvv,
          name: cardName,
        },
        email: '',
        contact: '',
      });
    } catch (err) {
      setErrorMsg('Could not connect to payment server. Please try again.');
      setStatus('failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
          {plan && <p className="text-gray-600">You are now on the <span className="font-semibold text-amber-600">{plan.planName}</span> plan.</p>}
          <p className="text-xs text-gray-400 font-mono break-all">Payment ID: {paymentId}</p>
          <button
            onClick={() => navigate('/plans')}
            className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">

        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-500 mt-1 text-sm flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure checkout · Test Mode
          </p>
        </div>

        {plan && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">Plan</span>
              <span className="font-bold text-amber-700">{plan.planName}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">Billing</span>
              <span>{plan.priceLabel} / month</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">For</span>
              <span className="capitalize">{plan.planType}s</span>
            </div>
          </div>
        )}

        {!plan && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Amount (INR)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Card Details</div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
            <input
              type="text"
              placeholder="Name on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Card Number</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setCardNumber(formatted);
                  if (formatted.replace(/\s/g, '').length === 16) expiryRef.current?.focus();
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-16 text-gray-900 placeholder-gray-400 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {network ? (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{network}</span>
                ) : (
                  <CreditCard className="w-5 h-5 text-gray-300" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Expiry</label>
              <input
                ref={expiryRef}
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => {
                  const formatted = formatExpiry(e.target.value);
                  setExpiry(formatted);
                  if (formatted.length === 5) cvvRef.current?.focus();
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">CVV</label>
              <input
                ref={cvvRef}
                type="password"
                inputMode="numeric"
                placeholder="•••"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
          </div>

          {status === 'failed' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{plan ? `${plan.planName} subscription` : 'Session fee'}</span>
              <span>₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !isFormValid}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {status === 'loading' ? 'Processing…' : `Pay ₹${amount.toLocaleString('en-IN')}`}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          Test card: 4111 1111 1111 1111 · Any future expiry · Any CVV
        </p>
      </div>
    </div>
  );
}
