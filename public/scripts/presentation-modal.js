(() => {
  const modal = document.getElementById('presentation-modal');
  const openBtn = document.getElementById('open-presentation-modal');
  const form = document.getElementById('presentation-modal-form');

  if (!modal || !openBtn || !form) return;

  const closeControls = modal.querySelectorAll('[data-close-presentation-modal]');
  const firstInput = form.querySelector('input');

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    openBtn.focus();
  };

  openBtn.addEventListener('click', openModal);

  closeControls.forEach((node) => {
    node.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    closeModal();
  });
})();
