// ============================================================
// ai-lifestyle.js — runs on ai-lifestyle.html only.
// Five-question quiz -> lifestyle profile -> scored shortlist.
// Mirrors routes/ai-lifestyle.tsx
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const quizView = document.getElementById("quiz-view");
  const resultsView = document.getElementById("results-view");
  if (!quizView) return; // not on this page

  const STEPS = [
    { key: "where", question: "Where?", options: ["Mountains", "Forest", "Countryside", "Near city", "Wellness"] },
    { key: "budget", question: "Budget?", options: ["₹2–3 Cr", "₹3–5 Cr", "₹5–10 Cr", "₹10 Cr+"] },
    { key: "who", question: "Who?", options: ["Couple", "Family", "Friends", "Multi-generational"] },
    { key: "why", question: "Why?", options: ["Weekend escape", "Wellness", "Retirement", "Legacy", "Lifestyle", "Investment"] },
    { key: "matters", question: "What matters?", options: ["Privacy", "Views", "Hospitality", "Community", "Rental potential", "Accessibility"] },
  ];

  const PROFILES = {
    Privacy: "The Private Escapist",
    Views: "The Ridge Romantic",
    Hospitality: "The Serviced Owner",
    Community: "The Gathered Host",
    "Rental potential": "The Considered Investor",
    Accessibility: "The Weekend Regular",
  };

  const COLLECTION_FOR = {
    Mountains: "mountains",
    Forest: "forest",
    Countryside: "countryside",
    Wellness: "wellness",
    "Near city": "countryside",
  };

  const BUDGET_CAPS = {
    "₹2–3 Cr": [0, 3.2],
    "₹3–5 Cr": [2.6, 5.4],
    "₹5–10 Cr": [4.4, 10],
    "₹10 Cr+": [8, 99],
  };

  let index = 0;
  const answers = {};

  const progressWrap = document.querySelector("[data-quiz-progress]");
  const stepCountEl = document.querySelector("[data-quiz-step-count]");
  const stepWrap = document.querySelector("[data-quiz-step]");
  const questionEl = document.querySelector("[data-quiz-question]");
  const optionsWrap = document.querySelector("[data-quiz-options]");
  const backBtn = document.querySelector("[data-quiz-back]");
  const finishBtn = document.querySelector("[data-quiz-finish]");
  const restartBtn = document.querySelector("[data-quiz-restart]");

  function renderProgress() {
    progressWrap.innerHTML = STEPS.map(
      (_, i) => `<span class="progress-seg${i <= index ? " is-done" : ""}"></span>`,
    ).join("");
    stepCountEl.textContent = `${String(index + 1).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}`;
  }

  function renderStep() {
    const step = STEPS[index];
    questionEl.textContent = step.question;
    optionsWrap.innerHTML = "";
    step.options.forEach((option) => {
      const selected = answers[step.key] === option;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option" + (selected ? " is-selected" : "");
      btn.innerHTML = `<span class="label">${option}</span><span class="mark" aria-hidden="true"></span>`;
      btn.addEventListener("click", () => {
        answers[step.key] = option;
        if (index < STEPS.length - 1) {
          window.setTimeout(() => {
            index += 1;
            renderProgress();
            renderStep();
          }, 260);
        } else {
          renderStep(); // re-render to show selection + finish button
        }
      });
      optionsWrap.appendChild(btn);
    });

    backBtn.classList.toggle("hidden", index === 0);
    finishBtn.classList.toggle("hidden", !(answers[step.key] && index === STEPS.length - 1));
    renderProgress();
  }

  backBtn.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      renderStep();
    }
  });
  finishBtn.addEventListener("click", showResults);
  restartBtn.addEventListener("click", () => {
    index = 0;
    resultsView.classList.add("hidden");
    quizView.classList.remove("hidden");
    renderStep();
  });

  function computeResults() {
    const wanted = COLLECTION_FOR[answers["where"] ?? ""];
    const [min, max] = BUDGET_CAPS[answers["budget"] ?? ""] ?? [0, 99];

    return PROPERTIES.map((property) => {
      let score = 58;
      const reasons = [];
      if (wanted && property.collection === wanted) {
        score += 16;
        reasons.push(`Sits in the ${(answers["where"] ?? "").toLowerCase()} you asked for`);
      }
      if (property.priceCr >= min && property.priceCr <= max) {
        score += 12;
        reasons.push("Within your stated budget band");
      }
      if (answers["matters"] && property.lifestyle.includes(answers["matters"])) {
        score += 10;
        reasons.push(`${answers["matters"]} is central to this residence`);
      }
      if (answers["why"] && property.lifestyle.includes(answers["why"])) {
        score += 6;
        reasons.push(`Suited to ${answers["why"].toLowerCase()}`);
      }
      if (answers["who"] === "Family" && property.bedrooms >= 4) {
        score += 5;
        reasons.push("Scaled for family use");
      }
      if (answers["who"] === "Couple" && property.bedrooms <= 3) {
        score += 4;
        reasons.push("Intimate scale for two");
      }
      if (property.verified) score += 3;
      if (!reasons.length) reasons.push("A strong all-round match within the collection");
      return { property, score: Math.min(97, score), reasons: reasons.slice(0, 3) };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function showResults() {
    const results = computeResults();
    const profile = PROFILES[answers["matters"] ?? ""] ?? "The Considered Owner";

    document.querySelector("[data-result-profile]").textContent = profile;
    document.querySelector("[data-result-score]").textContent = `${results[0]?.score ?? 90}% match`;

    const answersWrap = document.querySelector("[data-result-answers]");
    answersWrap.innerHTML = STEPS.map(
      (s) => `
        <div class="row">
          <dt class="eyebrow text-muted">${s.question.replace("?", "")}</dt>
          <dd>${answers[s.key] ?? "—"}</dd>
        </div>`,
    ).join("");

    const listWrap = document.querySelector("[data-result-list]");
    listWrap.innerHTML = results
      .map((result, i) => {
        const p = result.property;
        return `
          <li class="result-item">
            <a href="properties/${p.id}.html" class="img-zoom" style="display:block;overflow:hidden;">
              <img src="${img(p.images[0])}" alt="${p.name}" loading="lazy" style="aspect-ratio:4/3;width:100%;object-fit:cover;" />
            </a>
            <div>
              <div style="display:flex;align-items:baseline;justify-content:space-between;gap:1rem;">
                <p class="eyebrow text-muted">${String(i + 1).padStart(2, "0")} · ${p.location}</p>
                <p class="eyebrow text-gold">${result.score}% match</p>
              </div>
              <h3 class="display-md" style="margin-top:.75rem;">${p.name}</h3>
              <p style="margin-top:.75rem;font-size:.875rem;">${p.priceLabel}</p>
              <ul class="reasons">
                ${result.reasons.map((r) => `<li><span class="tick" aria-hidden="true"></span>${r}</li>`).join("")}
              </ul>
              <p class="eyebrow text-muted" style="margin-top:1.25rem;">${p.lifestyle.slice(0, 3).join(" · ")}</p>
              <a href="properties/${p.id}.html" class="eyebrow link-underline" style="margin-top:1.5rem;display:inline-block;">View residence →</a>
            </div>
          </li>`;
      })
      .join("");

    quizView.classList.add("hidden");
    resultsView.classList.remove("hidden");
  }

  renderStep();
});
