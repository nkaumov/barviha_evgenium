(() => {
  const SHOW_AFTER = 220;

  const getScrollableHeight = () => {
    const doc = document.documentElement;
    return Math.max(0, doc.scrollHeight - window.innerHeight);
  };

  const isScrollablePage = () => getScrollableHeight() > 8;

  const updateVisibility = (button) => {
    const shouldShow = isScrollablePage() && window.scrollY > SHOW_AFTER;
    button.classList.toggle("is-visible", shouldShow);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("back-to-top");
    if (!button) return;

    const onUpdate = () => updateVisibility(button);

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate);
    window.addEventListener("load", onUpdate);

    onUpdate();
  });
})();
