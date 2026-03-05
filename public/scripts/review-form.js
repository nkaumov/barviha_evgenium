(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("review-form");
    const submit = document.getElementById("review-submit");
    const objectIdInput = document.getElementById("request-object-id");
    const commentInput = form?.querySelector('textarea[name="text"]');

    if (!form || !submit) return;

    const params = new URLSearchParams(window.location.search);
    const requestObject = params.get("requestObject");

    if (requestObject) {
      if (objectIdInput) {
        objectIdInput.value = requestObject;
      }

      if (commentInput && !commentInput.value.trim()) {
        commentInput.value = `Интересует объект #${requestObject}.`;
      }
    }

    let busy = false;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (busy) return;

      busy = true;
      submit.classList.remove("is-done");
      submit.classList.add("is-loading");

      setTimeout(() => {
        submit.classList.remove("is-loading");
        submit.classList.add("is-done");
      }, 1900);

      setTimeout(() => {
        submit.classList.remove("is-done");
        form.reset();

        if (objectIdInput && requestObject) {
          objectIdInput.value = requestObject;
        }

        busy = false;
      }, 3600);
    });
  });
})();
