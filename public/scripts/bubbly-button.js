(() => {
  function animateButton(event) {
    event.preventDefault();

    const button = event.currentTarget;
    button.classList.remove("animate");

    // Force reflow so animation can be replayed on repeated clicks.
    void button.offsetWidth;

    button.classList.add("animate");
    setTimeout(() => {
      button.classList.remove("animate");
    }, 700);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const bubblyButtons = document.querySelectorAll(".bubbly-button");
    bubblyButtons.forEach((button) => {
      button.addEventListener("click", animateButton, false);
    });
  });
})();
