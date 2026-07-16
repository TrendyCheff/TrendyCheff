import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { CONTACT } from '../lib/constants.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const HANDLES = {
  paypalMe: 'https://paypal.me/trendycheff',
  venmoUsername: 'trendy-cheff',
  cashappCashtag: 'trendycheff',
  zelleEmail: 'trendycheff@gmail.com',
};

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const [method, setMethod] = useState(params.get('pay') || 'card');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const id = params.get('id') || '';
  const amount = parseFloat(params.get('amount') || '0').toFixed(2);
  const email = params.get('email') || '';
  const handleOrderRef = 'Order #' + id.slice(0, 8);

  const paypalUrl =
    HANDLES.paypalMe +
    '/' +
    amount +
    '?note=' +
    encodeURIComponent(handleOrderRef);
  const venmoUrl =
    'https://venmo.com/' +
    HANDLES.venmoUsername +
    '?txn=pay&amount=' +
    amount +
    '&note=' +
    encodeURIComponent(handleOrderRef);
  const cashappUrl =
    'https://cash.app/' +
    HANDLES.cashappCashtag +
    '/' +
    amount +
    '?note=' +
    encodeURIComponent(handleOrderRef);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      window.alert('Copy this: ' + text);
    }
  };

  const switchMethod = (m) => {
    if (m === method) return;
    setMethod(m);
    setConfirmed(false);
  };

  const confirmPayment = async () => {
    if (confirmed) return;
    setConfirming(true);
    try {
      if (isSupabaseConfigured && id) {
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', id);
      }
      setConfirmed(true);
    } catch (e) {
      setConfirmed(true);
    } finally {
      setConfirming(false);
    }
  };

  const resendCardEmail = () => {
    window.location.href =
      'mailto:trendycheff@gmail.com?subject=Resend card payment link - ' +
      id +
      '&body=Hi, I just placed order #' +
      id.slice(0, 8) +
      ' for $' +
      amount +
      '. Please resend my card payment link. Thanks!';
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="text-center">
        {confirmed ? (
          <>
            <CheckCircle2 className="mx-auto text-green-500" size={64} />
            <h1 className="mt-4 text-3xl font-display font-bold text-gray-900">
              Order locked in. Thank you.
            </h1>
            <p className="mt-2 text-gray-600">We will be in touch soon.</p>
          </>
        ) : (
          <>
            <ShieldCheck className="mx-auto text-primary-500" size={64} />
            <h1 className="mt-4 text-3xl font-display font-bold text-gray-900">
              Complete your payment
            </h1>
            <p className="mt-2 text-gray-600">
              Pick a method below. You can switch at any time.
            </p>
          </>
        )}
        {id && (
          <p className="mt-2 text-xs text-gray-500">
            Reference: <span className="font-mono">#{id.slice(0, 8)}</span>
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-primary-500 text-white p-6 text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
          Amount due
        </p>
        <p className="mt-2 text-5xl font-bold">${amount}</p>
      </div>

      {!confirmed && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Pay via (click to switch)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => switchMethod('card')}
              className={
                'rounded-full px-4 py-2 text-sm font-bold transition ' +
                (method === 'card'
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }
            >
              Card
            </button>
            <button
              type="button"
              onClick={() => switchMethod('paypal')}
              className={
                'rounded-full px-4 py-2 text-sm font-bold transition ' +
                (method === 'paypal'
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }
            >
              PayPal
            </button>
            <button
              type="button"
              onClick={() => switchMethod('venmo')}
              className={
                'rounded-full px-4 py-2 text-sm font-bold transition ' +
                (method === 'venmo'
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }
            >
              Venmo
            </button>
            <button
              type="button"
              onClick={() => switchMethod('zelle')}
              className={
                'rounded-full px-4 py-2 text-sm font-bold transition ' +
                (method === 'zelle'
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }
            >
              Zelle
            </button>
            <button
              type="button"
              onClick={() => switchMethod('cashapp')}
              className={
                'rounded-full px-4 py-2 text-sm font-bold transition ' +
                (method === 'cashapp'
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
              }
            >
              Cash App
            </button>
          </div>
        </div>
      )}

      {!confirmed && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {method === 'card' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Credit or debit card
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                We have emailed a secure payment link to:
              </p>
              <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3 text-base font-semibold text-green-900 flex items-center gap-2">
                <Mail size={20} />
                <span className="break-all">{email || 'your email'}</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Check your inbox. Click the secure link, enter your card
                details, and payment is processed.
              </p>
              <button
                type="button"
                onClick={resendCardEmail}
                className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-primary-500 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
              >
                <Mail size={16} /> Resend the link
              </button>
            </div>
          )}

          {method === 'paypal' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">PayPal</h2>
              <p className="mt-3 text-sm text-gray-700">
                Click below to open PayPal in a new tab with the amount and
                order reference pre-filled.
              </p>
              <a
                href={paypalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 px-6 py-3 text-base font-bold text-white shadow w-full"
              >
                Open PayPal <ExternalLink size={16} />
              </a>
              <p className="mt-3 text-xs text-gray-500">
                Send ${amount} to @
                {HANDLES.paypalMe.split('me/')[1] || 'trendycheff'} with note{' '}
                {handleOrderRef}
              </p>
            </div>
          )}

          {method === 'venmo' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Venmo</h2>
              <p className="mt-3 text-sm text-gray-700">
                Tap below to open the Venmo app with the amount pre-filled.
              </p>
              <a
                href={venmoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-3 text-base font-bold text-white shadow w-full"
              >
                Open Venmo <ExternalLink size={16} />
              </a>
              <p className="mt-3 text-xs text-gray-500">
                Send ${amount} to @{HANDLES.venmoUsername} with note{' '}
                {handleOrderRef}
              </p>
            </div>
          )}

          {method === 'zelle' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Zelle</h2>
              <p className="mt-3 text-sm text-gray-700">
                Open your bank app and send via Zelle to:
              </p>
              <button
                type="button"
                onClick={() => copyText(HANDLES.zelleEmail)}
                className="mt-3 w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-purple-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {HANDLES.zelleEmail}
                    </div>
                    <div className="text-xs text-gray-500">Click to copy</div>
                  </div>
                </div>
                {copied ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => copyText(CONTACT.phone)}
                className="mt-2 w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-purple-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {CONTACT.phone}
                    </div>
                    <div className="text-xs text-gray-500">Click to copy</div>
                  </div>
                </div>
                {copied ? (
                  <span className="text-xs text-green-600">Copied!</span>
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </button>
              <p className="mt-3 text-xs text-gray-500">
                Send ${amount} with memo {handleOrderRef}
              </p>
            </div>
          )}

          {method === 'cashapp' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cash App</h2>
              <p className="mt-3 text-sm text-gray-700">
                Tap below to open Cash App with the amount pre-filled.
              </p>
              <a
                href={cashappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 px-6 py-3 text-base font-bold text-white shadow w-full"
              >
                Open Cash App <ExternalLink size={16} />
              </a>
              <p className="mt-3 text-xs text-gray-500">
                Send ${amount} to ${HANDLES.cashappCashtag} with note{' '}
                {handleOrderRef}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={confirmPayment}
            disabled={confirming}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-6 py-3.5 text-base font-bold text-white shadow-lg disabled:opacity-50"
          >
            {confirming ? 'Confirming...' : '✓ I have paid - confirm my order'}
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            After you complete payment, tap this to lock in your order.
          </p>
        </div>
      )}

      {confirmed && (
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Your order #{id.slice(0, 8)} is confirmed.
          </p>
          <p className="text-xs text-gray-500">
            We will reach out within 24 hours.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link to="/menu" className="btn-outline">
              Back to menu
            </Link>
            <a
              href={'tel:' + CONTACT.phoneRaw}
              className="btn-primary gap-2 inline-flex"
            >
              <Phone size={16} /> Call us
            </a>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-600">
        Questions?{' '}
        <a
          href={'tel:' + CONTACT.phoneRaw}
          className="font-semibold text-primary-600 hover:underline"
        >
          {CONTACT.phone}
        </a>
      </div>
    </section>
  );
}
