document.addEventListener("DOMContentLoaded", () => {
  initVillagesCarousel();
});

function initVillagesCarousel() {
  const carousel = document.querySelector(".villages-roulette");
  if (!carousel) return;

  const prevBtn = document.querySelector(".villages-roulette-nav--prev");
  const nextBtn = document.querySelector(".villages-roulette-nav--next");

  const originalCards = Array.from(carousel.querySelectorAll(".village-roulette-card"));
  if (!originalCards.length) return;

  const baseCount = originalCards.length;
  const desktopMq = window.matchMedia("(min-width: 993px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Build loop track: [set0][set1][set2] =====
  const fragment = document.createDocumentFragment();
  for (let set = 0; set < 3; set++) {
    for (let i = 0; i < baseCount; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.dataset.virtualIndex = String(i);
      fragment.appendChild(clone);
    }
  }

  carousel.innerHTML = "";
  carousel.appendChild(fragment);

  const cards = Array.from(carousel.querySelectorAll(".village-roulette-card"));
  let activeTrackIndex = baseCount; // first card of middle set

  carousel.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  let dragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;
  let lastDragAt = 0;

  let rafId = null;
  let snapTimer = null;
  let rebaseTimer = null;
  let programmatic = false;
  let programmaticTimer = null;
  let setSpan = 0;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function toMiddleTrackIndex(anyTrackIndex) {
    return baseCount + mod(anyTrackIndex, baseCount);
  }

  function scrollBehavior() {
    return reducedMotion ? "auto" : "smooth";
  }

  function getClosestTrackIndex() {
    const cr = carousel.getBoundingClientRect();
    const center = cr.left + cr.width / 2;

    let bestI = 0;
    let bestD = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(center - c);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }

    return bestI;
  }

  function centerTrackCard(trackIndex, behavior = scrollBehavior()) {
    const card = cards[trackIndex];
    if (!card) return;

    const maxLeft = carousel.scrollWidth - carousel.clientWidth;
    const targetLeft = card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2;
    const left = clamp(targetLeft, 0, Math.max(0, maxLeft));

    programmatic = true;
    carousel.scrollTo({ left, behavior });

    clearTimeout(programmaticTimer);
    programmaticTimer = setTimeout(() => {
      programmatic = false;
    }, 360);
  }

  function setActiveByTrack(trackIndex) {
    activeTrackIndex = trackIndex;
    const activeVirtual = mod(trackIndex, baseCount);

    cards.forEach((card, idx) => {
      const isActive = idx === trackIndex;
      card.classList.toggle("is-active", isActive);
      card.dataset.activeVirtual = String(activeVirtual);
    });
  }

  function recalcSetSpan() {
    if (cards.length <= baseCount) {
      setSpan = 0;
      return;
    }

    setSpan = cards[baseCount].offsetLeft - cards[0].offsetLeft;
  }

  function rebaseIfNeeded() {
    if (!setSpan) return;

    if (activeTrackIndex < baseCount) {
      activeTrackIndex += baseCount;
      carousel.scrollLeft += setSpan;
      setActiveByTrack(activeTrackIndex);
      updateTransforms();
      return;
    }

    if (activeTrackIndex >= baseCount * 2) {
      activeTrackIndex -= baseCount;
      carousel.scrollLeft -= setSpan;
      setActiveByTrack(activeTrackIndex);
      updateTransforms();
    }
  }

  function scheduleRebase(delay = reducedMotion ? 20 : 380) {
    clearTimeout(rebaseTimer);
    rebaseTimer = setTimeout(() => {
      rebaseIfNeeded();
    }, delay);
  }

  function updateTransforms() {
    if (!desktopMq.matches) {
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.opacity = "";
        card.style.zIndex = "";
        card.style.filter = "";
      });
      return;
    }

    const cr = carousel.getBoundingClientRect();
    const center = cr.left + cr.width / 2;

    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;

      const width = r.width || 1;
      const ratioRaw = (cardCenter - center) / width;
      const ratio = clamp(ratioRaw, -2, 2);
      const abs = Math.abs(ratio);

      const rotateY = -ratio * 18;
      const scale = Math.max(0.82, 1 - abs * 0.12);
      const shiftY = abs * 10;
      const opacity = Math.max(0.45, 1 - abs * 0.26);
      const zIndex = String(200 - Math.round(abs * 60));
      const saturate = (0.8 + (1 - Math.min(abs, 1)) * 0.2).toFixed(3);

      card.style.transform = `translateY(${shiftY}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = zIndex;
      card.style.filter = `saturate(${saturate})`;
    });
  }

  function snapToClosest() {
    const idx = getClosestTrackIndex();
    setActiveByTrack(idx);
    centerTrackCard(idx);
    scheduleRebase();
  }

  function onScroll() {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      const idx = getClosestTrackIndex();
      setActiveByTrack(idx);
      updateTransforms();
      rafId = null;
    });

    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (!dragging && !programmatic) snapToClosest();
    }, 150);
  }

  // ===== Drag mouse/touch =====
  carousel.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    dragging = true;
    moved = false;
    startX = e.clientX;
    startScrollLeft = carousel.scrollLeft;

    carousel.style.scrollBehavior = "auto";
    carousel.setPointerCapture?.(e.pointerId);
  });

  carousel.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;

    carousel.scrollLeft = startScrollLeft - dx;
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    carousel.style.scrollBehavior = "";

    if (moved) {
      lastDragAt = Date.now();
      snapToClosest();
    }
  }

  carousel.addEventListener("pointerup", endDrag);
  carousel.addEventListener("pointercancel", endDrag);
  carousel.addEventListener("pointerleave", endDrag);

  carousel.addEventListener(
    "click",
    (e) => {
      if (Date.now() - lastDragAt < 320) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  function step(direction) {
    // Seamless boundary step: rebase BEFORE animated move, so visual direction stays natural.
    if (setSpan) {
      if (direction > 0 && activeTrackIndex === baseCount * 2 - 1) {
        activeTrackIndex -= baseCount;
        carousel.scrollLeft -= setSpan;
        setActiveByTrack(activeTrackIndex);
      } else if (direction < 0 && activeTrackIndex === baseCount) {
        activeTrackIndex += baseCount;
        carousel.scrollLeft += setSpan;
        setActiveByTrack(activeTrackIndex);
      }
    }

    let nextTrack = activeTrackIndex + direction;
    if (nextTrack < 0) {
      nextTrack += baseCount;
    }
    if (nextTrack >= cards.length) {
      nextTrack -= baseCount;
    }

    setActiveByTrack(nextTrack);
    centerTrackCard(nextTrack);
    scheduleRebase();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => step(1));

  carousel.addEventListener("scroll", onScroll, { passive: true });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      recalcSetSpan();
      const middleSetIndex = toMiddleTrackIndex(activeTrackIndex);
      setActiveByTrack(middleSetIndex);
      centerTrackCard(middleSetIndex, "auto");
      updateTransforms();
    }, 120);
  });

  // initial: center = first, left = last, right = second
  recalcSetSpan();
  setActiveByTrack(baseCount);
  centerTrackCard(activeTrackIndex, "auto");
  updateTransforms();
}
