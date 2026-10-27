const KEY = "max-journal-entries-v1";
const THEME_KEY = "max-journal-theme-v1";
const prompts = [
"What is one thing you learned about yourself today?",
"What is something small that made you smile recently?",
"What would make tomorrow feel like a good day?",
"What is one thing you are proud of this week?",
"What has been taking up most of your thoughts lately?",
"What is something you want to let go of?",
"What is one thing you are grateful for right now?"
];
const $ = (selector) => document.querySelector(selector);
let entries = readEntries();
let toastTimer;

function readEntries() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
function saveEntries() {
  try { localStorage.setItem(KEY, JSON.stringify(entries)); }
  catch { toast("Could not save. Your browser storage may be full."); }
}
function safe(value) {
  return String(value || "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function dateText(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2500);
}
function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  $("#themeText").textContent = theme === "dark" ? "Light appearance" : "Dark appearance";
  $("#themeToggle").firstChild.textContent = theme === "dark" ? "☀  " : "☾  ";
  $("#topTheme").textContent = theme === "dark" ? "☀" : "◐";
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
function toggleTheme() {
  setTheme(document.body.classList.contains("dark") ? "light" : "dark");
}
function updateDates() {
  const now = new Date();
  $("#today").textContent = now.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  $("#welcomeDate").textContent = now.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
  $("#year").textContent = now.getFullYear();
  $("#promptText").textContent = prompts[now.getDay()];
}
function card(entry) {
  const excerpt = entry.body.length > 180 ? entry.body.slice(0,180) + "…" : entry.body;
  const words = entry.body.trim().split(/\s+/).filter(Boolean).length;
  return '<article class="entry-card"><h3>' + safe(entry.title) + '</h3><span class="entry-date">' + dateText(entry.updatedAt || entry.createdAt) + ' · ' + words + ' words</span><span class="mood">' + safe(entry.mood) + '</span><p class="excerpt">' + safe(excerpt) + '</p><div class="card-actions"><button class="small-action" data-action="edit" data-id="' + safe(entry.id) + '">Edit</button><button class="small-action" data-action="delete" data-id="' + safe(entry.id) + '">Delete</button><button class="small-action favorite-action" data-action="favorite" data-id="' + safe(entry.id) + '">' + (entry.favorite ? "♥ Saved" : "♡ Favorite") + '</button></div></article>';
}
function renderRhythm() {
  const today = new Date();
  let active = 0;
  const html = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(today);
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() - offset);
    const found = entries.some((entry) => new Date(entry.createdAt).toDateString() === date.toDateString());
    if (found) active++;
    html.push('<div class="day"><span>' + date.toLocaleDateString(undefined,{weekday:"narrow"}) + '</span><div class="dot ' + (found ? "active" : "") + '" title="' + date.toLocaleDateString() + '"></div></div>');
  }
  $("#days").innerHTML = html.join("");
  $("#activeDays").textContent = active + " active day" + (active === 1 ? "" : "s");
}
function empty(message) { return '<div class="list-empty">' + safe(message) + '</div>'; }
function render() {
  const newest = entries.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const weekAgo = Date.now() - 7 * 86400000;
  $("#total").textContent = entries.length;
  $("#count").textContent = entries.length;
  $("#week").textContent = entries.filter((e) => new Date(e.createdAt).getTime() >= weekAgo).length;
  $("#favTotal").textContent = entries.filter((e) => e.favorite).length;
  $("#recent").innerHTML = newest.length ? newest.slice(0,3).map(card).join("") : '<div class="empty"><div class="empty-icon">✎</div><h3>Your story starts here</h3><p>Your first entry doesn\'t have to be perfect. Just start writing.</p><button class="secondary" id="firstEntry">Create your first entry</button></div>';
  const query = ($("#search") ? $("#search").value : "").trim().toLowerCase();
  const sorted = newest.slice();
  if ($("#sort") && $("#sort").value === "old") sorted.reverse();
  const filtered = sorted.filter((e) => (e.title + " " + e.body + " " + e.mood).toLowerCase().includes(query));
  $("#allEntries").innerHTML = filtered.length ? filtered.map(card).join("") : empty(query ? "No entries match your search." : "No entries yet. Start with a thought, a memory, or a plan.");
  const favorites = newest.filter((e) => e.favorite);
  $("#favoriteList").innerHTML = favorites.length ? favorites.map(card).join("") : empty("Your favorite entries will appear here when you save one.");
  renderRhythm();
}
function openModal(entry, preset) {
  $("#entryForm").dataset.editing = entry ? entry.id : "";
  $("#modalTitle").textContent = entry ? "Edit your entry" : "Write an entry";
  $("#entryTitle").value = entry ? entry.title : "";
  $("#mood").value = entry ? entry.mood : "Calm";
  $("#body").value = entry ? entry.body : (preset || "");
  $("#modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#entryTitle").focus(),50);
}
function closeModal() {
  $("#modal").classList.add("hidden");
  document.body.style.overflow = "";
  $("#entryForm").reset();
  delete $("#entryForm").dataset.editing;
}
function submitEntry(event) {
  event.preventDefault();
  const title = $("#entryTitle").value.trim();
  const body = $("#body").value.trim();
  if (!title || !body) { toast("Add a title and your thoughts before saving."); return; }
  const editing = $("#entryForm").dataset.editing;
  const now = new Date().toISOString();
  if (editing) {
    const index = entries.findIndex((e) => e.id === editing);
    if (index !== -1) entries[index] = Object.assign({},entries[index],{title:title,body:body,mood:$("#mood").value,updatedAt:now});
    toast("Entry updated.");
  } else {
    const id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    entries.unshift({id:id,title:title,body:body,mood:$("#mood").value,createdAt:now,updatedAt:now,favorite:false});
    toast("Your entry has been saved.");
  }
  saveEntries();
  closeModal();
  render();
}
function handleAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const entry = entries.find((e) => e.id === button.dataset.id);
  if (!entry) return;
  if (button.dataset.action === "edit") openModal(entry);
  if (button.dataset.action === "favorite") {
    entry.favorite = !entry.favorite;
    saveEntries(); render();
    toast(entry.favorite ? "Added to favorites." : "Removed from favorites.");
  }
  if (button.dataset.action === "delete") {
    if (!confirm('Delete "' + entry.title + '"? This cannot be undone.')) return;
    entries = entries.filter((e) => e.id !== entry.id);
    saveEntries(); render(); toast("Entry deleted.");
  }
}
function showView(view) {
  const names = {dashboard:"Dashboard",entries:"My entries",favorites:"Favorites"};
  ["dashboard","entries","favorites"].forEach((name) => $("#" + name + "View").classList.toggle("hidden",name !== view));
  document.querySelectorAll(".nav[data-view]").forEach((button) => button.classList.toggle("active",button.dataset.view === view));
  $("#pageTitle").textContent = names[view] || "Dashboard";
  $("#sidebar").classList.remove("open");
}
function init() {
  let theme = "light";
  try { theme = localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); } catch {}
  setTheme(theme);
  updateDates();
  render();
  $("#newEntry").addEventListener("click",() => openModal());
  $("#writeBtn").addEventListener("click",() => openModal());
  $("#entriesNew").addEventListener("click",() => openModal());
  $("#firstEntry").addEventListener("click",() => openModal());
  $("#promptBtn").addEventListener("click",() => openModal(null,$("#promptText").textContent));
  $("#closeModal").addEventListener("click",closeModal);
  $("#entryForm").addEventListener("submit",submitEntry);
  $("#modal").addEventListener("click",(event) => { if (event.target === $("#modal")) closeModal(); });
  $("#themeToggle").addEventListener("click",toggleTheme);
  $("#topTheme").addEventListener("click",toggleTheme);
  $("#menuBtn").addEventListener("click",() => $("#sidebar").classList.toggle("open"));
  $("#viewAll").addEventListener("click",() => showView("entries"));
  $("#search").addEventListener("input",render);
  $("#sort").addEventListener("change",render);
  document.querySelectorAll(".nav[data-view]").forEach((button) => button.addEventListener("click",() => showView(button.dataset.view)));
  document.addEventListener("click",(event) => {
    if (event.target.closest("[data-action]")) handleAction(event);
    if (window.innerWidth <= 620 && !event.target.closest("#sidebar") && !event.target.closest("#menuBtn")) $("#sidebar").classList.remove("open");
  });
  document.addEventListener("keydown",(event) => {
    if (event.key === "Escape" && !$("#modal").classList.contains("hidden")) closeModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") { event.preventDefault(); openModal(); }
  });
}
document.addEventListener("DOMContentLoaded",init);