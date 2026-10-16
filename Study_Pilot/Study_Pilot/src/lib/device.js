// Automātiski nosaka, vai ierīce ir mobilā vai dators (UA + skārienjutīgums + platums)
export function detectDevice() {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const w = window.innerWidth;
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)); // iPadOS
  return (mobileUA && w < 1100) || w < 768 ? 'mobile' : 'desktop';
}

export function applyDevice() {
  const d = detectDevice();
  document.documentElement.dataset.device = d;
  return d;
}
