// ============================================================
// entrance.js — first-visit cinematic arrival for Home only.
// wordmark -> bungalow approach -> door opens -> pass through -> home
// Runs once per session (sessionStorage), skippable, respects
// prefers-reduced-motion. Mirrors components/Entrance.tsx
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const entrance = document.querySelector("[data-entrance]");
  if (!entrance) return;

  const KEY = "psf.entered";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = true;
  try {
    seen = window.sessionStorage.getItem(KEY) === "1";
  } catch {
    seen = false;
  }

  if (reduced || seen) {
    entrance.remove();
    return;
  }

  document.body.style.overflow = "hidden";

  const exterior = entrance.querySelector("[data-entrance-exterior]");
  const door = entrance.querySelector("[data-entrance-door]");
  const doorGlow = entrance.querySelector("[data-entrance-door-glow]");
  const interior = entrance.querySelector("[data-entrance-interior]");
  const wordmark = entrance.querySelector("[data-entrance-wordmark]");
  const skipBtn = entrance.querySelector("[data-entrance-skip]");

  let phase = 0;
  const timers = [];

  function render() {
    const approach = phase >= 1;
    const doorOpen = phase >= 2;
    const through = phase >= 3;

    exterior.style.transform = `scale(${through ? 3.1 : approach ? 1.35 : 1.08})`;
    exterior.style.opacity = phase === 0 ? "0.35" : "1";
    exterior.style.filter = through ? "blur(6px)" : "none";

    door.style.transform = doorOpen ? "rotateY(-88deg)" : "rotateY(0deg)";
    doorGlow.style.opacity = doorOpen ? "1" : "0";

    interior.style.opacity = through ? "1" : "0";
    interior.style.transform = `scale(${through ? 1 : 1.22})`;

    wordmark.style.opacity = phase === 0 ? "1" : "0";

    entrance.style.opacity = phase >= 4 ? "0" : "1";
  }

  function finish() {
    timers.forEach(window.clearTimeout);
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    entrance.remove();
  }

  const marks = [1400, 3600, 5300, 6900, 7900];
  marks.forEach((ms, i) => {
    timers.push(
      window.setTimeout(() => {
        if (i === marks.length - 1) {
          finish();
        } else {
          phase = i + 1;
          render();
        }
      }, ms),
    );
  });

  skipBtn.addEventListener("click", finish);
  render();
});
