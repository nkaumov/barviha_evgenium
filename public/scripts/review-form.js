(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('review-submit');
    if (!submit) return;

    submit.addEventListener('click', () => {
      submit.classList.add('is-loading');
    }, { once: true });
  });
})();
