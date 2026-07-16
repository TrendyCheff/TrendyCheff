import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { SAMPLE_MENU, CATEGORIES } from '../lib/constants.js';
import MenuCard from '../components/MenuCard.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';

export default function Menu() {
  const [searchParams] = useSearchParams();
  const initial = searchParams.get('cat') || 'all';
  const [active, setActive] = useState(initial);
  const [items, setItems] = useState(SAMPLE_MENU);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let cancel = false;
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('sort_order', { ascending: true });
      if (!cancel) {
        if (!error && data?.length) setItems(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const visible =
    active === 'all' ? items : items.filter((i) => i.category === active);

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-gray-900 sm:text-5xl">
            Our Menu
          </h1>
          <p className="mt-3 text-gray-600">
            Browse the menu — same items appear in the catering order builder.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <CategoryTabs active={active} onChange={setActive} />
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          {CATEGORIES.find((c) => c.id === active)?.label || 'All categories'} ·{' '}
          {visible.length} items
        </div>

        {loading ? (
          <div className="mt-10 text-center text-gray-500">Loading menu…</div>
        ) : (
          <div className="mt-10 grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
