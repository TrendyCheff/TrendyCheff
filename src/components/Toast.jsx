import { useCart } from '../context/CartContext.jsx';
export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg">
      {toast.msg}
    </div>
  );
}
