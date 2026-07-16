import emailjs from '@emailjs/browser';
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const CHEF_TPL = import.meta.env.VITE_EMAILJS_CHEF_TEMPLATE_ID;
const CUSTOMER_TPL = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
export const isEmailConfigured = Boolean(
  SERVICE_ID && CHEF_TPL && CUSTOMER_TPL && PUBLIC_KEY
);
const formatItems = (items = []) =>
  items
    .map(
      (i) =>
        `• ${i.quantity}× ${i.name} (${i.sizeLabel}) — $${(
          i.unitPrice * i.quantity
        ).toFixed(2)}`
    )
    .join('\n');
export async function sendOrderEmails(order) {
  if (!isEmailConfigured) {
    console.warn('EmailJS not configured');
    return { chefSent: false, customerSent: false };
  }
  const baseParams = {
    order_id: order.id,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email,
    order_type: order.order_type,
    delivery_address: order.delivery_address || 'N/A (Pickup)',
    requested_date: order.requested_date,
    requested_time: order.requested_time,
    items_text: formatItems(order.items),
    subtotal: order.subtotal?.toFixed(2),
    delivery_fee: (order.delivery_fee || 0).toFixed(2),
    tip_amount: (order.tip_amount || 0).toFixed(2),
    total_amount: order.total_amount?.toFixed(2),
    payment_method: order.payment_method,
    notes: order.notes || '',
  };
  const chefParams = {
    ...baseParams,
    to_email: 'trendycheff@gmail.com',
    email_type: 'chef',
  };
  const custParams = {
    ...baseParams,
    to_email: order.customer_email,
    email_type: 'customer',
  };
  const [chefRes, custRes] = await Promise.allSettled([
    emailjs.send(SERVICE_ID, CHEF_TPL, chefParams, { publicKey: PUBLIC_KEY }),
    emailjs.send(SERVICE_ID, CUSTOMER_TPL, custParams, {
      publicKey: PUBLIC_KEY,
    }),
  ]);
  return {
    chefSent: chefRes.status === 'fulfilled',
    customerSent: custRes.status === 'fulfilled',
  };
}
