// ============================================================
// verified-badge.js — click a [data-verified-badge] button to open
// a modal explaining that verification label (mirrors VerifiedBadge.tsx)
// ============================================================

const VERIFIED_EXPLANATIONS = {
  "Project Verified":
    "Our team has visited the project, confirmed it exists as presented and reviewed the developer's approvals on record.",
  "Documentation Reviewed":
    "Available project documentation has been read by our advisory team. This is a review, not a legal opinion — independent counsel is recommended.",
  "Developer Verified":
    "We have reviewed the developer's entity details and delivery history for previously completed projects.",
  "Curated by Per Square Feet":
    "The project met our internal criteria for siting, construction quality, ownership structure and long-term liveability.",
};

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector("[data-verified-modal]");
  if (!overlay) return;

  const labelEl = overlay.querySelector("[data-verified-modal-label]");
  const copyEl = overlay.querySelector("[data-verified-modal-copy]");
  const closeBtn = overlay.querySelector("[data-verified-modal-close]");

  function openModal(label) {
    labelEl.textContent = label;
    copyEl.textContent =
      VERIFIED_EXPLANATIONS[label] ?? "A review carried out by the Per Square Feet advisory team.";
    overlay.classList.add("is-open", "fade-in");
  }
  function closeModal() {
    overlay.classList.remove("is-open");
  }

  document.querySelectorAll("[data-verified-badge]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-verified-badge")));
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  closeBtn.addEventListener("click", closeModal);
});
