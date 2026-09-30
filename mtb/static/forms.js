// MyTutBuddy forms: friendly CV checks + protection against double-sending.
(function () {
  var forms = document.querySelectorAll("form.mtb-form");
  forms.forEach(function (form) {
    var errorBox = form.querySelector(".form-error");
    var button = form.querySelector(".form-submit");
    var fileInput = form.querySelector('input[type="file"]');

    function showError(msg) {
      if (!errorBox) return;
      errorBox.textContent = msg;
      errorBox.hidden = !msg;
    }

    function fileProblem() {
      if (!fileInput || !fileInput.files || !fileInput.files.length) return "";
      var file = fileInput.files[0];
      var maxMb = parseFloat(fileInput.getAttribute("data-max-mb") || "5");
      var okExt = /\.(pdf|doc|docx)$/i.test(file.name);
      if (!okExt) return "Please upload your CV as a PDF, DOC or DOCX file.";
      if (file.size > maxMb * 1024 * 1024) return "That file is too large. Please upload a CV under " + maxMb + " MB.";
      return "";
    }

    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var problem = fileProblem();
        showError(problem);
        if (problem) fileInput.value = "";
      });
    }

    form.addEventListener("submit", function (e) {
      var problem = fileProblem();
      if (problem) {
        e.preventDefault();
        showError(problem);
        return;
      }
      showError("");
      if (button) {
        // Wait a tick so the browser still sends the form, then stop repeat clicks.
        setTimeout(function () {
          button.disabled = true;
          button.textContent = "Sending…";
        }, 0);
      }
    });

    // If the browser restores this page from cache (Back button), re-enable the button.
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted && button && button.textContent === "Sending…") {
        button.disabled = false;
        button.textContent = button.getAttribute("data-label") || "Submit";
      }
    });
    if (button) button.setAttribute("data-label", button.textContent);
  });
})();
