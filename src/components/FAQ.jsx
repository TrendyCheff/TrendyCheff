import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CONTACT } from '../lib/constants.js';
const FAQS = [
  {
    q: 'How far in advance should I book?',
    a: 'For full catering events we recommend 7-14 days. For smaller orders, 48 hours is usually enough. Contact us for last-minute availability.',
  },
  {
    q: 'Do you offer delivery?',
    a: 'Yes - we do deliver',
  },
  {
    q: 'Can the menu be customized for dietary restrictions?',
    a: 'Absolutely. We accommodate vegetarian, vegan, gluten-free, nut-free and most allergies. Just let us know when placing your order.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Cash on delivery/pickup, Venmo and Zelle. For large events we can invoice by email.',
  },
  {
    q: 'Are the spices/masalas made from scratch?',
    a: 'Yes - every gravy, marinade and masala is freshly ground and cooked the day of your event.',
  },
  {
    q: 'Do you handle weddings and large events?',
    a: `Yes - we have served 200+ guest weddings, corporate launches and home events. Email us at ${CONTACT.email} for a custom quote.`,
  },
];
export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-gray-200 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {FAQS.map((f, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span className="text-base font-semibold text-gray-900">{f.q}</span>
            <ChevronDown
              size={20}
              className={`shrink-0 text-primary-500 transition-transform ${
                open === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {open === i && <div className="px-6 pb-5 text-gray-600">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
