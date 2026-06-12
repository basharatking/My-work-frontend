/* RunDocs shared.js v3.1 — NAV FIXED (All Tools Last) */

const _CFG = window.RUNDOCS_CONFIG || {};
const API_BASE   = _CFG.API_BASE   || "";
const FREE_MB    = _CFG.FREE_LIMIT_MB || 25;
const FREE_BYTES = FREE_MB * 1024 * 1024;

/* ─────────────────────────────
   NAV ORDER (FIXED)
───────────────────────────── */
const NAV_ORDER = [
  "convert",
  "merge",
  "split",
  "compress",
  "security",
  "ai",
  "all-tools"
];

function getOrderedNavKeys() {
  return NAV_ORDER.filter(k => NAV_DROPS[k]);
}

/* ─────────────────────────────
   THEME
───────────────────────────── */
(function () {
  const s = localStorage.getItem("rundocs-theme");
  const dark = s === "dark" || (!s && matchMedia("(prefers-color-scheme:dark)").matches);
  if (dark) document.documentElement.setAttribute("data-theme", "dark");
})();

function toggleDark() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("rundocs-theme", next);
  _setDarkIcon();
}

function _setDarkIcon() {
  const btn = document.getElementById("darkBtn");
  if (!btn) return;

  const dark = document.documentElement.getAttribute("data-theme") === "dark";

  btn.title = dark ? "Light mode" : "Dark mode";
  btn.innerHTML = dark
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3"/></svg>`;
}

/* ─────────────────────────────
   NAVBAR BUILD (IMPORTANT FIX)
───────────────────────────── */
function buildNavbar() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  nav.innerHTML = "";

  getOrderedNavKeys().forEach(key => {
    if (key === "all-tools") {
      nav.innerHTML += `
        <a href="all-tools.html" class="nav-item all-tools">
          All Tools
        </a>
      `;
    } else {
      nav.innerHTML += _buildDrop(key);
    }
  });
}

/* ─────────────────────────────
   DROPDOWN BUILDER
───────────────────────────── */
function _buildDrop(key) {
  const d = NAV_DROPS[key];

  const items = d.tools.map(([href, icon, label, desc]) => `
    <a href="${href}" class="drop-item">
      <span class="drop-item-icon">${icon}</span>
      <span class="drop-item-text">
        <span class="drop-item-label">${label}</span>
        <span class="drop-item-desc">${desc}</span>
      </span>
    </a>
  `).join("");

  return `
    <div class="nav-dropdown" data-key="${key}">
      <button class="nav-drop-btn">
        ${d.label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div class="nav-drop-menu">
        ${items}
      </div>
    </div>
  `;
}

/* ─────────────────────────────
   INIT
───────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  buildNavbar();
});
