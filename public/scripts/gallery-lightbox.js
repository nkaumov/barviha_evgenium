(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const items = Array.from(document.querySelectorAll(".gallery-grid__item"));
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImage = document.getElementById("gallery-lightbox-image");
    const lightboxCaption = document.getElementById("gallery-lightbox-caption");
    const prevBtn = lightbox?.querySelector("[data-gallery-prev]");
    const nextBtn = lightbox?.querySelector("[data-gallery-next]");
    const closeButtons = Array.from(document.querySelectorAll("[data-gallery-close]"));

    if (!items.length || !lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }

    const slides = items.map((item) => ({
      src: item.getAttribute("data-gallery-src") || "",
      title: item.getAttribute("data-gallery-title") || ""
    }));

    let activeIndex = 0;

    const normalize = (index) => {
      const size = slides.length;
      return ((index % size) + size) % size;
    };

    const render = () => {
      const slide = slides[activeIndex];
      if (!slide) return;

      lightboxImage.setAttribute("src", slide.src);
      lightboxImage.setAttribute("alt", slide.title);
      lightboxCaption.textContent = slide.title;
    };

    const open = (index) => {
      activeIndex = normalize(index);
      render();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    const next = () => {
      activeIndex = normalize(activeIndex + 1);
      render();
    };

    const prev = () => {
      activeIndex = normalize(activeIndex - 1);
      render();
    };

    items.forEach((item, index) => {
      item.addEventListener("click", () => open(index));
    });

    closeButtons.forEach((button) => button.addEventListener("click", close));
    nextBtn?.addEventListener("click", next);
    prevBtn?.addEventListener("click", prev);

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowRight") {
        next();
      } else if (event.key === "ArrowLeft") {
        prev();
      }
    });
  });
})();
