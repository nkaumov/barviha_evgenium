(() => {
  document.addEventListener("DOMContentLoaded", () => {
    initTrackSlider({
      trackSelector: "#life-articles-track",
      prevSelector: ".life-slider-nav--prev",
      nextSelector: ".life-slider-nav--next",
      cardSelector: ".life-article-card"
    });

    initTrackSlider({
      trackSelector: "#testimonials-track",
      prevSelector: ".testimonials-nav--prev",
      nextSelector: ".testimonials-nav--next",
      cardSelector: ".testimonial-card"
    });
  });

  function initTrackSlider({ trackSelector, prevSelector, nextSelector, cardSelector }) {
    const track = document.querySelector(trackSelector);
    if (!track) return;

    const prev = document.querySelector(prevSelector);
    const next = document.querySelector(nextSelector);

    const step = () => {
      const card = track.querySelector(cardSelector);
      if (!card) return Math.max(280, Math.floor(track.clientWidth * 0.75));

      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0") || 0;
      return Math.ceil(card.getBoundingClientRect().width + gap);
    };

    const move = (direction) => {
      track.scrollBy({ left: step() * direction, behavior: "smooth" });
    };

    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
  }
})();
