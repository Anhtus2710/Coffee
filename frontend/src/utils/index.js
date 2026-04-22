/* ────────────────────────────────────────────────────────
   Coffee Manager — Shared Utilities
   Single source of truth for formatters, constants, helpers
──────────────────────────────────────────────────────── */

// ── Currency ────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';

export const fmtNum = (n) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n));

// ── Date / Time ─────────────────────────────────────────
export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('vi-VN');

export const fmtDateTime = (d) =>
  `${fmtDate(d)} ${fmtTime(d)}`;

// ── Zones ───────────────────────────────────────────────
export const ZONES = {
  indoor: {
    label: 'Trong nhà',
    bg: 'rgba(99,102,241,0.10)',
    text: '#6366F1',
    border: 'rgba(99,102,241,0.18)',
  },
  outdoor: {
    label: 'Ngoài trời',
    bg: 'rgba(74,222,128,0.10)',
    text: '#16A34A',
    border: 'rgba(74,222,128,0.18)',
  },
  vip: {
    label: 'VIP',
    bg: 'rgba(251,146,60,0.10)',
    text: '#EA580C',
    border: 'rgba(251,146,60,0.18)',
  },
  bar: {
    label: 'Quầy bar',
    bg: 'rgba(96,165,250,0.10)',
    text: '#2563EB',
    border: 'rgba(96,165,250,0.18)',
  },
};

// ── Product Image URL ────────────────────────────────────
// Accepts either a product object {image} or a raw image string
export const getProductImageUrl = (productOrString) => {
  const base =
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3017';
  const img =
    typeof productOrString === 'string'
      ? productOrString
      : productOrString?.image || '';
  if (!img) return `${base}/images/products/default.png`;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/images/')) return base + img;
  if (img.match(/^[a-f0-9]{24}\.(png|jpg|jpeg)$/))
    return `${base}/images/products/${img}`;
  return `${base}/images/products/${img}`;
};
