(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const mainImage = document.getElementById("village-main-image");
    const thumbButtons = Array.from(document.querySelectorAll(".village-thumb"));

    if (!mainImage || !thumbButtons.length) {
      return;
    }

    const setActiveThumb = (button) => {
      thumbButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
    };

    thumbButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const imageSrc = button.getAttribute("data-image");
        if (!imageSrc) {
          return;
        }

        if (mainImage.getAttribute("src") !== imageSrc) {
          mainImage.setAttribute("src", imageSrc);
        }

        setActiveThumb(button);
      });
    });
  });
})();
