import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state as PlanState | null;

  const [amount, setAmount] = useState(plan?.amountINR ?? 500);
  const [loading, setLoading] = useState(false);

  const description = plan
    ? `${plan.planName} Plan – Monthly Subscription`
    : 'Mentorship Session Payment';

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const order = await response.json();

      const options = {
        key: 'rzp_test_SbsDY1EgH8rPZb',
        amount: order.amount,
        currency: order.currency,
        name: 'Mentozy',
        description,
        order_id: order.id,
        handler: function (response: any) {
          alert(
            `Payment successful!${plan ? ` You are now on the ${plan.planName} plan.` : ''}\nPayment ID: ${response.razorpay_payment_id}`
          );
          navigate('/plans');
        },
        prefill: { name: '', email: '', contact: '' },
        notes: plan ? { plan_name: plan.planName, plan_type: plan.planType } : {},
        theme: { color: '#f59e0b' },
        modal: {
          ondismiss: function () {
            alert('Payment cancelled. Your plan has not been changed.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      alert('Could not initiate payment. Please ensure the backend server is running.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">

        {/* Back button */}
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-500 mt-1 text-sm">Secure checkout powered by Razorpay (Test Mode)</p>
        </div>

        {/* Plan summary (if arrived from plans page) */}
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

        {/* Amount input (editable only when no plan context) */}
        {!plan && (
          <div className="space-y-2">
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

        {/* Order summary */}
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
          onClick={handlePayment}
          disabled={loading || amount < 1}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          {loading ? 'Processing…' : `Pay ₹${amount.toLocaleString('en-IN')}`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          🔒 Payments are secured by Razorpay. This is running in test mode.
        </p>
      </div>
    </div>
  );
}
