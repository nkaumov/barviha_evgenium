(() => {
  function enhanceButton(button) {
    if (button.dataset.btnEnhanced === "1") {
      return;
    }

    const labelText = button.textContent.trim();

    button.textContent = "";

    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("class", "btn-border");
    svg.setAttribute("viewBox", "0 0 180 60");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const bgLine = document.createElementNS(svgNs, "polyline");
    bgLine.setAttribute("class", "bg-line");
    bgLine.setAttribute("points", "179,1 179,59 1,59 1,1 179,1");

    const hlLine = document.createElementNS(svgNs, "polyline");
    hlLine.setAttribute("class", "hl-line");
    hlLine.setAttribute("points", "179,1 179,59 1,59 1,1 179,1");

    svg.appendChild(bgLine);
    svg.appendChild(hlLine);

    const label = document.createElement("span");
    label.className = "btn-label";
    label.textContent = labelText;

    button.appendChild(svg);
    button.appendChild(label);
    button.dataset.btnEnhanced = "1";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".btn:not(.btn-flat):not(.btn-floating)");
    buttons.forEach(enhanceButton);
  });
})();
