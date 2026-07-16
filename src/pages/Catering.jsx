import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { sendOrderEmails } from '../lib/emailService.js';
import CategoryTabs from '../components/CategoryTabs.jsx';
import MenuCard from '../components/MenuCard.jsx';
import {
  SAMPLE_MENU,
  CATEGORIES,
  DELIVERY_FEE,
  PAYMENT_METHODS,
} from '../lib/constants.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { recommendTraySize, fmt } from '../lib/utils.js';

const STEPS = ['Event Details', 'Build Menu', 'Review & Place Order'];

const MIN_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
})();

const MAX_DAILY_ORDERS = 4;

function dayColor(count) {
  if (count >= MAX_DAILY_ORDERS)
    return {
      bg: 'bg-red-100',
      border: 'border-red-400',
      text: 'text-red-800',
    };
  if (count >= 2)
    return {
      bg: 'bg-yellow-100',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
    };
  return {
    bg: 'bg-white',
    border: 'border-gray-300',
    text: 'text-gray-900',
  };
}

export default function Catering() {
  const navigate = useNavigate();
  const { items, subtotal, updateQty, removeItem } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [menu, setMenu] = useState(SAMPLE_MENU);
  const [active, setActive] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [details, setDetails] = useState({
    guests: 10,
    date: '',
    time: '',
    order_type: 'pickup',
    delivery_address: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [tipPct, setTipPct] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [dayOrderCount, setDayOrderCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // 🆕 Auto-attach the Square card form the moment the user picks
  // "Pay with card" — so the card iframe is ready BEFORE they click
  // "Place order" (no race condition).
  useEffect(() => {
    if (paymentMethod === 'square_card') {
      import('../lib/squarePayment.js').then(({ attachCardIfReady }) =>
        attachCardIfReady()
      );
    }
  }, [paymentMethod]);

  useEffect(() => {
    let cancel = false;
    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');
      if (!cancel && data?.length) setMenu(data);
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!details.date || !isSupabaseConfigured) {
      setDayOrderCount(0);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('requested_date', details.date)
        .neq('status', 'cancelled');
      setDayOrderCount((data || []).length);
    })();
  }, [details.date]);

  useEffect(() => {
    if (
      details.order_type !== 'delivery' ||
      !details.delivery_address ||
      details.delivery_address.trim().length < 5
    ) {
      setDeliveryFee(0);
      return;
    }
    setCalculatingDelivery(true);
    setTimeout(() => {
      setDeliveryFee(DELIVERY_FEE);
      setCalculatingDelivery(false);
    }, 600);
  }, [details.delivery_address, details.order_type]);

  const phoneDigits = details.customer_phone.replace(/\D/g, '');
  const dayFull = dayOrderCount >= MAX_DAILY_ORDERS;
  const step1Valid =
    !!details.date &&
    !dayFull &&
    !!details.time &&
    details.customer_name.trim().length >= 2 &&
    phoneDigits.length >= 10 &&
    /@/.test(details.customer_email) &&
    (details.order_type === 'pickup' ||
      (details.delivery_address.trim().length >= 5 && deliveryFee > 0));
  const step2Valid = items.length > 0;
  const recommendation = recommendTraySize(details.guests);

  const dc = dayColor(dayOrderCount);

  const handleStep1Next = () => {
    if (!details.date) {
      setErrorMsg('Please choose a date.');
      return;
    }
    if (dayFull) {
      setErrorMsg('That date is fully booked. Pick another.');
      return;
    }
    if (!details.time) {
      setErrorMsg('Please pick a time slot.');
      return;
    }
    if (details.customer_name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (phoneDigits.length < 10) {
      setErrorMsg('Please enter a valid phone number (10+ digits).');
      return;
    }
    if (!/@/.test(details.customer_email)) {
      setErrorMsg('Please enter a valid email.');
      return;
    }
    if (
      details.order_type === 'delivery' &&
      (details.delivery_address.trim().length < 5 || deliveryFee === 0)
    ) {
      setErrorMsg('Please enter a complete delivery address.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const tipAmount =
    tipPct === 'custom'
      ? +customTip || 0
      : +((subtotal * tipPct) / 100).toFixed(2);
  const total = subtotal + deliveryFee + tipAmount;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-center text-4xl font-display font-bold text-gray-900 sm:text-5xl">
        Catering Request
      </h1>
      <p className="mt-2 text-center text-gray-600">
        Plan your event in 3 simple steps.
      </p>

      <ol className="mx-auto mt-8 flex max-w-2xl items-center justify-between">
        {STEPS.map((label, idx) => {
          const n = idx + 1,
            isActive = step === n,
            done = step > n;
          return (
            <li key={label} className="flex flex-1 items-center">
              <div
                className={`
                flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold
                ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : done
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-600'
                }
              `}
              >
                {done ? <Check size={16} /> : n}
              </div>
              <span
                className={`ml-2 hidden text-sm font-semibold sm:inline ${
                  isActive ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                {label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className="mx-2 h-px flex-1 bg-gray-200 sm:mx-4" />
              )}
            </li>
          );
        })}
      </ol>

      {errorMsg && step === 1 && (
        <div className="mx-auto mt-4 max-w-5xl rounded-lg bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">
          ⚠ {errorMsg}
        </div>
      )}

      {step === 1 && (
        <div className="mt-10 space-y-6">
          <div className="card space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Event details</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  Date{' '}
                  <span className="text-xs text-gray-500">
                    ({MAX_DAILY_ORDERS - dayOrderCount} of{' '}
                    {MAX_DAILY_ORDERS} slots)
                  </span>
                </label>
                <input
                  type="date"
                  className={`input ${dc.bg} ${dc.border} ${dc.text} font-semibold`}
                  min={MIN_DATE}
                  value={details.date}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      date: e.target.value,
                      time: '',
                    })
                  }
                />
                {dayFull && (
                  <p className="mt-1 text-xs text-red-700 font-semibold">
                    ⚠ Fully booked.
                  </p>
                )}
              </div>
              <div>
                <label className="label">Time slot</label>
                <select
                  className="input"
                  value={details.time}
                  onChange={(e) =>
                    setDetails({ ...details, time: e.target.value })
                  }
                  disabled={dayFull}
                >
                  <option value="">Select a time</option>
                  {['11:00', '13:00', '15:00', '17:00', '19:00', '21:00'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Kitchen opens 11:00 AM · 2-hour gaps · Max{' '}
                  {MAX_DAILY_ORDERS}/day
                </p>
              </div>
            </div>

            <div>
              <label className="label">Service type</label>
              <div className="grid grid-cols-2 gap-3">
                {['pickup', 'delivery'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setDetails({
                        ...details,
                        order_type: t,
                        delivery_address:
                          t === 'pickup' ? '' : details.delivery_address,
                      })
                    }
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold capitalize transition ${
                      details.order_type === t
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:border-primary-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {details.order_type === 'delivery' && (
                <div className="mt-3">
                  <textarea
                    rows={2}
                    className="input"
                    placeholder="Delivery address (e.g. 456 Park Ave, Baltimore, MD 21201)"
                    value={details.delivery_address}
                    onChange={(e) =>
                      setDetails({
                        ...details,
                        delivery_address: e.target.value,
                      })
                    }
                  />
                  {calculatingDelivery && (
                    <p className="mt-1 text-xs text-gray-500">
                      Calculating delivery fee…
                    </p>
                  )}
                  {!calculatingDelivery && deliveryFee > 0 && (
                    <p className="mt-1 text-xs text-primary-700">
                      ✓ Delivery available · ${deliveryFee}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name *</label>
                <input
                  className="input"
                  value={details.customer_name}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      customer_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">
                  Phone *{' '}
                  <span className="text-xs text-gray-500">(10+ digits)</span>
                </label>
                <input
                  className="input"
                  type="tel"
                  value={details.customer_phone}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      customer_phone: e.target.value,
                    })
                  }
                  placeholder="(443) 547-1326"
                />
                {details.customer_phone &&
                  phoneDigits.length > 0 &&
                  phoneDigits.length < 10 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Needs {10 - phoneDigits.length} more digit
                      {10 - phoneDigits.length > 1 ? 's' : ''}.
                    </p>
                  )}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email *</label>
                <input
                  className="input"
                  type="email"
                  value={details.customer_email}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      customer_email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">
                  Notes (allergies, occasion — optional)
                </label>
                <textarea
                  rows={3}
                  className="input"
                  value={details.notes}
                  onChange={(e) =>
                    setDetails({ ...details, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStep1Next}
              disabled={!step1Valid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: build menu <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <CategoryTabs active={active} onChange={setActive} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {(active === 'all'
                ? menu
                : menu.filter((i) => i.category === active)
              ).map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-6">
              <button onClick={() => setStep(1)} className="btn-outline">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-gray-900">Your cart</h3>
              <p className="mt-1 text-xs text-gray-500">
                Selected from the menu
              </p>

              {items.length === 0 ? (
                <p className="mt-6 text-center text-sm text-gray-500">
                  No items yet. Click "Add" on the menu items.
                </p>
              ) : (
                <>
                  <ul className="mt-4 max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {items.map((line) => (
                      <li
                        key={line.key}
                        className="flex items-start justify-between gap-3 py-3"
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <img
                            src={line.image_url}
                            alt=""
                            className="h-10 w-10 flex-shrink-0 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="min-w-0 text-sm">
                            <div className="truncate font-semibold text-gray-900">
                              {line.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {line.sizeLabel}
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              <button
                                onClick={() =>
                                  updateQty(
                                    line.key,
                                    line.quantity - 1
                                  )
                                }
                                className="rounded border border-gray-200 px-1.5 text-xs hover:bg-gray-50"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQty(
                                    line.key,
                                    line.quantity + 1
                                  )
                                }
                                className="rounded border border-gray-200 px-1.5 text-xs hover:bg-gray-50"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeItem(line.key)}
                                className="ml-1 text-gray-400 hover:text-red-600"
                                aria-label="Remove"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {fmt(line.unitPrice * line.quantity)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {fmt(line.unitPrice)} ea
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="font-semibold">{fmt(subtotal)}</dd>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <dt>Delivery</dt>
                        <dd className="font-semibold">{fmt(deliveryFee)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                      <dt>Total</dt>
                      <dd className="text-primary-600">
                        {fmt(subtotal + deliveryFee)}
                      </dd>
                    </div>
                  </dl>
                </>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to checkout{' '}
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900">Event</h3>
              <p className="mt-2 text-sm text-gray-600">
                {details.customer_name} · {details.customer_phone} ·{' '}
                {details.customer_email}
                <br />
                {details.guests} guests · {recommendation.label}
                <br />
                {details.date} at {details.time} · {details.order_type}
                {details.delivery_address
                  ? ` to ${details.delivery_address}`
                  : ''}
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900">Items</h3>
              {items.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No items.</p>
              ) : (
                <ul className="mt-2 divide-y divide-gray-100">
                  {items.map((line) => (
                    <li
                      key={line.key}
                      className="flex justify-between py-1.5 text-sm"
                    >
                      <span>
                        {line.quantity}× {line.name}{' '}
                        <span className="text-gray-500">
                          ({line.sizeLabel})
                        </span>
                      </span>
                      <span className="font-semibold">
                        {fmt(line.unitPrice * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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
              <h3 className="font-semibold text-gray-900">Payment method</h3>
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

              {paymentMethod === 'square_card' && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="mb-2 text-xs text-gray-500">
                    🔒 Card details are handled securely by Square. Sandbox
                    test card: <code>4111 1111 1111 1111</code>
                  </p>
                  {/* ⬇️ Stealth form wrapper — kills Chrome autofill overlay */}
                  <form
                    autoComplete="off"
                    onSubmit={(e) => e.preventDefault()}
                    data-lpignore="true"
                    data-form-type="other"
                  >
                    <div
                      id="square-card-container"
                      className="min-h-[110px] rounded-lg bg-gray-50 p-3"
                    />
                  </form>
                </div>
              )}
            </div>

            {orderError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {orderError}
              </div>
            )}

            <div className="flex justify-between">
              <button
                disabled={submitting}
                onClick={() => setStep(2)}
                className="btn-outline"
              >
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button
                onClick={() =>
                  placeOrder({
                    items,
                    subtotal,
                    deliveryFee,
                    tipAmount,
                    total,
                    paymentMethod,
                    details,
                    navigate,
                    user,
                    setSubmitting,
                    setOrderError,
                  })
                }
                disabled={submitting || items.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Placing order…' : `Place order · ${fmt(total)}`}
              </button>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-gray-900">Order summary</h3>
              <dl className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold">{fmt(subtotal)}</dd>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <dt>Delivery</dt>
                    <dd className="font-semibold">{fmt(deliveryFee)}</dd>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between">
                    <dt>
                      Tip ({tipPct === 'custom' ? 'custom' : tipPct + '%'})
                    </dt>
                    <dd className="font-semibold">{fmt(tipAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="text-primary-600">{fmt(total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

async function placeOrder({
  items,
  subtotal,
  deliveryFee,
  tipAmount,
  total,
  paymentMethod,
  details,
  navigate,
  user,
  setSubmitting,
  setOrderError,
}) {
  setSubmitting(true);
  setOrderError('');
  const orderId = crypto.randomUUID();
  let squarePaymentId = null;
  try {
    if (paymentMethod === 'square_card') {
      const { tokenizeCard, chargeCard } = await import(
        '../lib/squarePayment.js'
      );
      const sourceId = await tokenizeCard();
      const result = await chargeCard({
        sourceId,
        amountCents: Math.round(total * 100),
        orderId,
        email: details.customer_email,
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
      customer_name: details.customer_name,
      customer_email: details.customer_email,
      customer_phone: details.customer_phone,
      order_type: details.order_type,
      delivery_address:
        details.order_type === 'delivery'
          ? details.delivery_address
          : null,
      requested_date: details.date,
      requested_time: details.time,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      tip_amount: tipAmount,
      total_amount: total,
      payment_method: dbPaymentMethod,
      square_payment_id: squarePaymentId,
      notes: details.notes || null,
      status: paymentMethod === 'square_card' ? 'paid' : 'pending',
    };

    if (supabase) {
      const { error } = await supabase.from('orders').insert(order);
      if (error) throw new Error('Order save failed: ' + error.message);
    }

    try {
      await sendOrderEmails(order);
    } catch (e) {
      console.warn('Email failed', e);
    }

    navigate(
      `/order-success?id=${encodeURIComponent(orderId)}&pay=${dbPaymentMethod}`
    );
  } catch (e) {
    setOrderError(e.message || 'Failed to place order.');
    setSubmitting(false);
  }
}
