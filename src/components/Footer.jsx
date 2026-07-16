import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';
import { CONTACT } from '../lib/constants.js';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-2xl font-display font-bold">
            <span className="text-white">Trendy</span>
            <span className="text-primary-500">Chef</span>
          </div>
          <p className="mt-3 text-sm">
            Personal chef catering by {CONTACT.chef}. Made fresh, served with
            love.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Navigate
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-primary-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-primary-400">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/catering" className="hover:text-primary-400">
                Catering
              </Link>
            </li>
            <li>
              <Link to="/#about-chef" className="hover:text-primary-400">
                About the Chef
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:text-primary-400">
                Reviews
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} />
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="hover:text-primary-400"
              >
                {CONTACT.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} />
              <a
                href={`mailto:${CONTACT.email}`}
                className="hover:text-primary-400"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{CONTACT.location}</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Follow
          </h4>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-2 text-sm hover:text-primary-400"
          >
            <Instagram size={16} /> @trendychef
          </a>
        </div>
      </div>
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Trendy Chef. All rights reserved.
      </div>
    </footer>
  );
}
