import { Client, Environment } from 'square';

const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID } = process.env;

const client = new Client({
  accessToken: SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // change to Production when live
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { sourceId, amountCents, orderId, customerEmail } = req.body;

    const { result } = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: orderId, // prevents duplicate charges
      amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
      locationId: SQUARE_LOCATION_ID,
      note: `Order ${orderId}`,
      buyerEmailAddress: customerEmail,
    });

    res.json({
      ok: true,
      payment: result.payment,
      status: result.payment.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
