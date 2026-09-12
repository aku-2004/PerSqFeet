// ============================================================
// investment.js — runs on investment.html only.
// Three tabs, each with its own sliders + live outputs.
// Mirrors routes/investment.tsx
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll("[data-calc-tab]");
  if (!tabButtons.length) return; // not on this page

  const panels = {
    investment: document.querySelector('[data-calc-panel="investment"]'),
    yield: document.querySelector('[data-calc-panel="yield"]'),
    loan: document.querySelector('[data-calc-panel="loan"]'),
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-calc-tab");
      tabButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle("hidden", key !== tab));
    });
  });

  /* ---------- Investment calculator ---------- */
  const locations = [...new Set(PROPERTIES.map((p) => p.location))];
  const types = [...new Set(PROPERTIES.map((p) => p.type))];

  const invLocationSelect = document.querySelector("[data-inv-location]");
  const invTypeSelect = document.querySelector("[data-inv-type]");
  locations.forEach((l) => invLocationSelect.appendChild(new Option(l, l)));
  types.forEach((t) => invTypeSelect.appendChild(new Option(t, t)));

  const invPrice = document.querySelector("[data-inv-price]");
  const invHolding = document.querySelector("[data-inv-holding]");
  const invRental = document.querySelector("[data-inv-rental]");
  const invAppreciation = document.querySelector("[data-inv-appreciation]");

  function updateInvestment() {
    const priceCr = Number(invPrice.value);
    const location = invLocationSelect.value || locations[0];
    const type = invTypeSelect.value || types[0];
    const holding = Number(invHolding.value);
    const rentalDaysPct = Number(invRental.value);
    const appreciation = Number(invAppreciation.value);

    document.querySelector("[data-inv-price-display]").textContent = `₹${priceCr.toFixed(2)} Cr`;
    document.querySelector("[data-inv-holding-display]").textContent = `${holding} years`;
    document.querySelector("[data-inv-rental-display]").textContent = `${rentalDaysPct}% of the year · ~${Math.round(365 * (rentalDaysPct / 100))} nights`;
    document.querySelector("[data-inv-appreciation-display]").textContent = `${appreciation}% per annum`;
    document.querySelector("[data-inv-hold-label]").textContent = `Value at ${holding} years`;

    const price = priceCr * 10000000;
    const reference = PROPERTIES.find((p) => p.location === location) ?? PROPERTIES[0];
    const ownershipCost = price * 0.012 + 240000;
    const nightsRented = Math.round(365 * (rentalDaysPct / 100));
    const rentalIncome = reference.investment.rentalNightly * nightsRented * 0.72;
    const fiveYear = price * Math.pow(1 + appreciation / 100, 5);
    const holdValue = price * Math.pow(1 + appreciation / 100, holding);

    const grossYield = (rentalIncome / price) * 100;
    const netCarry = ((rentalIncome - ownershipCost) / price) * 100;
    const appreciationFactor = Math.min(Math.max(appreciation - 3, 0) / 9, 1);
    const carryFactor = Math.min(Math.max(netCarry + 1.2, 0) / 3.2, 1);
    const yieldFactor = Math.min(grossYield / 5, 1);
    const typeFactor = type.includes("Wellness") || type.includes("Villa") ? 1 : 0.7;
    const composite = appreciationFactor * 0.45 + carryFactor * 0.3 + yieldFactor * 0.17 + typeFactor * 0.08;
    const oasis = Math.round(Math.min(10, Math.max(1, 1 + composite * 9)) * 10) / 10;

    document.querySelector("[data-inv-purchase-value]").textContent = formatInr(price);
    document.querySelector("[data-inv-ownership-cost]").textContent = formatInr(ownershipCost);
    document.querySelector("[data-inv-nights]").textContent = `${nightsRented} nights (${rentalDaysPct}% of the year)`;
    document.querySelector("[data-inv-rental-income]").textContent = formatInr(rentalIncome);
    document.querySelector("[data-inv-gross-yield]").textContent = `${grossYield.toFixed(2)}% of purchase value`;
    document.querySelector("[data-inv-net-carry]").textContent = `${netCarry.toFixed(2)}% per annum`;
    document.querySelector("[data-inv-5yr]").textContent = formatInr(fiveYear);
    document.querySelector("[data-inv-hold-value]").textContent = formatInr(holdValue);

    document.querySelector("[data-inv-oasis]").textContent = oasis.toFixed(1);
    document.querySelector("[data-inv-oasis-bar]").style.width = `${oasis * 10}%`;
    const verdict =
      oasis >= 8 ? "Strongly viable — the assumptions support both carry and long-term value."
      : oasis >= 6 ? "Viable — reasonable balance between holding cost and expected value."
      : oasis >= 4 ? "Marginal — the numbers work only if you value the lifestyle highly."
      : "Weak on numbers alone — treat this as a lifestyle purchase, not an investment.";
    document.querySelector("[data-inv-verdict]").textContent = verdict;
  }

  [invPrice, invHolding, invRental, invAppreciation, invLocationSelect, invTypeSelect].forEach((el) =>
    el.addEventListener("input", updateInvestment),
  );
  updateInvestment();

  /* ---------- Yield calculator ---------- */
  const yldPrice = document.querySelector("[data-yld-price]");
  const yldNightly = document.querySelector("[data-yld-nightly]");
  const yldRental = document.querySelector("[data-yld-rental]");
  const yldCost = document.querySelector("[data-yld-cost]");

  function updateYield() {
    const priceCr = Number(yldPrice.value);
    const nightly = Number(yldNightly.value);
    const rentalDaysPct = Number(yldRental.value);
    const costPercent = Number(yldCost.value);

    document.querySelector("[data-yld-price-display]").textContent = `₹${priceCr.toFixed(2)} Cr`;
    document.querySelector("[data-yld-nightly-display]").textContent = formatInr(nightly);
    document.querySelector("[data-yld-rental-display]").textContent = `${rentalDaysPct}% of the year · ~${Math.round(365 * (rentalDaysPct / 100))} nights`;
    document.querySelector("[data-yld-cost-display]").textContent = `${costPercent.toFixed(1)}% of value`;

    const price = priceCr * 10000000;
    const nights = Math.round(365 * (rentalDaysPct / 100));
    const gross = nightly * nights;
    const net = gross * 0.72 - price * (costPercent / 100);
    const grossYield = (gross / price) * 100;
    const netYield = (net / price) * 100;

    document.querySelector("[data-yld-net-yield]").textContent = `${netYield.toFixed(2)}%`;
    document.querySelector("[data-yld-nights]").textContent = `${nights} nights`;
    document.querySelector("[data-yld-gross]").textContent = formatInr(gross);
    document.querySelector("[data-yld-net]").textContent = formatInr(net);
    document.querySelector("[data-yld-gross-yield]").textContent = `${grossYield.toFixed(2)}%`;
  }

  [yldPrice, yldNightly, yldRental, yldCost].forEach((el) => el.addEventListener("input", updateYield));
  updateYield();

  /* ---------- Loan calculator ---------- */
  const loanPrice = document.querySelector("[data-loan-price]");
  const loanDown = document.querySelector("[data-loan-down]");
  const loanRate = document.querySelector("[data-loan-rate]");
  const loanTenure = document.querySelector("[data-loan-tenure]");

  function updateLoan() {
    const priceCr = Number(loanPrice.value);
    const downPct = Number(loanDown.value);
    const rate = Number(loanRate.value);
    const tenure = Number(loanTenure.value);

    document.querySelector("[data-loan-price-display]").textContent = `₹${priceCr.toFixed(2)} Cr`;
    document.querySelector("[data-loan-down-display]").textContent = `${downPct}% · ${formatInr(priceCr * 10000000 * (downPct / 100))}`;
    document.querySelector("[data-loan-rate-display]").textContent = `${rate.toFixed(1)}% per annum`;
    document.querySelector("[data-loan-tenure-display]").textContent = `${tenure} years`;

    const price = priceCr * 10000000;
    const principal = price * (1 - downPct / 100);
    const monthlyRate = rate / 100 / 12;
    const months = tenure * 12;
    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const total = emi * months;

    document.querySelector("[data-loan-emi]").textContent = formatInr(emi);
    document.querySelector("[data-loan-principal]").textContent = formatInr(principal);
    document.querySelector("[data-loan-interest]").textContent = formatInr(total - principal);
    document.querySelector("[data-loan-total]").textContent = formatInr(total);
  }

  [loanPrice, loanDown, loanRate, loanTenure].forEach((el) => el.addEventListener("input", updateLoan));
  updateLoan();
});
