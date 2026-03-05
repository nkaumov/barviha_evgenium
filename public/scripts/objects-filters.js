(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("objects-grid");
    if (!grid) {
      return;
    }

    const cards = grid.querySelectorAll(".object-item");

    const priceMin = document.getElementById("filter-price-min");
    const priceMax = document.getElementById("filter-price-max");
    const areaMin = document.getElementById("filter-area-min");
    const areaMax = document.getElementById("filter-area-max");
    const distanceMin = document.getElementById("filter-distance-min");
    const distanceMax = document.getElementById("filter-distance-max");
    const plotMin = document.getElementById("filter-plot-min");
    const plotMax = document.getElementById("filter-plot-max");

    if (!priceMin || !priceMax || !areaMin || !areaMax || !distanceMin || !distanceMax || !plotMin || !plotMax) {
      return;
    }

    const villageChecks = document.querySelectorAll(".objects-filter-village");
    const floorChecks = document.querySelectorAll(".objects-filter-floor");
    const resetButton = document.getElementById("reset-filters");

    const labels = {
      priceMin: document.getElementById("filter-price-min-val"),
      priceMax: document.getElementById("filter-price-max-val"),
      areaMin: document.getElementById("filter-area-min-val"),
      areaMax: document.getElementById("filter-area-max-val"),
      distanceMin: document.getElementById("filter-distance-min-val"),
      distanceMax: document.getElementById("filter-distance-max-val"),
      plotMin: document.getElementById("filter-plot-min-val"),
      plotMax: document.getElementById("filter-plot-max-val")
    };

    const rangeContainers = {
      price: document.getElementById("objects-price-range"),
      area: document.getElementById("objects-area-range"),
      distance: document.getElementById("objects-distance-range"),
      plot: document.getElementById("objects-plot-range")
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
      labels.distanceMin.textContent = distanceMin.value;
      labels.distanceMax.textContent = distanceMax.value;
      labels.plotMin.textContent = plotMin.value;
      labels.plotMax.textContent = plotMax.value;

      updateDualTrack(rangeContainers.price, priceMin, priceMax);
      updateDualTrack(rangeContainers.area, areaMin, areaMax);
      updateDualTrack(rangeContainers.distance, distanceMin, distanceMax);
      updateDualTrack(rangeContainers.plot, plotMin, plotMax);
    };

    const apply = () => {
      keepRangeOrder(priceMin, priceMax);
      keepRangeOrder(areaMin, areaMax);
      keepRangeOrder(distanceMin, distanceMax);
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
        const cardDistance = Number(card.dataset.distance);
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
          cardDistance >= Number(distanceMin.value) &&
          cardDistance <= Number(distanceMax.value) &&
          cardPlot >= Number(plotMin.value) &&
          cardPlot <= Number(plotMax.value) &&
          villageMatch &&
          floorsEnabled;

        card.classList.toggle("is-hidden", !isVisible);
      });
    };

    [priceMin, priceMax, areaMin, areaMax, distanceMin, distanceMax, plotMin, plotMax].forEach((input) => {
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
        distanceMin.value = distanceMin.min;
        distanceMax.value = distanceMax.max;
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
