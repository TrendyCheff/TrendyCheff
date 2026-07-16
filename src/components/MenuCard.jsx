import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

const FALLBACK =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800';
const SERVES = {
  small: 'Serves 4\u20136 guests',
  medium: 'Serves 10\u201312 guests',
  large: 'Serves 18\u201320 guests',
};

export default function MenuCard({ item, showAdd = true }) {
  const { addItem, addPieces } = useCart();
  const isPiece = item.price_per_piece != null;
  const [size, setSize] = useState(isPiece ? 'piece' : 'medium');
  const [pieces, setPieces] = useState(10);
  const cta = () => {
    if (isPiece) addPieces(item, pieces);
    else addItem(item, size, 1);
  };
  const priceText = () => {
    if (isPiece) return `$${Number(item.price_per_piece).toFixed(2)} / piece`;
    if (size === 'small') return `$${(item.price_medium * 0.65).toFixed(2)}`;
    if (size === 'large') return `$${Number(item.price_large).toFixed(2)}`;
    return `$${Number(item.price_medium).toFixed(2)}`;
  };
  return (
    <div className="card flex flex-col overflow-hidden p-0">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={item.image_url || FALLBACK}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {item.description || ''}
          </p>
        </div>
        {!isPiece && (
          <div className="flex flex-wrap gap-2">
            {['small', 'medium', 'large'].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
                  size === s
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {isPiece && showAdd && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-sm font-semibold text-gray-700">Pieces</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPieces((p) => Math.max(1, p - 1))}
                className="rounded p-1 text-gray-700 hover:bg-gray-200"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold">{pieces}</span>
              <button
                onClick={() => setPieces((p) => p + 1)}
                className="rounded p-1 text-gray-700 hover:bg-gray-200"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              {priceText()}
            </span>
            {showAdd ? (
              <button onClick={cta} className="btn-primary !px-4 !py-2 text-sm">
                <Plus size={16} className="mr-1" /> Add
              </button>
            ) : (
              <span className="text-xs italic text-gray-400">
                Available in catering
              </span>
            )}
          </div>
          {!isPiece && (
            <p className="mt-1 text-xs font-semibold text-gray-500">
              👥 {SERVES[size]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
