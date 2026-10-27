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

let savedTheme = "light";
try { savedTheme = localStorage.getItem("max-journal-theme") || "light"; } catch {}
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

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "The login form is ready for authentication to be connected.";
});

document.querySelector("#forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  formMessage.textContent = "Password recovery will be connected when authentication is set up.";
});

document.querySelector("#signupLink").addEventListener("click", (event) => {
  event.preventDefault();
  formMessage.textContent = "Account creation will be added next.";
});
