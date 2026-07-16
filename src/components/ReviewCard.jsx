import { Star } from 'lucide-react';
export default function ReviewCard({ name, rating = 5, comment, dish }) {
  return (
    <div className="card h-full">
      <div className="flex items-center gap-1 text-primary-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < rating ? 'currentColor' : 'none'}
            stroke="currentColor"
          />
        ))}
      </div>
      <p className="mt-3 text-gray-700">"{comment}"</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">— {name}</span>
        {dish && <span className="text-gray-500">{dish}</span>}
      </div>
    </div>
  );
}
