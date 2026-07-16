let payments = null;

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

// Attach the Square card form to #square-card-container the moment
// the user picks "Pay with card". Safe to call multiple times —
// subsequent calls just no-op because we mark the container as attached.
let attachInProgress = false;

export async function attachCardIfReady() {
  if (typeof window === 'undefined' || !window.Square) return;
  if (attachInProgress) return;
  const container = document.getElementById('square-card-container');
  if (!container) return;
  if (container.dataset.attached === 'true') return;
  attachInProgress = true;
  try {
    const p = await initSquare();
    const card = await p.card();
    await card.attach('#square-card-container');
    container.dataset.attached = 'true';
  } catch (e) {
    console.warn('Square card auto-attach failed:', e?.message || e);
  } finally {
    attachInProgress = false;
  }
}

export async function tokenizeCard() {
  // If the iframe hasn't been attached yet (e.g. user picked Pay-with-card
  // and immediately clicked Place Order before the useEffect fired),
  // attach it now before tokenizing. Safe + idempotent.
  if (!document.getElementById('square-card-container')) {
    throw new Error('Card container not in the DOM');
  }
  if (
    document.getElementById('square-card-container').dataset.attached !==
    'true'
  ) {
    await attachCardIfReady();
  }
  const p = await initSquare();
  const card = await p.card();
  await card.attach('#square-card-container');
  const cardInput = document.querySelector('#square-card-container iframe');
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
