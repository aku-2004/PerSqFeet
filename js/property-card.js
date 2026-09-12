// ============================================================
// property-card.js — renders the repeating "property card" markup
// used on Home, Properties listing, Saved, Neighbourhood detail and
// AI Lifestyle results. Mirrors components/PropertyCard.tsx
//
// Usage: propertyCardHTML(property, { linkPrefix: "properties/" })
// linkPrefix should be "properties/" from the site root, or ""
// when already inside /properties/.
// ============================================================

function propertyCardHTML(property, opts = {}) {
  const linkPrefix = opts.linkPrefix ?? "properties/";
  const saved = typeof Saved !== "undefined" && Saved.isSaved(property.id);
  return `
    <article class="property-card" data-property-card="${property.id}">
      <a href="${linkPrefix}${property.id}.html" aria-label="${property.name}, ${property.location}">
        <div class="thumb">
          <img src="${img(property.images[0])}" alt="${property.name} in ${property.location}" loading="lazy" width="1280" height="960" />
          ${property.verified ? `<span class="badge-verified">Verified</span>` : ""}
        </div>
        <div class="body">
          <div class="row">
            <h3 class="display-md">${property.name}</h3>
            <span class="loc eyebrow">${property.location}</span>
          </div>
          <p class="meta">${property.type} · ${property.bedrooms} bedrooms · ${property.builtUpSqft.toLocaleString("en-IN")} sq ft</p>
          <div class="price-row">
            <span>${property.priceLabel}</span>
            <span class="rule" aria-hidden="true"></span>
            <span class="tags">${property.lifestyle.slice(0, 2).join(" · ")}</span>
          </div>
        </div>
      </a>
      <div class="actions">
        <a href="${linkPrefix}${property.id}.html" class="view-link eyebrow">View residence →</a>
        <button type="button" class="save-btn${saved ? " is-saved" : ""}" data-save-toggle="${property.id}" aria-pressed="${saved}">
          ${saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  `;
}

// Wire up every [data-save-toggle] button currently in the DOM.
// Call this again after re-rendering a list of cards.
function wireSaveButtons(root = document) {
  root.querySelectorAll("[data-save-toggle]").forEach((btn) => {
    // Sync to actual saved state first (server-rendered cards always
    // start as "Save" since localStorage isn't available server-side).
    const id = btn.getAttribute("data-save-toggle");
    const currentlySaved = Saved.isSaved(id);
    btn.textContent = currentlySaved ? "Saved" : "Save";
    btn.classList.toggle("is-saved", currentlySaved);
    btn.setAttribute("aria-pressed", String(currentlySaved));

    if (btn.dataset.wired === "true") return;
    btn.dataset.wired = "true";
    btn.addEventListener("click", () => {
      Saved.toggle(id);
      const nowSaved = Saved.isSaved(id);
      btn.textContent = nowSaved ? "Saved" : "Save";
      btn.classList.toggle("is-saved", nowSaved);
      btn.setAttribute("aria-pressed", String(nowSaved));
    });
  });
}
