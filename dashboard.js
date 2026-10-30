const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const themeToggle = $("#theme-toggle");
const sidebar = $("#sidebar");
const sidebarBackdrop = $("#sidebar-backdrop");
const mobileMenu = $("#mobile-menu-btn");
const entryModal = $("#entry-modal");
const viewModal = $("#view-modal");
const toast = $("#toast");

let activeFilter = "All";
let searchQuery = "";
let toastTimer;
let entries = [];

try {
  const stored = localStorage.getItem("max-journal-entries");
  entries = stored ? JSON.parse(stored) : [];
  if (!Array.isArray(entries)) entries = [];
} catch {
  entries = [];
}

function saveEntries() {
  try { localStorage.setItem("max-journal-entries", JSON.stringify(entries)); }
  catch { showToast("Your browser could not save this entry. Check available storage."); }
}

function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("max-journal-theme", theme); } catch {}
}

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("max-journal-theme") || "dark"; } catch {}
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

$("#current-date-display").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short", month: "short", day: "numeric", year: "numeric"
}).format(new Date());

function openSidebar() {
  sidebar.classList.add("open");
  sidebarBackdrop.classList.add("visible");
  mobileMenu.setAttribute("aria-expanded", "true");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.remove("visible");
  mobileMenu.setAttribute("aria-expanded", "false");
}
mobileMenu.addEventListener("click", openSidebar);
$("#close-sidebar").addEventListener("click", closeSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);
$$(".nav-link").forEach(link => link.addEventListener("click", closeSidebar));

function openEntryModal(category = "Trading") {
  $("#entry-category").value = category;
  updateMetricLabel();
  $("#new-entry-form").reset();
  $("#entry-category").value = category;
  updateMetricLabel();
  entryModal.classList.remove("hidden");
  entryModal.classList.add("flex");
  $("#entry-title").focus();
}
function closeEntryModal() {
  entryModal.classList.add("hidden");
  entryModal.classList.remove("flex");
  $("#new-entry-form").reset();
}
function openViewModal() {
  viewModal.classList.remove("hidden");
  viewModal.classList.add("flex");
}
function closeViewModal() {
  viewModal.classList.add("hidden");
  viewModal.classList.remove("flex");
}

$("#open-new-entry-modal").addEventListener("click", () => openEntryModal());
$("#empty-create-entry").addEventListener("click", () => openEntryModal());
$("#close-entry-modal").addEventListener("click", closeEntryModal);
$("#cancel-entry").addEventListener("click", closeEntryModal);
$("#close-view-modal").addEventListener("click", closeViewModal);
$("#close-view-bottom").addEventListener("click", closeViewModal);
[entryModal, viewModal].forEach(modal => modal.addEventListener("click", event => {
  if (event.target === modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}));

function updateMetricLabel() {
  const category = $("#entry-category").value;
  const labels = {
    Trading: "Trade result / risk-reward",
    Expense: "Amount / expense type",
    Personal: "Mood / focus (optional)"
  };
  $("#metric-label").textContent = labels[category];
  $("#entry-metric").placeholder = category === "Trading"
    ? "Example: +$120 | 2R"
    : category === "Expense" ? "Example: GHS 150 | Transport" : "Example: Calm | Good focus";
}
$("#entry-category").addEventListener("change", updateMetricLabel);

$("#new-entry-form").addEventListener("submit", event => {
  event.preventDefault();
  const category = $("#entry-category").value;
  const title = $("#entry-title").value.trim();
  const content = $("#entry-content").value.trim();
  if (!title || !content) return;

  const tags = $("#entry-tags").value.split(",").map(tag => tag.trim()).filter(Boolean).slice(0, 12);
  entries.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    category,
    title,
    metric: $("#entry-metric").value.trim(),
    content,
    tags,
    createdAt: new Date().toISOString()
  });
  saveEntries();
  closeEntryModal();
  activeFilter = "All";
  searchQuery = "";
  $("#global-search-input").value = "";
  updateFilterButtons();
  renderEntries();
  showToast("Your entry has been saved on this device.");
});

function updateFilterButtons() {
  $$(".filter-tab").forEach(button => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}
$$(".filter-tab").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  updateFilterButtons();
  renderEntries();
}));

$$("[data-journal]").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.journal;
  updateFilterButtons();
  renderEntries();
  $("#entries").scrollIntoView({ behavior: "smooth", block: "start" });
}));

$("#global-search-input").addEventListener("input", event => {
  searchQuery = event.target.value.trim().toLowerCase();
  renderEntries();
});

function makeTag(tag) {
  const span = document.createElement("span");
  span.className = "entry-tag";
  span.textContent = "#" + tag;
  return span;
}

function viewEntry(id) {
  const entry = entries.find(item => item.id === id);
  if (!entry) return;
  $("#view-category").textContent = entry.category + " journal";
  $("#view-title").textContent = entry.title;
  $("#view-date").textContent = formatDate(entry.createdAt);
  $("#view-metric").textContent = entry.metric || "";
  $("#view-content").textContent = entry.content;
  const tags = $("#view-tags");
  tags.replaceChildren();
  (entry.tags || []).forEach(tag => tags.append(makeTag(tag)));
  openViewModal();
}

function removeEntry(id) {
  const entry = entries.find(item => item.id === id);
  if (!entry) return;
  if (!window.confirm("Delete this journal entry? This cannot be undone.")) return;
  entries = entries.filter(item => item.id !== id);
  saveEntries();
  renderEntries();
  showToast("Entry deleted.");
}

function renderEntries() {
  const container = $("#entries-container");
  const empty = $("#empty-state-container");
  const filtered = entries.filter(entry => {
    const categoryMatch = activeFilter === "All" || entry.category === activeFilter;
    const searchable = [entry.title, entry.content, entry.metric || "", ...(entry.tags || [])].join(" ").toLowerCase();
    return categoryMatch && (!searchQuery || searchable.includes(searchQuery));
  });

  $("#metric-total-entries").textContent = entries.length;
  $("#metric-active-journals").textContent = new Set(entries.map(entry => entry.category)).size;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  $("#metric-week-entries").textContent = entries.filter(entry => new Date(entry.createdAt).getTime() >= weekAgo).length;
  $("#user-activity-subtitle").textContent = entries.length
    ? entries.length + (entries.length === 1 ? " entry saved across your journals." : " entries saved across your journals.")
    : "A clear view of your journaling activity.";

  $("#trading-count").textContent = entries.filter(entry => entry.category === "Trading").length + " entries";
  $("#expense-count").textContent = entries.filter(entry => entry.category === "Expense").length + " entries";
  $("#personal-count").textContent = entries.filter(entry => entry.category === "Personal").length + " entries";

  container.replaceChildren();
  if (!filtered.length) {
    container.classList.add("hidden");
    empty.classList.remove("hidden");
    const heading = empty.querySelector("h3");
    const description = empty.querySelector("p");
    if (entries.length || searchQuery || activeFilter !== "All") {
      heading.textContent = "No matching entries";
      description.textContent = "Try another category or search term, or create a new journal entry.";
    } else {
      heading.textContent = "Your story starts here";
      description.textContent = "You haven't created any entries yet. Start with a journal above or create your first entry.";
    }
    return;
  }

  container.classList.remove("hidden");
  empty.classList.add("hidden");
  filtered.forEach(entry => {
    const row = document.createElement("article");
    row.className = "entry-row";

    const details = document.createElement("div");
    details.className = "min-w-0 flex-1";
    const meta = document.createElement("div");
    meta.className = "mb-2 flex flex-wrap items-center gap-2";
    const badge = document.createElement("span");
    badge.className = "entry-category category-" + entry.category.toLowerCase();
    badge.textContent = entry.category;
    const date = document.createElement("span");
    date.className = "text-[10px] text-slate-400";
    date.textContent = formatDate(entry.createdAt);
    meta.append(badge, date);

    const title = document.createElement("h3");
    title.className = "text-sm font-semibold text-slate-900 dark:text-slate-100";
    title.textContent = entry.title;
    const preview = document.createElement("p");
    preview.className = "mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400";
    preview.textContent = entry.content;
    const tagList = document.createElement("div");
    tagList.className = "mt-2 flex flex-wrap gap-1.5";
    (entry.tags || []).forEach(tag => tagList.append(makeTag(tag)));
    details.append(meta, title, preview, tagList);

    const actions = document.createElement("div");
    actions.className = "entry-actions flex items-center gap-2";
    if (entry.metric) {
      const metric = document.createElement("span");
      metric.className = "mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200";
      metric.textContent = entry.metric;
      actions.append(metric);
    }
    const actionRow = document.createElement("div");
    actionRow.className = "flex items-center gap-2";
    const view = document.createElement("button");
    view.className = "entry-action";
    view.type = "button";
    view.textContent = "View entry";
    view.addEventListener("click", () => viewEntry(entry.id));
    const remove = document.createElement("button");
    remove.className = "entry-action";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => removeEntry(entry.id));
    actionRow.append(view, remove);
    actions.append(actionRow);
    row.append(details, actions);
    container.append(row);
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeEntryModal();
    closeViewModal();
    closeSidebar();
  }
});

renderEntries();
updateFilterButtons();
