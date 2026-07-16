// Geocode customer's address via OpenStreetMap Nominatim (free, no API key needed)
// Then calculate miles from Maryland to that address.
// Returns fee = $1 per mile. Caller-side displays "Delivery: $X" only (no breakdown).

const CHEF_BASE = { lat: 39.5917, lng: -76.9893 }; // Maryland

const toRad = (d) => (d * Math.PI) / 180;

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocode(address) {
  // Append Maryland, USA for better US bias
  const q = encodeURIComponent(`${address}, Maryland, USA`);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`
  );
  const data = await res.json();
  if (!data || !data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// Debounce helper
let timer = null;
export function calcDeliveryFeeDebounced(address, callback) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    const fee = await calcDeliveryFee(address);
    callback(fee);
  }, 800);
}

export async function calcDeliveryFee(address) {
  if (!address || address.trim().length < 5) return 0;
  try {
    const coords = await geocode(address);
    if (!coords) return 25; // fallback if address can't be geocoded
    const miles = haversineMiles(
      CHEF_BASE.lat,
      CHEF_BASE.lng,
      coords.lat,
      coords.lng
    );
    return Math.max(1, Math.ceil(miles));
  } catch (err) {
    console.warn('Delivery calc failed:', err);
    return 25; // graceful fallback
  }
}
