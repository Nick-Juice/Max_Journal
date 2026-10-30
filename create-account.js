const themeToggle = document.querySelector("#themeToggle");
const createAccountForm = document.querySelector("#createAccountForm");
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

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Hide" : "Show";
    button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
  });
});

createAccountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;

  if (password !== confirmPassword) {
    formMessage.textContent = "Your passwords do not match.";
    document.querySelector("#confirmPassword").focus();
    return;
  }

  formMessage.textContent = "The page is ready. Account creation will work once Supabase is connected.";
});

document.querySelector("#googleSignUp").addEventListener("click", () => {
  formMessage.textContent = "Google sign-up will work once Google authentication is connected.";
});
