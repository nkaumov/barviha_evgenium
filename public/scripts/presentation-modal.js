(() => {
  const modal = document.getElementById('presentation-modal');
  if (!modal) return;

  const triggerButtons = Array.from(document.querySelectorAll('[data-open-presentation-modal]'));
  const closeControls = modal.querySelectorAll('[data-close-presentation-modal]');
  const form = document.getElementById('presentation-modal-form');
  const firstInput = form ? form.querySelector('input') : null;
  const sourceInput = document.getElementById('presentation-source-input');
  const returnInput = document.getElementById('presentation-return-input');

  const setSource = (value) => {
    if (!sourceInput) return;
    sourceInput.value = value && String(value).trim() ? String(value).trim() : 'modal';
  };

  const setReturnTo = () => {
    if (!returnInput) return;
    returnInput.value = `${window.location.pathname}${window.location.search}`;
  };

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setReturnTo();
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  triggerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setSource(button.getAttribute('data-source'));
      openModal();
    });
  });

  closeControls.forEach((node) => {
    node.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (modal.dataset.autoOpen === '1') {
    const url = new URL(window.location.href);
    const sourceFromUrl = modal.dataset.openSource || url.searchParams.get('source');
    setSource(sourceFromUrl);
    openModal();

    if (window.history && typeof window.history.replaceState === 'function') {
      url.searchParams.delete('presentation');
      url.searchParams.delete('source');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }

})();
