let payments = null;
let card = null;

async function initSquare() {
  if (payments) return payments;
  const Sq = window.Square;
  if (!Sq)
    throw new Error(
      'Square SDK not loaded — check the <script> tag in index.html'
    );
  const appId = import.meta.env.VITE_SQUARE_APP_ID;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
  if (!appId || !locationId)
    throw new Error(
      'Missing VITE_SQUARE_APP_ID or VITE_SQUARE_LOCATION_ID in .env'
    );
  payments = await Sq.payments(appId, locationId);
  return payments;
}

// Attach the Square card form to #square-card-container once.
// Safe to call repeatedly — guarded by dataset flag.
export async function attachCardIfReady() {
  if (typeof window === 'undefined' || !window.Square) return;
  const container = document.getElementById('square-card-container');
  if (!container) return;
  if (container.dataset.attached === 'true') return;

  try {
    if (!card) {
      const p = await initSquare();
      card = await p.card();
    }
    await card.attach('#square-card-container');
    container.dataset.attached = 'true';
  } catch (e) {
    console.warn('Square card auto-attach failed:', e?.message || e);
  }
}

export async function tokenizeCard() {
  const container = document.getElementById('square-card-container');
  if (!container) throw new Error('Card container not in the DOM');

  // Attach if not already attached — uses cached `card`, does NOT call
  // card.attach() a second time. This is what was breaking tokenization.
  if (container.dataset.attached !== 'true') {
    await attachCardIfReady();
  }
  if (!card) throw new Error('Square card not initialized');
  if (container.dataset.attached !== 'true') {
    throw new Error('Square card failed to attach — see console');
  }

  const result = await card.tokenize();
  if (result.status !== 'OK') {
    throw new Error(
      result.errors?.[0]?.message || 'Card tokenization failed'
    );
  }
  return result.token;
}

export async function chargeCard({ sourceId, amountCents, orderId, email }) {
  const r = await fetch('/api/create-square-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceId,
      amountCents,
      orderId,
      customerEmail: email,
    }),
  });
  const data = await r.json();
  if (!r.ok || !data.ok) throw new Error(data.error || 'Payment failed');
  return data;
}
