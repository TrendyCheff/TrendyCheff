import { useEffect, useState } from 'react';
import { Star, Send } from 'lucide-react';
import ReviewCard from '../components/ReviewCard.jsx';
import { STATIC_REVIEWS } from '../data/staticReviews.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { useCart } from '../context/CartContext.jsx';
export default function Reviews() {
  const { showToast } = useCart();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    rating: 5,
    comment: '',
    dish: '',
  });
  const [sending, setSending] = useState(false);
  const load = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) return;
    setSending(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('reviews')
          .insert([{ ...form, is_approved: false }]);
        if (error) throw error;
        showToast('Thanks! Your review is awaiting approval.');
      } else {
        showToast('Thanks! Configure Supabase to persist reviews.');
      }
      setForm({ name: '', rating: 5, comment: '', dish: '' });
    } catch (err) {
      showToast(err.message || 'Could not submit.', 'error');
    } finally {
      setSending(false);
    }
  };
  const all = [...reviews, ...STATIC_REVIEWS];
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-900 sm:text-5xl">
          Reviews
        </h1>
        <p className="mt-3 text-gray-600">Real feedback from past clients.</p>
      </div>
      {loading ? (
        <p className="mt-10 text-center text-gray-500">Loading reviews…</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((r, i) => (
            <ReviewCard key={i} {...r} />
          ))}
        </div>
      )}
      <div className="mx-auto mt-16 max-w-2xl card">
        <h2 className="text-2xl font-display font-bold text-gray-900">
          Write a review
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          We read every review. Approved reviews appear on this page.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Your name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Dish you tried</label>
              <input
                className="input"
                value={form.dish}
                onChange={(e) => setForm({ ...form, dish: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className="p-1"
                >
                  <Star
                    size={26}
                    className={
                      n <= form.rating
                        ? 'fill-primary-500 text-primary-500'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Your review</label>
            <textarea
              className="input"
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          <button disabled={sending} className="btn-primary gap-2">
            <Send size={16} /> {sending ? 'Sending…' : 'Submit review'}
          </button>
        </form>
      </div>
    </section>
  );
}
