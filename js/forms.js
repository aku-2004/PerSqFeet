// ============================================================
// forms.js — generic "fake submit" behaviour for demo forms.
// Any <form data-fake-form> will, on submit, hide itself and show
// the sibling element matching [data-fake-form-success].
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-fake-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const successId = form.getAttribute("data-fake-form");
      const success = document.querySelector(`[data-fake-form-success="${successId}"]`);
      form.classList.add("hidden");
      if (success) success.classList.remove("hidden");
    });
  });
});
