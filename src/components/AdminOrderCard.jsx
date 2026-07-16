import { useState } from 'react';
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase.js'';
const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};
export default function AdminOrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];
  const update = async (status) => {
    setBusy(true);
    await supabase.from('orders').update({ status }).eq('id', order.id);
    setBusy(false);
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                STATUS_BADGE[order.status]
              }`}
            >
              {order.status}
            </span>
            <span className="truncate font-semibold text-gray-900">
              {order.customer_name}
            </span>
          </div>
          <div className="mt-1 truncate text-xs text-gray-500">
            {items.length} item{items.length > 1 ? 's' : ''} ·{' '}
            {order.order_type} · ${Number(order.total_amount).toFixed(2)}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-gray-100 px-4 py-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone size={14} />
              <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail size={14} />
              <a href={`mailto:${order.customer_email}`}>
                {order.customer_email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={14} />
              {order.requested_date}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={14} />
              {order.requested_time}
            </div>
            {order.delivery_address && (
              <div className="sm:col-span-2 flex items-start gap-2 text-gray-700">
                <MapPin size={14} className="mt-0.5" />
                {order.delivery_address}
              </div>
            )}
          </div>
          <ul className="divide-y divide-gray-100 rounded-lg bg-gray-50 p-3">
            {items.map((i, idx) => (
              <li key={idx} className="flex justify-between py-1.5">
                <span>
                  {i.quantity}× {i.name}{' '}
                  <span className="text-gray-500">({i.sizeLabel})</span>
                </span>
                <span className="font-semibold">
                  ${(i.unitPrice * i.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-4">
            <div>
              Subtotal: <b>${Number(order.subtotal).toFixed(2)}</b>
            </div>
            <div>
              Delivery: <b>${Number(order.delivery_fee || 0).toFixed(2)}</b>
            </div>
            <div>
              Tip: <b>${Number(order.tip_amount || 0).toFixed(2)}</b>
            </div>
            <div>
              Total: <b>${Number(order.total_amount).toFixed(2)}</b>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                disabled={busy || order.status === s}
                onClick={() => update(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  order.status === s
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              disabled={busy || order.status === 'cancelled'}
              onClick={() => update('cancelled')}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
