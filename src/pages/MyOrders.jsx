import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmt } from '../lib/utils.js';

const STATUS_COLOR = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-gray-200 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <section className="py-20 text-center text-gray-500">Loading…</section>
    );
  }

  if (!user) {
    return (
      <section className="py-20 text-center">
        <h1 className="font-display text-3xl font-bold">
          Sign in to see your orders
        </h1>
        <p className="mt-3 text-gray-600">
          Your past catering orders appear here after you sign in.
        </p>
        <Link to="/signin" className="btn-primary mt-6 inline-block">
          Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <h1 className="font-display text-4xl font-bold text-gray-900">
          My Orders
        </h1>
        <p className="mt-2 text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''} for {user.email}
        </p>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-600">No orders yet.</p>
            <Link to="/menu" className="btn-primary mt-4 inline-block">
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Placed {new Date(o.created_at).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {o.requested_date} at {o.requested_time}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {o.order_type}
                      {o.delivery_address ? ` · ${o.delivery_address}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {o.status}
                    </span>
                    <p className="mt-1 text-lg font-bold text-primary-600">
                      {fmt(o.total_amount)}
                    </p>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-primary-600 font-semibold">
                    View items
                  </summary>
                  <ul className="mt-2 divide-y divide-gray-100">
                    {(o.items || []).map((i, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between py-1.5 text-sm"
                      >
                        <span>
                          {i.quantity}× {i.name}{' '}
                          <span className="text-gray-500">({i.sizeLabel})</span>
                        </span>
                        <span className="font-semibold">
                          {fmt(i.unitPrice * i.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
