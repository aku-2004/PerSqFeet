// ============================================================
// saved-page.js — runs on saved.html only.
// Reads the shortlist from Saved (localStorage) and renders the
// property cards + comparison table. Mirrors routes/saved.tsx
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const emptyEl = document.querySelector("[data-saved-empty]");
  const contentEl = document.querySelector("[data-saved-content]");
  const clearBtn = document.querySelector("[data-saved-clear]");
  if (!emptyEl) return; // not on this page

  const ROWS = [
    ["Location", (p) => `${p.location}, ${p.region}`],
    ["Price", (p) => p.priceLabel],
    ["Built-up", (p) => `${p.builtUpSqft.toLocaleString("en-IN")} sq ft`],
    ["Land", (p) => `${p.landSqft.toLocaleString("en-IN")} sq ft`],
    ["Property type", (p) => p.type],
    ["Lifestyle", (p) => p.lifestyle.slice(0, 3).join(" · ")],
    ["Amenities", (p) => p.amenities.slice(0, 3).join(" · ")],
    ["Verification", (p) => p.verifications.join(" · ")],
    ["Indicative rental (nightly)", (p) => formatInr(p.investment.rentalNightly)],
    ["Indicative appreciation", (p) => `${p.investment.appreciation}% p.a. assumption`],
  ];

  function render() {
    const ids = Saved.list();
    const list = PROPERTIES.filter((p) => ids.includes(p.id));

    if (!list.length) {
      emptyEl.classList.remove("hidden");
      contentEl.classList.add("hidden");
      clearBtn.classList.add("hidden");
      return;
    }

    emptyEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
    clearBtn.classList.remove("hidden");

    const cardsWrap = document.querySelector("[data-saved-cards]");
    cardsWrap.innerHTML = list.map((p) => propertyCardHTML(p, { linkPrefix: "properties/" })).join("");
    wireSaveButtons(cardsWrap);

    const head = document.querySelector("[data-saved-table-head]");
    head.innerHTML =
      `<th scope="col"><span class="eyebrow text-muted">Residence</span></th>` +
      list.map((p) => `<th scope="col"><a href="properties/${p.id}.html" class="link-underline" style="font-family:var(--font-display);font-size:1.5rem;font-weight:300;">${p.name}</a></th>`).join("");

    const body = document.querySelector("[data-saved-table-body]");
    body.innerHTML = ROWS.map(
      ([label, get]) =>
        `<tr><th scope="row"><span class="eyebrow text-muted">${label}</span></th>${list.map((p) => `<td>${get(p)}</td>`).join("")}</tr>`,
    ).join("");
  }

  clearBtn.addEventListener("click", () => {
    Saved.clear();
    render();
  });
  document.addEventListener("psf:saved-changed", render);

  render();
});
