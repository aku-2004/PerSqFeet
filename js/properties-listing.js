// ============================================================
// properties-listing.js — runs on properties/index.html only.
// Working free-text search, destination filter, always-visible
// refinement panel, sorting. Mirrors routes/properties.index.tsx
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("[data-listing-grid]");
  if (!grid) return; // not on this page

  const PRICE_BANDS = [
    { label: "Any", min: 0, max: 99 },
    { label: "₹2–3 Cr", min: 2, max: 3 },
    { label: "₹3–5 Cr", min: 3, max: 5 },
    { label: "₹5–10 Cr", min: 5, max: 10 },
    { label: "₹10 Cr+", min: 10, max: 99 },
  ];

  // One-line explanation shown on hover for each lifestyle filter chip.
  const LIFESTYLE_FACET_HELP = {
    Privacy: "Secluded settings, away from crowds or shared sightlines.",
    Wellness: "Built around yoga, spa, or restorative daily rituals.",
    Family: "Scaled and laid out for multi-generational family use.",
    Nature: "Close to forest, river, or other genuine wilderness.",
    Views: "Chosen for a panoramic or elevated outlook.",
    Community: "Part of a gated group of residences with shared spaces.",
    Hospitality: "Comes with hospitality-style managed service.",
    "Rental potential": "Strong track record or outlook for short-term rental income.",
    Accessibility: "Easy, shorter drive from a major city or airport.",
    "Weekend escape": "Suited to short, frequent visits rather than long stays.",
  };

  const STOPWORDS = new Set(["under", "with", "that", "from", "near", "the", "for", "and", "a", "an", "in", "of", "to"]);

  const params = new URLSearchParams(window.location.search);
  let collection = ["mountains", "forest", "wellness", "countryside"].includes(params.get("collection"))
    ? params.get("collection")
    : null;

  const state = {
    query: params.get("q") ?? "",
    location: "Any",
    band: 0,
    type: "Any",
    bedrooms: 0,
    lifestyle: [],
    status: "Any",
    verifiedOnly: false,
    sort: "Curated",
  };

  const searchInput = document.querySelector("[data-listing-search]");
  const locationSelect = document.querySelector("[data-listing-location]");
  const typeSelect = document.querySelector("[data-listing-type]");
  const bandSelect = document.querySelector("[data-listing-band]");
  const bedroomsSelect = document.querySelector("[data-listing-bedrooms]");
  const statusSelect = document.querySelector("[data-listing-status]");
  const verifiedOnlyCheckbox = document.querySelector("[data-listing-verified-only]");
  const lifestyleFacetsWrap = document.querySelector("[data-listing-lifestyle-facets]");
  const sortButtons = document.querySelectorAll("[data-listing-sort]");
  const countEl = document.querySelector("[data-listing-count]");
  const noResultsEl = document.querySelector("[data-listing-no-results]");
  const eyebrowEl = document.querySelector("[data-listing-eyebrow]");
  const clearCollectionBtn = document.querySelector("[data-listing-clear-collection]");

  searchInput.value = state.query;

  // Populate destinations
  DESTINATIONS.forEach((d) => locationSelect.appendChild(new Option(d.name, d.name)));
  // Populate property types
  [...new Set(PROPERTIES.map((p) => p.type))].forEach((t) => typeSelect.appendChild(new Option(t, t)));
  // Populate lifestyle facets, each with a hover explanation
  LIFESTYLE_FACETS.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = tag;
    if (LIFESTYLE_FACET_HELP[tag]) btn.title = LIFESTYLE_FACET_HELP[tag];
    btn.addEventListener("click", () => {
      const on = state.lifestyle.includes(tag);
      state.lifestyle = on ? state.lifestyle.filter((t) => t !== tag) : [...state.lifestyle, tag];
      btn.classList.toggle("is-active", !on);
      applyAndRender();
    });
    lifestyleFacetsWrap.appendChild(btn);
  });

  function updateCollectionUI() {
    eyebrowEl.textContent = collection ? COLLECTION_LABELS[collection] : "The collection";
    clearCollectionBtn.classList.toggle("hidden", !collection);
  }
  clearCollectionBtn.addEventListener("click", () => {
    collection = null;
    updateCollectionUI();
    applyAndRender();
  });
  updateCollectionUI();

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    applyAndRender();
  });
  locationSelect.addEventListener("change", () => {
    state.location = locationSelect.value || "Any";
    applyAndRender();
  });
  typeSelect.addEventListener("change", () => {
    state.type = typeSelect.value;
    applyAndRender();
  });
  bandSelect.addEventListener("change", () => {
    state.band = Number(bandSelect.value);
    applyAndRender();
  });
  bedroomsSelect.addEventListener("change", () => {
    state.bedrooms = Number(bedroomsSelect.value);
    applyAndRender();
  });
  statusSelect.addEventListener("change", () => {
    state.status = statusSelect.value;
    applyAndRender();
  });
  verifiedOnlyCheckbox.addEventListener("change", () => {
    state.verifiedOnly = verifiedOnlyCheckbox.checked;
    applyAndRender();
  });
  sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = btn.getAttribute("data-listing-sort");
      sortButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      applyAndRender();
    });
  });

  // Builds one big lowercase, searchable blob of text per property so the
  // free-text box can match against far more than just the name/location.
  function searchHaystack(property) {
    return [
      property.name,
      property.location,
      property.region,
      property.type,
      property.developer,
      property.status,
      property.lifestyle.join(" "),
      property.amenities.join(" "),
      COLLECTION_LABELS[property.collection],
      property.priceLabel,
      property.story?.idea ?? "",
      property.story?.setting ?? "",
    ].join(" ").toLowerCase();
  }

  function computeResults() {
    const rawWords = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    const budgetMatch = state.query.match(/(\d+(?:\.\d+)?)\s*cr/i);
    // Drop stopwords and the number+"cr" token itself (handled separately as a price cap).
    const words = rawWords.filter((w) => !STOPWORDS.has(w) && !/^\d+(\.\d+)?$/.test(w) && w !== "cr");

    let list = PROPERTIES.filter((property) => {
      if (collection && property.collection !== collection) return false;
      if (state.location !== "Any" && property.location !== state.location) return false;
      if (state.type !== "Any" && property.type !== state.type) return false;
      if (state.bedrooms && property.bedrooms < state.bedrooms) return false;
      if (state.status !== "Any" && property.status !== state.status) return false;
      if (state.verifiedOnly && !property.verified) return false;
      const priceBand = PRICE_BANDS[state.band] ?? PRICE_BANDS[0];
      if (property.priceCr < priceBand.min || property.priceCr > priceBand.max) return false;
      if (state.lifestyle.length && !state.lifestyle.every((tag) => property.lifestyle.includes(tag))) return false;

      if (budgetMatch && property.priceCr > Number(budgetMatch[1])) return false;
      if (words.length) {
        const haystack = searchHaystack(property);
        if (!words.some((w) => haystack.includes(w))) return false;
      }
      return true;
    });

    list = [...list];
    if (state.sort === "Price") list.sort((a, b) => a.priceCr - b.priceCr);
    if (state.sort === "New") list.sort((a, b) => Number(b.status === "Under Construction") - Number(a.status === "Under Construction"));
    if (state.sort === "Most viewed") list.sort((a, b) => b.investment.lifestyleScore - a.investment.lifestyleScore);
    if (state.sort === "Best match") list.sort((a, b) => b.investment.investmentScore - a.investment.investmentScore);
    if (state.sort === "Curated") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }

  function applyAndRender() {
    const results = computeResults();
    countEl.textContent = `${results.length} ${results.length === 1 ? "residence" : "residences"}`;
    noResultsEl.classList.toggle("hidden", results.length !== 0);
    grid.innerHTML = results.map((p) => propertyCardHTML(p, { linkPrefix: "" })).join("");
    wireSaveButtons(grid);
  }

  document.addEventListener("psf:saved-changed", () => wireSaveButtons(grid));

  applyAndRender();
});
