const themeToggle = document.querySelector("#themeToggle");
const showPassword = document.querySelector("#showPassword");
const passwordInput = document.querySelector("#password");
const loginForm = document.querySelector("#loginForm");
const formMessage = document.querySelector("#formMessage");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.title = dark ? "Switch to light mode" : "Switch to dark mode";
  try { localStorage.setItem("max-journal-theme", theme); } catch {}
}

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("max-journal-theme") || "dark"; } catch {}
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

showPassword.addEventListener("click", () => {
  const reveal = passwordInput.type === "password";
  passwordInput.type = reveal ? "text" : "password";
  showPassword.textContent = reveal ? "Hide" : "Show";
  showPassword.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
});

// Temporary demo access only. Replace this with Supabase authentication before launch.
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value.trim().toLowerCase();
  const password = passwordInput.value;
  const demoPassword = [49, 50, 51, 52, 53].map((code) => String.fromCharCode(code)).join("");

  if (email === "domato@gmail.com" && password === demoPassword) {
    formMessage.textContent = "Demo login successful. Opening your dashboard...";
    window.location.href = "dashboard.html";
    return;
  }

  formMessage.textContent = "Those demo details are not correct. Please check the email and password.";
});

document.querySelector("#googleSignIn").addEventListener("click", () => {
  formMessage.textContent = "Google sign-in will work once Google authentication is connected.";
});

document.querySelector("#forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  formMessage.textContent = "Password recovery will be connected when authentication is set up.";
});
