// ============================================================
// reveal.js — scroll-triggered fade/rise for elements with class
// "reveal" (mirrors components/Reveal.tsx). Add [data-delay] in ms
// for a staggered effect.
//
// Robustness note: IntersectionObserver can miss fast scroll jumps
// (flicks, Page Down, trackpad flings) in some browsers, which would
// otherwise leave content permanently invisible (opacity: 0). Two
// safeguards below prevent that: a generous rootMargin so elements
// are detected well before/after they're strictly in view, and a
// hard fallback timer that force-reveals anything still hidden a
// few seconds after load, no matter what.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  function showAllRemaining() {
    items.forEach((el) => el.classList.add("is-shown"));
  }

  if (typeof IntersectionObserver === "undefined") {
    showAllRemaining();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute("data-delay");
          if (delay) entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add("is-shown");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: "400px 0px 400px 0px" },
  );

  items.forEach((el) => observer.observe(el));

  // Safety net: never let content stay invisible. Whatever the
  // observer missed gets shown anyway after a short delay.
  window.setTimeout(showAllRemaining, 2500);
});
