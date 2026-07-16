import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Bell,
  Lock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { CONTACT } from '../lib/constants.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
];

const STATUS_META = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
  preparing: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    label: 'Preparing',
  },
  ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ready' },
  completed: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-block rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </span>
  );
}

function AdminOrderCard({ order, expanded, onToggle, onUpdate }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const orderDate =
    order.requested_date || order.created_at?.slice(0, 10) || '';
  const orderTime =
    order.requested_time || order.created_at?.slice(11, 16) || '';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900">
              {order.customer_name || 'Customer'}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {orderDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {orderTime}
            </span>
            {order.customer_phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} /> {order.customer_phone}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Mail size={12} /> {order.customer_email || '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">
            ${Number(order.total_amount || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="mt-2 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {items.length} item{items.length !== 1 ? 's' : ''}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {items.length > 0 && (
            <ul className="rounded-lg bg-gray-50 p-3 text-sm divide-y divide-gray-200">
              {items.map((i, idx) => (
                <li key={idx} className="flex justify-between py-1.5">
                  <span className="font-medium">
                    {i.quantity}× {i.name}{' '}
                    <span className="text-gray-500">({i.sizeLabel})</span>
                  </span>
                  <span className="font-semibold">
                    ${(i.unitPrice * i.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <b>Type:</b>{' '}
              <span className="capitalize">{order.order_type || '—'}</span>
            </p>
            <p>
              <b>Pay:</b>{' '}
              <span className="capitalize">{order.payment_method || '—'}</span>
            </p>
            {order.tip_amount > 0 && (
              <p>
                <b>Tip:</b> ${Number(order.tip_amount).toFixed(2)}
              </p>
            )}
            {order.delivery_address && (
              <p className="flex items-start gap-1">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>{order.delivery_address}</span>
              </p>
            )}
            {order.notes && (
              <p className="bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                <b>Notes:</b> {order.notes}
              </p>
            )}
          </div>

          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <div className="flex flex-wrap gap-2 pt-2">
              {['confirmed', 'preparing', 'ready', 'completed']
                .filter((s) => s !== order.status)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate(order.id, s)}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition capitalize"
                  >
                    → {STATUS_META[s].label}
                  </button>
                ))}
              <button
                onClick={() => onUpdate(order.id, 'cancelled')}
                className="rounded-lg px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('tc_admin') === '1'
  );
  const [pwd, setPwd] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [tab, setTab] = useState('active');
  const expectedPass = (
    import.meta.env.VITE_ADMIN_PASS || 'trendychef'
  ).toString();

  useEffect(() => {
    if (user && user.email === CONTACT.email) {
      setUnlocked(true);
      sessionStorage.setItem('tc_admin', '1');
    }
  }, [user]);

  const load = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!unlocked) return;
    load();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('orders-live-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked]);

  const updateStatus = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (isSupabaseConfigured) {
      await supabase.from('orders').update({ status }).eq('id', id);
    }
  };

  if (!unlocked) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <Lock className="mx-auto text-primary-500" size={28} />
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Admin login</h1>
        <p className="mt-1 text-sm text-gray-500">Enter the admin password.</p>
        <input
          type="password"
          className="input mt-6"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button
          onClick={() => {
            if (pwd === expectedPass) {
              setUnlocked(true);
              sessionStorage.setItem('tc_admin', '1');
            }
          }}
          className="btn-primary mt-4 w-full"
        >
          Unlock
        </button>
      </section>
    );
  }

  const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
  const visibleOrders =
    tab === 'active'
      ? orders.filter((o) => activeStatuses.includes(o.status))
      : orders;
  const activeCount = orders.filter((o) =>
    activeStatuses.includes(o.status)
  ).length;
  const newCount = orders.filter((o) => o.status === 'pending').length;
  const totalCount = orders.length;

  const grouped = STATUSES.map((status) => ({
    status,
    list: visibleOrders.filter((o) => o.status === status),
  }));

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Package className="text-white/90" size={32} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold">
                Live Orders
              </h1>
              <p className="text-sm text-white/80">
                Real-time order management
              </p>
            </div>
            {newCount > 0 && (
              <span className="ml-2 rounded-full bg-white text-primary-600 px-3 py-1 text-xs font-bold animate-pulse-slow">
                {newCount} new
              </span>
            )}
          </div>
          {user ? (
            <div className="text-xs text-white/80 text-right">
              Signed in as <b className="text-white">{user.email}</b>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab('active')}
            className={
              'rounded-full px-4 py-2 text-sm font-bold transition ' +
              (tab === 'active'
                ? 'bg-primary-500 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100')
            }
          >
            Active Orders ({activeCount})
          </button>
          <button
            onClick={() => setTab('all')}
            className={
              'rounded-full px-4 py-2 text-sm font-bold transition ' +
              (tab === 'all'
                ? 'bg-primary-500 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100')
            }
          >
            All Orders ({totalCount})
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-900">
            ⚠ Add Supabase env vars to{' '}
            <code className="bg-yellow-100 px-1 rounded">.env</code> to see live
            orders.
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-center text-gray-500">
            Loading live orders...
          </p>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.status}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-2">
                  <StatusBadge status={group.status} />
                  <span>({group.list.length})</span>
                </h3>
                {group.list.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
                    No {group.status} orders.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {group.list.map((o) => (
                      <AdminOrderCard
                        key={o.id}
                        order={o}
                        expanded={!!expanded[o.id]}
                        onToggle={() =>
                          setExpanded({ ...expanded, [o.id]: !expanded[o.id] })
                        }
                        onUpdate={updateStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
