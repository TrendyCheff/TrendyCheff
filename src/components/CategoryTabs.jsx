import { CATEGORIES } from '../lib/constants.js';
export default function CategoryTabs({ active, onChange }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible">
      <div className="inline-flex gap-2 rounded-xl bg-gray-100 p-1 sm:flex sm:flex-wrap">
        <button
          onClick={() => onChange('all')}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
            active === 'all'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active === c.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
