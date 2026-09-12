// ============================================================
// nav.js — runs on every page.
// Handles: mobile menu toggle, header scroll style, active link,
// and keeping the "Saved (n)" count in the nav up to date.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-mobile-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  // Mobile menu open/close
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.textContent = isOpen ? "Close" : "Menu";
    });
  }

  // Header style: solid once scrolled, or always solid on non-hero pages
  if (header) {
    const overHero = header.getAttribute("data-over-hero") === "true";
    const onScroll = () => {
      const scrolled = window.scrollY > 24;
      header.classList.toggle("is-scrolled", scrolled);
      header.classList.toggle("is-light", overHero && !scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Active link highlighting
  const currentPage = document.body.getAttribute("data-page");
  if (currentPage) {
    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      if (link.getAttribute("data-nav-link") === currentPage) {
        link.classList.add("is-active");
      }
    });
  }

  // Saved count in nav
  function refreshSavedCount() {
    const count = typeof Saved !== "undefined" ? Saved.list().length : 0;
    document.querySelectorAll("[data-saved-count]").forEach((el) => {
      el.textContent = count > 0 ? ` (${count})` : "";
    });
  }
  refreshSavedCount();
  document.addEventListener("psf:saved-changed", refreshSavedCount);

  // Wire up any server-rendered property-card Save buttons on this page
  // (property-card.js defines wireSaveButtons; dynamically-rendered lists
  // re-call it themselves after re-rendering).
  if (typeof wireSaveButtons === "function") {
    wireSaveButtons(document);
  }
});
