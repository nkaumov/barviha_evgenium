(function () {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('siteSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (!btn || !sidebar || !backdrop) return;

  const links = Array.from(sidebar.querySelectorAll('.sidebar__nav a'));
  links.forEach((a, i) => a.style.setProperty('--i', String(i)));

  let lastFocused = null;
  const supportsStableGutter =
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('scrollbar-gutter: stable');

  const applyScrollLockCompensation = () => {
    if (supportsStableGutter) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const clearScrollLockCompensation = () => {
    if (supportsStableGutter) return;
    document.body.style.paddingRight = '';
  };

  function getFocusable(root) {
    return Array.from(
      root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
  }

  function openSidebar() {
    lastFocused = document.activeElement;

    applyScrollLockCompensation();
    document.body.classList.add('sidebar-open');
    btn.setAttribute('aria-expanded', 'true');

    const focusables = getFocusable(sidebar);
    (focusables[0] || sidebar).focus?.();

    document.addEventListener('keydown', onKeyDown, true);
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    clearScrollLockCompensation();
    btn.setAttribute('aria-expanded', 'false');

    document.removeEventListener('keydown', onKeyDown, true);
    (lastFocused || btn).focus?.();
  }

  function toggleSidebar() {
    document.body.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
  }

  function onKeyDown(e) {
    if (!document.body.classList.contains('sidebar-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSidebar();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getFocusable(sidebar);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  btn.addEventListener('click', toggleSidebar);
  backdrop.addEventListener('click', closeSidebar);

  sidebar.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) closeSidebar();
  });

  btn.addEventListener('mousemove', (e) => {
    if (btn.getAttribute('data-magnet') !== '1') return;
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    btn.style.transform = `translate(${dx * 4}px, ${dy * 4}px) scale(1.02)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
})();
