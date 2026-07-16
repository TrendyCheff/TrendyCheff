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

export async function tokenizeCard() {
  if (!document.getElementById('square-card-container')) {
    throw new Error('Card container not in the DOM');
  }
  const p = await initSquare();
  const card = await p.card();
  await card.attach('#square-card-container');
  const result = await card.tokenize();
  if (result.status !== 'OK') {
    throw new Error(result.errors?.[0]?.message || 'Card tokenization failed');
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
