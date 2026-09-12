// ============================================================
// saved.js — shortlist persistence (mirrors context/saved.tsx)
// Uses localStorage so the shortlist survives across pages/visits.
// Exposes a global `Saved` object used by nav.js, property-card.js,
// properties detail pages, and saved.html.
// ============================================================

const Saved = (() => {
  const STORAGE_KEY = "psf.shortlist";

  function read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function write(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    document.dispatchEvent(new CustomEvent("psf:saved-changed", { detail: list }));
  }

  return {
    list: () => read(),
    isSaved: (id) => read().includes(id),
    toggle(id) {
      const current = read();
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      write(next);
      return next;
    },
    clear() {
      write([]);
    },
  };
})();
