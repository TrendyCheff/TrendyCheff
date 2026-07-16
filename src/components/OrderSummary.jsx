import { useCart } from '../context/CartContext.jsx';
export default function OrderSummary({ deliveryFee = 0, tipAmount = 0 }) {
  const { items, subtotal } = useCart();
  const grand = subtotal + (deliveryFee || 0) + (tipAmount || 0);
  return (
    <div className="card sticky top-24">
      <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
      <div className="mt-4 divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items added yet.</p>
        ) : (
          items.map((i) => (
            <div
              key={i.key}
              className="flex items-start justify-between gap-3 py-2 text-sm"
            >
              <div>
                <div className="font-semibold text-gray-900">
                  {i.quantity}× {i.name}
                </div>
                <div className="text-xs text-gray-500">{i.sizeLabel}</div>
              </div>
              <div className="font-semibold text-gray-900">
                ${(i.unitPrice * i.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd>${subtotal.toFixed(2)}</dd>
        </div>
        {!!deliveryFee && (
          <div className="flex justify-between">
            <dt className="text-gray-600">Delivery</dt>
            <dd>${deliveryFee.toFixed(2)}</dd>
          </div>
        )}
        {!!tipAmount && (
          <div className="flex justify-between">
            <dt className="text-gray-600">Tip</dt>
            <dd>${tipAmount.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
          <dt>Total</dt>
          <dd>${grand.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
