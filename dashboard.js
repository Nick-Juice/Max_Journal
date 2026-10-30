const themeToggle = document.querySelector("#themeToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const sidebar = document.querySelector("#sidebar");
const toast = document.querySelector("#toast");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("max-journal-theme", theme); } catch {}
}

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("max-journal-theme") || "dark"; } catch {}
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

document.querySelector("#todayDate").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short", month: "short", day: "numeric", year: "numeric"
}).format(new Date());

mobileMenu.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  mobileMenu.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".main-nav a, .sidebar-bottom a").forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("open");
    mobileMenu.setAttribute("aria-expanded", "false");
  });
});

let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3200);
}

document.querySelectorAll("[data-journal]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.dataset.journal + " setup will be available when journal activation is connected.");
  });
});
