(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("home-objects-grid");
    if (!grid) {
      return;
    }

    const cards = grid.querySelectorAll(".home-object-item");
    const priceMin = document.getElementById("home-price-min");
    const priceMax = document.getElementById("home-price-max");
    const areaMin = document.getElementById("home-area-min");
    const areaMax = document.getElementById("home-area-max");
    const plotMin = document.getElementById("home-plot-min");
    const plotMax = document.getElementById("home-plot-max");
    const villageChecks = document.querySelectorAll(".home-filter-village");
    const floorChecks = document.querySelectorAll(".home-filter-floor");
    const resetButton = document.getElementById("home-reset-filters");

    const labels = {
      priceMin: document.getElementById("home-price-min-val"),
      priceMax: document.getElementById("home-price-max-val"),
      areaMin: document.getElementById("home-area-min-val"),
      areaMax: document.getElementById("home-area-max-val"),
      plotMin: document.getElementById("home-plot-min-val"),
      plotMax: document.getElementById("home-plot-max-val")
    };

    const rangeContainers = {
      price: document.getElementById("home-price-range"),
      area: document.getElementById("home-area-range"),
      plot: document.getElementById("home-plot-range")
    };

    const keepRangeOrder = (minInput, maxInput) => {
      if (Number(minInput.value) > Number(maxInput.value)) {
        const temp = minInput.value;
        minInput.value = maxInput.value;
        maxInput.value = temp;
      }
    };

    const updateDualTrack = (container, minInput, maxInput) => {
      if (!container) {
        return;
      }

      const min = Number(minInput.min);
      const max = Number(minInput.max);
      const minValue = Number(minInput.value);
      const maxValue = Number(maxInput.value);
      const span = max - min || 1;
      const minPct = ((minValue - min) / span) * 100;
      const maxPct = ((maxValue - min) / span) * 100;

      container.style.setProperty("--min-pct", `${minPct}%`);
      container.style.setProperty("--max-pct", `${maxPct}%`);
    };

    const updateLabels = () => {
      labels.priceMin.textContent = priceMin.value;
      labels.priceMax.textContent = priceMax.value;
      labels.areaMin.textContent = areaMin.value;
      labels.areaMax.textContent = areaMax.value;
      labels.plotMin.textContent = plotMin.value;
      labels.plotMax.textContent = plotMax.value;

      updateDualTrack(rangeContainers.price, priceMin, priceMax);
      updateDualTrack(rangeContainers.area, areaMin, areaMax);
      updateDualTrack(rangeContainers.plot, plotMin, plotMax);
    };

    const apply = () => {
      keepRangeOrder(priceMin, priceMax);
      keepRangeOrder(areaMin, areaMax);
      keepRangeOrder(plotMin, plotMax);
      updateLabels();

      const selectedVillages = Array.from(villageChecks)
        .filter((input) => input.checked)
        .map((input) => input.value);

      const selectedFloors = Array.from(floorChecks)
        .filter((input) => input.checked)
        .map((input) => input.value);

      cards.forEach((card) => {
        const cardPrice = Number(card.dataset.price);
        const cardArea = Number(card.dataset.area);
        const cardPlot = Number(card.dataset.plot);
        const cardFloors = Number(card.dataset.floors);
        const villageSlug = card.dataset.villageSlug;

        const floorMatch = selectedFloors.some((value) => {
          if (value === "4plus") {
            return cardFloors >= 4;
          }
          return cardFloors === Number(value);
        });

        const villageMatch = !selectedVillages.length || selectedVillages.includes(villageSlug);
        const floorsEnabled = !selectedFloors.length || floorMatch;

        const isVisible =
          cardPrice >= Number(priceMin.value) &&
          cardPrice <= Number(priceMax.value) &&
          cardArea >= Number(areaMin.value) &&
          cardArea <= Number(areaMax.value) &&
          cardPlot >= Number(plotMin.value) &&
          cardPlot <= Number(plotMax.value) &&
          villageMatch &&
          floorsEnabled;

        card.classList.toggle("is-hidden", !isVisible);
      });
    };

    [priceMin, priceMax, areaMin, areaMax, plotMin, plotMax].forEach((input) => {
      input.addEventListener("input", apply);
    });

    villageChecks.forEach((input) => input.addEventListener("change", apply));
    floorChecks.forEach((input) => input.addEventListener("change", apply));

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        priceMin.value = priceMin.min;
        priceMax.value = priceMax.max;
        areaMin.value = areaMin.min;
        areaMax.value = areaMax.max;
        plotMin.value = plotMin.min;
        plotMax.value = plotMax.max;

        villageChecks.forEach((input) => {
          input.checked = false;
        });

        floorChecks.forEach((input) => {
          input.checked = false;
        });

        apply();
      });
    }

    apply();
  });
})();
