import { useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentPage() {
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      const options = {
        key: 'rzp_test_SbsDY1EgH8rPZb',
        amount: order.amount,
        currency: order.currency,
        name: 'Mentozy',
        description: 'Mentorship Session Payment',
        order_id: order.id,
        handler: function (response: any) {
          alert(
            `Payment successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}`
          );
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: function () {
            alert('Payment cancelled or failed. Please try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed!\nError: ${response.error.description}`);
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
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-500 mt-1 text-sm">Secure checkout powered by Razorpay (Test Mode)</p>
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-sm font-medium text-gray-700">Amount (INR)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Session fee</span>
            <span>₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
            <span>Total</span>
            <span>₹{amount}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || amount < 1}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          {loading ? 'Processing…' : 'Pay Now'}
        </button>

        <p className="text-xs text-gray-400">
          🔒 Payments are secured by Razorpay. This is running in test mode.
        </p>
      </div>
    </div>
  );
}
