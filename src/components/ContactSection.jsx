import { Phone, MessageCircle, Mail } from 'lucide-react';
import { CONTACT } from '../lib/constants.js';
export default function ContactSection({ compact = false }) {
  return (
    <section
      className={`bg-primary-500 text-white ${compact ? 'py-10' : 'py-16'}`}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl">
          Ready to plan your event?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Tell us about your celebration and we'll craft a menu just for you.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`tel:${CONTACT.phoneRaw}`}
            className="btn-outline gap-2 flex"
          >
            <Phone size={18} /> {CONTACT.phone}
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsappRaw}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline gap-2 flex"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="btn-primary gap-2 flex"
          >
            <Mail size={18} /> {CONTACT.email}
          </a>
        </div>
      </div>
    </section>
  );
}
