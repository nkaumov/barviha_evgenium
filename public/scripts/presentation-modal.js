(() => {
  const modal = document.getElementById('presentation-modal');
  if (!modal) return;

  const triggerButtons = Array.from(document.querySelectorAll('[data-open-presentation-modal]'));
  const closeControls = modal.querySelectorAll('[data-close-presentation-modal]');

  const stepRequest = document.getElementById('presentation-step-request');
  const stepSuccess = document.getElementById('presentation-step-success');

  const form = document.getElementById('presentation-modal-form');
  const sourceInput = document.getElementById('presentation-source-input');
  const returnInput = document.getElementById('presentation-return-input');

  const phoneInput = document.getElementById('presentation-phone-input');
  const codeInput = document.getElementById('phone-code-input');
  const nameInput = document.getElementById('presentation-name-input');

  const requestCodeBtn = document.getElementById('phone-request-btn');
  const confirmCodeBtn = document.getElementById('phone-confirm-btn');
  const submitBtn = document.getElementById('presentation-submit-btn');

  const codeBlock = document.getElementById('phone-code-block');
  const statusNode = document.getElementById('phone-verify-status');
  const requestError = document.getElementById('presentation-modal-error');

  const verificationIdInput = document.getElementById('verification-id-input');
  const inquiryIdInput = document.getElementById('inquiry-id-input');

  let isPhoneVerified = false;
  let hasRequestedCode = false;

  const phoneDigits = (value) => String(value || '').replace(/\D/g, '');

  const hideError = () => {
    if (!requestError) return;
    requestError.textContent = '';
    requestError.classList.add('is-hidden');
  };

  const showError = (message) => {
    if (!requestError) return;
    requestError.textContent = message || 'Ошибка. Попробуйте еще раз.';
    requestError.classList.remove('is-hidden');
  };

  const setStatus = (message, type = 'info') => {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.classList.remove('is-hidden', 'is-success', 'is-info');
    statusNode.classList.add(type === 'success' ? 'is-success' : 'is-info');
  };

  const clearStatus = () => {
    if (!statusNode) return;
    statusNode.textContent = '';
    statusNode.classList.add('is-hidden');
    statusNode.classList.remove('is-success', 'is-info');
  };

  const showStep = (step) => {
    stepRequest?.classList.add('is-hidden');
    stepSuccess?.classList.add('is-hidden');

    if (step === 'request') {
      stepRequest?.classList.remove('is-hidden');
      nameInput?.focus();
    }

    if (step === 'success') {
      stepSuccess?.classList.remove('is-hidden');
    }
  };

  const resetVerificationState = () => {
    isPhoneVerified = false;
    hasRequestedCode = false;

    if (inquiryIdInput) inquiryIdInput.value = '';
    if (verificationIdInput) verificationIdInput.value = '';
    if (codeInput) codeInput.value = '';

    phoneInput?.removeAttribute('readonly');
    codeBlock?.classList.add('is-hidden');

    if (submitBtn) submitBtn.disabled = true;
    if (confirmCodeBtn) confirmCodeBtn.disabled = true;

    clearStatus();
  };

  const syncButtons = () => {
    const hasPhone = phoneDigits(phoneInput?.value).length >= 10;

    if (requestCodeBtn) {
      requestCodeBtn.disabled = !hasPhone || isPhoneVerified;
    }

    if (!hasRequestedCode || isPhoneVerified) {
      if (confirmCodeBtn) confirmCodeBtn.disabled = true;
    } else {
      const hasCode = /^\d{6}$/.test(String(codeInput?.value || '').trim());
      if (confirmCodeBtn) confirmCodeBtn.disabled = !hasCode;
    }
  };

  const setSource = (value) => {
    const safe = value && String(value).trim() ? String(value).trim() : 'modal';
    if (sourceInput) sourceInput.value = safe;
  };

  const setReturnTo = () => {
    const path = `${window.location.pathname}${window.location.search}`;
    if (returnInput) returnInput.value = path;
  };

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    showStep('request');
    hideError();
    resetVerificationState();
    syncButtons();
    setReturnTo();
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

  closeControls.forEach((node) => node.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  phoneInput?.addEventListener('input', () => {
    hideError();

    if (isPhoneVerified) {
      return;
    }

    if (hasRequestedCode) {
      hasRequestedCode = false;
      codeBlock?.classList.add('is-hidden');
      if (verificationIdInput) verificationIdInput.value = '';
      if (inquiryIdInput) inquiryIdInput.value = '';
      if (codeInput) codeInput.value = '';
      clearStatus();
    }

    syncButtons();
  });

  codeInput?.addEventListener('input', () => {
    hideError();
    syncButtons();
  });

  requestCodeBtn?.addEventListener('click', async () => {
    hideError();

    const phone = String(phoneInput?.value || '').trim();
    if (phoneDigits(phone).length < 10) {
      showError('Введите корректный номер телефона.');
      return;
    }

    requestCodeBtn.disabled = true;

    try {
      const body = new URLSearchParams({
        phone,
        source_page: sourceInput?.value || 'modal',
        return_to: returnInput?.value || '/'
      });

      const response = await fetch('/phone-verification/request', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        showError(payload.message || 'Не удалось отправить код.');
        return;
      }

      if (inquiryIdInput) inquiryIdInput.value = String(payload.inquiryId || '');
      if (verificationIdInput) verificationIdInput.value = String(payload.verificationId || '');

      hasRequestedCode = true;
      codeBlock?.classList.remove('is-hidden');
      setStatus('Код отправлен. Для теста используйте 123456.', 'info');
      syncButtons();
      codeInput?.focus();
    } catch {
      showError('Ошибка сети. Повторите попытку.');
    } finally {
      syncButtons();
    }
  });

  confirmCodeBtn?.addEventListener('click', async () => {
    hideError();

    const verificationId = String(verificationIdInput?.value || '').trim();
    const inquiryId = String(inquiryIdInput?.value || '').trim();
    const code = String(codeInput?.value || '').trim();

    if (!verificationId || !inquiryId) {
      showError('Сначала запросите код подтверждения.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      showError('Введите 6-значный код.');
      return;
    }

    confirmCodeBtn.disabled = true;

    try {
      const body = new URLSearchParams({
        verification_id: verificationId,
        inquiry_id: inquiryId,
        code,
        source_page: sourceInput?.value || 'modal',
        return_to: returnInput?.value || '/'
      });

      const response = await fetch('/phone-verification/confirm', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        showError(payload.message || 'Неверный код. Попробуйте снова.');
        return;
      }

      isPhoneVerified = true;
      phoneInput?.setAttribute('readonly', 'readonly');
      if (submitBtn) submitBtn.disabled = false;
      setStatus('Номер подтвержден.', 'success');
      codeBlock?.classList.add('is-hidden');
      syncButtons();
    } catch {
      showError('Ошибка сети. Повторите попытку.');
      syncButtons();
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    if (!isPhoneVerified) {
      showError('Сначала подтвердите номер телефона.');
      return;
    }

    const submit = submitBtn;
    if (submit) submit.disabled = true;

    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        showError(payload.message || 'Не удалось отправить заявку.');
        if (submit) submit.disabled = false;
        return;
      }

      showStep('success');
    } catch {
      showError('Ошибка сети. Повторите попытку.');
      if (submit) submit.disabled = false;
    }
  });
})();
