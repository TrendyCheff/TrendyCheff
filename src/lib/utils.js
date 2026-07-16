export const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

export const recommendTraySize = (guests) => {
  if (guests <= 6) return { size: 'small', label: 'Small tray (4–6 guests)' };
  if (guests <= 12)
    return { size: 'medium', label: 'Medium tray (10–12 guests)' };
  return { size: 'large', label: 'Large tray (18–20 guests)' };
};
