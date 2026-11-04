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


// GSAP + Lenis add restrained motion without changing the existing login flow.
(function initLiquidMotion() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const backdrop = document.createElement("div");
  backdrop.className = "liquid-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = '<div class="liquid-orb orb-one"></div><div class="liquid-orb orb-two"></div><div class="liquid-glint"></div>';
  document.body.prepend(backdrop);

  if (window.Lenis && !reducedMotion) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  if (!window.gsap || reducedMotion) return;
  const card = document.querySelector(".login-card");
  const logo = document.querySelector(".brand-logo");
  const heading = document.querySelector("#welcomeTitle");
  const fields = document.querySelectorAll("form > label, .password-heading, .password-wrap, .remember, .submit-button, .or-divider, .google-button, .signup, .footer-note");
  gsap.set([card, logo, heading, ...fields], { willChange: "transform, opacity" });
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro.fromTo(card, { opacity: 0, y: 22, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.85 })
    .fromTo(logo, { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, "-=0.48")
    .fromTo(heading, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: 0.42 }, "-=0.28")
    .fromTo(fields, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.045 }, "-=0.18");

  gsap.to(".orb-one", { x: 85, y: 95, rotation: 24, borderRadius: "58% 42% 35% 65% / 44% 55% 45% 56%", duration: 13, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".orb-two", { x: -95, y: -75, rotation: -28, borderRadius: "38% 62% 55% 45% / 58% 38% 62% 42%", duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".liquid-glint", { x: "200%", duration: 9, ease: "sine.inOut", repeat: -1, repeatDelay: 2.5 });
  gsap.utils.toArray(".submit-button, .google-button, .theme-toggle").forEach((button) => {
    button.addEventListener("pointerenter", () => gsap.to(button, { y: -2, duration: 0.22, ease: "power2.out", overwrite: true }));
    button.addEventListener("pointerleave", () => gsap.to(button, { y: 0, duration: 0.28, ease: "power2.out", overwrite: true }));
  });
})();
