import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { sendOrderEmails } from '../lib/emailService.js';
import { DELIVERY_FEE, PAYMENT_METHODS } from '../lib/constants.js';
import OrderSummary from '../components/OrderSummary.jsx';
import { fmt } from '../lib/utils.js';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: user?.email || '',
    customer_phone: '',
    date: '',
    time: '',
    notes: '',
    order_type: 'pickup',
    delivery_address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tipPct, setTipPct] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (items.length === 0) {
    return (
      <section className="py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-gray-600">
          Add some items before checking out.
        </p>
        <button onClick={() => navigate('/menu')} className="btn-primary mt-6">
          Browse menu
        </button>
      </section>
    );
  }

  const deliveryFee = form.order_type === 'delivery' ? DELIVERY_FEE : 0;
  const tipAmount =
    tipPct === 'custom'
      ? +customTip || 0
      : +((subtotal * tipPct) / 100).toFixed(2);
  const total = subtotal + deliveryFee + tipAmount;

  const submit = async () => {
    setError('');
    if (
      !form.customer_name ||
      !form.customer_email ||
      !form.customer_phone ||
      !form.date ||
      !form.time
    ) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);

    const orderId = crypto.randomUUID();
    let squarePaymentId = null;

    try {
      if (paymentMethod === 'card' || paymentMethod === 'square_card') {
        const { tokenizeCard, chargeCard } = await import(
          '../lib/squarePayment.js'
        );
        const sourceId = await tokenizeCard();
        const result = await chargeCard({
          sourceId,
          amountCents: Math.round(total * 100),
          orderId,
          email: form.customer_email,
        });
        if (!result.ok) throw new Error(result.error || 'Square charge failed');
        squarePaymentId = result.payment?.id || null;
      }

      const dbPaymentMethod =
        paymentMethod === 'card' || paymentMethod === 'square_card'
          ? 'square_card'
          : paymentMethod;

      const order = {
        id: orderId,
        user_id: user?.id || null,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        order_type: form.order_type,
        delivery_address:
          form.order_type === 'delivery' ? form.delivery_address : null,
        requested_date: form.date,
        requested_time: form.time,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        tip_amount: tipAmount,
        total_amount: total,
        payment_method: dbPaymentMethod,
        square_payment_id: squarePaymentId,
        notes: form.notes || null,
        status:
          paymentMethod === 'card' || paymentMethod === 'square_card'
            ? 'paid'
            : 'pending',
      };

      if (supabase) {
        const { error: dbErr } = await supabase.from('orders').insert(order);
        if (dbErr) throw new Error('Order save failed: ' + dbErr.message);
      }

      try {
        await sendOrderEmails(order);
      } catch (e) {
        console.warn('Email failed', e);
      }

      clearCart();
      navigate(
        `/order-success?id=${encodeURIComponent(
          orderId
        )}&pay=${dbPaymentMethod}`
      );
    } catch (e) {
      setError(e.message || 'Failed to place order.');
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold text-gray-900">Your details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                className="input"
                placeholder="Full name *"
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Phone *"
                type="tel"
                value={form.customer_phone}
                onChange={(e) =>
                  setForm({ ...form, customer_phone: e.target.value })
                }
              />
              <input
                className="input sm:col-span-2"
                placeholder="Email *"
                type="email"
                value={form.customer_email}
                onChange={(e) =>
                  setForm({ ...form, customer_email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900">When &amp; how</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                className="input"
                type="date"
                min={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  return d.toISOString().slice(0, 10);
                })()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <select
                className="input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                <option value="">Select time</option>
                {['11:00', '13:00', '15:00', '17:00', '19:00', '21:00'].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
              <select
                className="input sm:col-span-2"
                value={form.order_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    order_type: e.target.value,
                    delivery_address: '',
                  })
                }
              >
                <option value="pickup">Pickup (free)</option>
                <option value="delivery">Delivery (+${DELIVERY_FEE})</option>
              </select>
              {form.order_type === 'delivery' && (
                <textarea
                  className="input sm:col-span-2"
                  rows={2}
                  placeholder="Delivery address"
                  value={form.delivery_address}
                  onChange={(e) =>
                    setForm({ ...form, delivery_address: e.target.value })
                  }
                />
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900">Tip</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {[18, 20, 25].map((p) => (
                <button
                  key={p}
                  onClick={() => setTipPct(p)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    tipPct === p
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {p}%
                </button>
              ))}
              <button
                onClick={() => setTipPct('custom')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  tipPct === 'custom'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Custom
              </button>
              {tipPct === 'custom' && (
                <input
                  type="number"
                  min="0"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="input w-28"
                  placeholder="$"
                />
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900">Payment</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PAYMENT_METHODS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${
                    paymentMethod === p.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === p.id}
                    onChange={() => setPaymentMethod(p.id)}
                    className="accent-primary-500"
                  />
                  <span className="text-sm font-semibold">{p.label}</span>
                </label>
              ))}
            </div>

            {/* Square card container — appears only when "Pay with card" is selected */}
            {paymentMethod === 'square_card' && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-2 text-xs text-gray-500">
                  🔒 Card details are handled securely by Square. Sandbox test
                  card: <code>4111 1111 1111 1111</code>
                </p>
                <div
                  id="square-card-container"
                  className="min-h-[110px] rounded-lg bg-gray-50 p-3"
                />
              </div>
            )}

            <textarea
              className="input mt-4"
              rows={3}
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting || !form.customer_name || !form.date}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Placing order…' : `Place order · ${fmt(total)}`}
          </button>
        </div>

        <div>
          <OrderSummary deliveryFee={deliveryFee} tipAmount={tipAmount} />
        </div>
      </div>
    </section>
  );
}
