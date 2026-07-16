import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SMALL_TRAY_MULTIPLIER } from '../lib/constants.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'trendy_chef_cart_v1';

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind, id: rid() });
    setTimeout(() => setToast(null), 2500);
  };

  const addItem = (menuItem, size, quantity = 1) => {
    let unitPrice = 0;
    let sizeLabel = '';
    let key = '';
    if (size === 'small') {
      unitPrice = Number(
        ((menuItem.price_medium ?? 0) * SMALL_TRAY_MULTIPLIER).toFixed(2)
      );
      sizeLabel = `Small Tray · ${menuItem.medium_label || 'serves 2-4'}`;
      key = `s-${menuItem.id}`;
    } else if (size === 'medium') {
      unitPrice = Number(menuItem.price_medium ?? 0);
      sizeLabel = menuItem.medium_label || 'Medium Tray';
      key = `m-${menuItem.id}`;
    } else if (size === 'large') {
      unitPrice = Number(menuItem.price_large ?? 0);
      sizeLabel = menuItem.large_label || 'Large Tray';
      key = `l-${menuItem.id}`;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          key,
          id: menuItem.id,
          name: menuItem.name,
          category: menuItem.category,
          image_url: menuItem.image_url,
          size,
          sizeLabel,
          quantity,
          unitPrice,
        },
      ];
    });
    showToast(`${menuItem.name} added to cart`);
  };

  const addPieces = (menuItem, pieces) => {
    const unitPrice = Number(menuItem.price_per_piece ?? 0);
    const sizeLabel = `Per piece · $${unitPrice.toFixed(2)}`;
    const key = `p-${menuItem.id}-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        key,
        id: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        image_url: menuItem.image_url,
        size: 'piece',
        sizeLabel,
        quantity: pieces,
        unitPrice,
      },
    ]);
    showToast(`${pieces}× ${menuItem.name} added`);
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) return removeItem(key);
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i))
    );
  };

  const removeItem = (key) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [items]
  );

  const value = {
    items,
    subtotal,
    addItem,
    addPieces,
    updateQty,
    removeItem,
    clearCart,
    toast,
    showToast,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
