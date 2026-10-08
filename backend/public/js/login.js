$(document).ready(function () {
  const loginForm = $("#loginForm");
  const errorMessage = $("#errorMessage");
  const loadingMessage = $("#loadingMessage");
  const loginBtn = $("#loginBtn");

  loginForm.on("submit", function (event) {
    event.preventDefault();

    const username = $("#username").val().trim();
    const password = $("#password").val().trim();

    // Clear previous state
    errorMessage.hide().text("");
    loadingMessage.hide();
    loginBtn.prop("disabled", true).text("Signing in…");

    if (!username || !password) {
      showError("Please enter both username and password.");
      resetButton();
      return;
    }

    loadingMessage.show();

    $.ajax({
      url: "/api/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password }),
      success: function (response) {
        if (response && response.token) {
          localStorage.setItem("token", response.token);
          window.location.href = "/dashboard";
        } else {
          showError("Login response did not include a token.");
          resetButton();
        }
      },
      error: function (xhr) {
        const message =
          (xhr.responseJSON && xhr.responseJSON.message) ||
          "Login failed. Please check your credentials.";
        showError(message);
        resetButton();
      }
    });

    function showError(msg) {
      loadingMessage.hide();
      errorMessage.text(msg).show();
    }

    function resetButton() {
      loadingMessage.hide();
      loginBtn.prop("disabled", false).text("Login");
    }
  });
});