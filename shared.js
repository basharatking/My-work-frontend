  /* RunDocs shared.js v3.0 — Improved Navigation */
const _CFG = window.RUNDOCS_CONFIG || {};
const API_BASE   = _CFG.API_BASE   || "";
const FREE_MB    = _CFG.FREE_LIMIT_MB || 25;
const FREE_BYTES = FREE_MB * 1024 * 1024;

/* ── Theme ── */
(function(){
  const s = localStorage.getItem("rundocs-theme");
  const dark = s === "dark" || (!s && matchMedia("(prefers-color-scheme:dark)").matches);
  if(dark) document.documentElement.setAttribute("data-theme","dark");
})();

function toggleDark(){
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("rundocs-theme", next);
  _setDarkIcon();
}

function _setDarkIcon(){
  const btn = document.getElementById("darkBtn"); if(!btn) return;
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.title = dark ? "Light mode" : "Dark mode";
  btn.innerHTML = dark
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

function _initStickyNav(){
  const nav = document.querySelector(".nav"); if(!nav) return;
  const fn = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", fn, { passive: true }); fn();
}

function _initScrollReveal(){
  if(!("IntersectionObserver" in window)){ document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible")); return; }
  const io = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); } }); }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ── Toast ── */
function toast(msg, type="success", dur=3400){
  let c = document.getElementById("toast-container");
  if(!c){ c = document.createElement("div"); c.id="toast-container"; c.className="toast-container"; document.body.appendChild(c); }
  const icons = {
    success:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
  };
  const t = document.createElement("div");
  t.className=`toast ${type}`;
  t.innerHTML=(icons[type]||"")+_esc(msg);
  c.appendChild(t);

  setTimeout(() => {
    t.style.opacity="0";
    t.style.transition="opacity .25s";
    setTimeout(()=>t.remove(),260);
  }, dur);
}

/* ── Dropdown Nav ── */
function _initDropdowns(){
  document.querySelectorAll(".nav-dropdown").forEach(item => {
    const btn  = item.querySelector(".nav-drop-btn");
    const menu = item.querySelector(".nav-drop-menu");
    if(!btn || !menu) return;

    let timer;
    item.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      menu.classList.add("open");
      btn.classList.add("active");
    });

    item.addEventListener("mouseleave", () => {
      timer = setTimeout(() => {
        menu.classList.remove("open");
        btn.classList.remove("active");
      }, 120);
    });

    btn.addEventListener("click", () => {
      const isOpen = menu.classList.contains("open");
      document.querySelectorAll(".nav-drop-menu.open").forEach(m => m.classList.remove("open"));
      document.querySelectorAll(".nav-drop-btn.active").forEach(b => b.classList.remove("active"));
      if(!isOpen){
        menu.classList.add("open");
        btn.classList.add("active");
      }
    });
  });

  document.addEventListener("click", e => {
    if(!e.target.closest(".nav-dropdown")){
      document.querySelectorAll(".nav-drop-menu.open").forEach(m => m.classList.remove("open"));
      document.querySelectorAll(".nav-drop-btn.active").forEach(b => b.classList.remove("active"));
    }
  });

  document.addEventListener("keydown", e => {
    if(e.key === "Escape"){
      document.querySelectorAll(".nav-drop-menu.open").forEach(m => m.classList.remove("open"));
      document.querySelectorAll(".nav-drop-btn.active").forEach(b => b.classList.remove("active"));
    }
  });
}

/* ── Mobile Menu ── */
function toggleMenu(){
  const nav=document.getElementById("mobileNav"),
        ov=document.getElementById("navOverlay"),
        btn=document.getElementById("menuBtn");
  if(!nav) return;

  const open=nav.classList.toggle("open");
  ov?.classList.toggle("open",open);
  btn?.classList.toggle("open",open);
  document.body.style.overflow = open ? "hidden" : "";
}

function toggleMobileAcc(btn){
  const body=btn.nextElementSibling,
        wasOpen=btn.classList.contains("open");

  document.querySelectorAll(".mobile-acc-btn.open").forEach(b=>{
    b.classList.remove("open");
    b.nextElementSibling.classList.remove("open");
  });

  if(!wasOpen){
    btn.classList.add("open");
    body.classList.add("open");
  }
}

/* ── Drop Zones ── */
function initDropZones(){
  document.querySelectorAll(".upload-zone").forEach(z => {
    z.addEventListener("dragover", e => {
      e.preventDefault();
      z.classList.add("drag-over");
    });

    z.addEventListener("dragleave", () => z.classList.remove("drag-over"));

    z.addEventListener("drop", e => {
      e.preventDefault();
      z.classList.remove("drag-over");
      const inp = z.querySelector(".file-input");
      if(!inp) return;
      const dt = new DataTransfer();
      Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
      inp.files = dt.files;
      inp.dispatchEvent(new Event("change"));
    });
  });
}

/* ── File Store ── */
const fileStore = {};

function handleFiles(tid, input){
  const files = Array.from(input.files);
  if(!files.length) return;

  for(const f of files){
    if(f.size > FREE_BYTES){
      _freemiumModal(f.name, f.size);
      input.value="";
      return;
    }
  }

  fileStore[tid] = files;
  _renderChips(tid, files);
  if(files[0]?.type === "application/pdf") _renderPdfPreview(tid, files[0]);
  _ocrHint(tid, files[0]);
  if(tid === "split" && files[0]) loadSplitMeta(files[0]);
}

function _renderChips(tid, files){
  const el=document.getElementById("fl-"+tid);
  if(!el) return;

  el.innerHTML=files.map((f,i)=>`
    <div class="file-chip">
      <svg class="fc-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="fc-name">${_esc(f.name)}</span>
      <span class="fc-size">${_bytes(f.size)}</span>
      <button class="fc-rm" onclick="removeFile('${tid}',${i})">×</button>
    </div>
  `).join("");
}

function removeFile(tid, idx){
  fileStore[tid]?.splice(idx,1);
  _renderChips(tid, fileStore[tid]||[]);
}

function _bytes(b){
  if(b<1024) return b+" B";
  if(b<1048576) return (b/1024).toFixed(1)+" KB";
  return (b/1048576).toFixed(1)+" MB";
}

function _esc(s){
  return String(s).replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
                                      }         
