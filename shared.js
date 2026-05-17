/* FallPDF shared.js v2.0 */
const _CFG = window.CATCHPDF_CONFIG || {};
const API_BASE   = _CFG.API_BASE   || "";
const FREE_MB    = _CFG.FREE_LIMIT_MB || 25;
const FREE_BYTES = FREE_MB * 1024 * 1024;

/* ── Theme ─────────────────────────────────────── */
(function(){
  const s = localStorage.getItem("fallpdf-theme");
  const dark = s === "dark" || (!s && matchMedia("(prefers-color-scheme:dark)").matches);
  if(dark) document.documentElement.setAttribute("data-theme","dark");
})();
function toggleDark(){
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("fallpdf-theme", next);
  _setDarkIcon();
}
function _setDarkIcon(){
  const btn = document.getElementById("darkBtn"); if(!btn) return;
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.title = dark ? "Light mode" : "Dark mode";
  btn.innerHTML = dark
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

/* ── Sticky Navbar on Scroll ───────────────────── */
function _initStickyNav(){
  const nav = document.querySelector(".nav");
  if(!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Scroll Reveal ─────────────────────────────── */
function _initScrollReveal(){
  if(!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ── Toast ─────────────────────────────────────── */
function toast(msg, type="success", duration=3500){
  let c = document.getElementById("toast-container");
  if(!c){ c = document.createElement("div"); c.id="toast-container"; c.className="toast-container"; document.body.appendChild(c); }
  const icons = {
    success:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = (icons[type]||"") + _esc(msg);
  c.appendChild(t);
  setTimeout(() => { t.style.animation="toastOut .3s ease forwards"; setTimeout(()=>t.remove(),300); }, duration);
}

/* ── Mobile Menu ────────────────────────────────── */
function toggleMenu(){
  const nav = document.getElementById("mobileNav");
  const ov  = document.getElementById("navOverlay");
  const btn = document.getElementById("menuBtn");
  if(!nav) return;
  const open = nav.classList.toggle("open");
  if(ov)  ov.classList.toggle("open", open);
  if(btn) btn.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
}
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){
    const n = document.getElementById("mobileNav");
    if(n?.classList.contains("open")) toggleMenu();
    document.querySelectorAll(".modal-overlay").forEach(m => m.remove());
  }
});

/* ── Drop Zones ─────────────────────────────────── */
function initDropZones(){
  document.querySelectorAll(".upload-zone").forEach(zone => {
    zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("drag-over"); });
    zone.addEventListener("dragleave", ()  => zone.classList.remove("drag-over"));
    zone.addEventListener("drop", e => {
      e.preventDefault(); zone.classList.remove("drag-over");
      const inp = zone.querySelector(".file-input"); if(!inp) return;
      const dt = new DataTransfer();
      Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
      inp.files = dt.files; inp.dispatchEvent(new Event("change"));
    });
  });
}

/* ── File Store ─────────────────────────────────── */
const fileStore = {};
function handleFiles(tid, input){
  const files = Array.from(input.files); if(!files.length) return;
  for(const f of files){
    if(f.size > FREE_BYTES){ _freemiumModal(f.name, f.size); input.value=""; return; }
  }
  fileStore[tid] = files;
  _renderChips(tid, files);
  if(files[0]?.type === "application/pdf") _renderPdfPreview(tid, files[0]);
  _ocrHint(tid, files[0]);
  if(tid === "split" && files[0]) loadSplitMeta(files[0]);
}
function _renderChips(tid, files){
  const el = document.getElementById("fl-"+tid); if(!el) return;
  el.innerHTML = files.map((f,i) => `
    <div class="file-chip">
      <svg class="fc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span class="fc-name">${_esc(f.name)}</span>
      <span class="fc-size">${_bytes(f.size)}</span>
      <button class="fc-rm" onclick="removeFile('${tid}',${i})" title="Remove">×</button>
    </div>`).join("");
}
function removeFile(tid, idx){
  fileStore[tid]?.splice(idx, 1);
  _renderChips(tid, fileStore[tid] || []);
  if(!fileStore[tid]?.length){ const pa = document.getElementById("preview-"+tid); if(pa) pa.classList.remove("show"); }
}

/* ── PDF Preview ────────────────────────────────── */
async function _renderPdfPreview(tid, file){
  const area = document.getElementById("preview-"+tid); if(!area) return;
  try {
    const buf = await file.arrayBuffer();
    if(typeof pdfjsLib === "undefined"){
      await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdf    = await pdfjsLib.getDocument({data:buf}).promise;
    const page   = await pdf.getPage(1);
    const vp     = page.getViewport({scale:1.2});
    const canvas = document.createElement("canvas");
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({canvasContext:canvas.getContext("2d"), viewport:vp}).promise;
    const wrap = area.querySelector(".pdf-canvas-wrap");
    if(wrap){ wrap.innerHTML=""; wrap.appendChild(canvas); }
    const hdr = area.querySelector(".pdf-preview-header strong");
    if(hdr) hdr.textContent = `${file.name} — Page 1 of ${pdf.numPages}`;
    area.classList.add("show");
  } catch(e){ console.warn("Preview failed:", e); }
}
function _loadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
}

/* ── OCR Hint ───────────────────────────────────── */
async function _ocrHint(tid, file){
  const el = document.getElementById("ocr-hint-"+tid); if(!el || !file) return;
  try {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch(`${API_BASE}/ocr-check`, {method:"POST", body:fd});
    if(!r.ok) return;
    const d = await r.json();
    if(d.is_scanned){
      el.innerHTML = `<div class="notice notice-amber"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span><strong>Scanned PDF detected.</strong> Text extraction may be limited.</span></div>`;
      el.style.display = "block";
    }
  } catch(_){}
}

/* ── Progress ───────────────────────────────────── */
function showProgress(tid, pct, label){
  const pw = document.getElementById("pw-"+tid);
  const pb = document.getElementById("pb-"+tid);
  const pl = document.getElementById("pl-"+tid);
  const pp = document.getElementById("pp-"+tid);
  pw?.classList.add("show");
  if(pb) pb.style.width = pct + "%";
  if(pl && label) pl.textContent = label;
  if(pp) pp.textContent = pct + "%";
}
function hideProgress(tid){
  const pw = document.getElementById("pw-"+tid);
  const pb = document.getElementById("pb-"+tid);
  if(pw) pw.classList.remove("show");
  if(pb) pb.style.width = "0%";
}
function showResult(tid, msg, err){
  const rb  = document.getElementById("rb-"+tid);
  const mp  = document.getElementById("rb-"+tid+"-msg");
  if(!rb || !mp) return;
  rb.className = "result-box show" + (err ? " err" : "");
  const ico = err
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  mp.innerHTML = ico + " " + _esc(msg);
  if(!err) toast(msg, "success"); else toast(msg, "error");
}
function setBtnState(tid, loading, label){
  const btn = document.getElementById("btn-"+tid); if(!btn) return;
  btn.disabled = loading;
  if(loading) btn.innerHTML = `<span class="spinner"></span> Processing…`;
  else if(label) btn.textContent = label;
}

/* ── Download Button ────────────────────────────── */
function showDownloadBtn(tid, blob, filename, meta={}){
  document.getElementById("dl-btn-"+tid)?.remove();
  try {
    const url = URL.createObjectURL(blob);
    sessionStorage.setItem("fallpdf_dl_url",  url);
    sessionStorage.setItem("fallpdf_dl_name", filename);
    sessionStorage.setItem("fallpdf_dl_size", _bytes(blob.size));
    sessionStorage.setItem("fallpdf_dl_tool", tid);
    sessionStorage.setItem("fallpdf_dl_meta", JSON.stringify(meta));
  } catch(_){}
  const btn = document.createElement("button");
  btn.id = "dl-btn-"+tid; btn.className = "download-btn";
  btn.innerHTML = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download ${_esc(filename)}`;
  btn.onclick = () => { downloadBlob(blob, filename); toast("Download started!", "success"); };
  const rb = document.getElementById("rb-"+tid);
  const ab = document.getElementById("btn-"+tid);
  const after = rb || ab;
  if(after?.parentNode) after.parentNode.insertBefore(btn, after.nextSibling);
}

/* ── API Call ───────────────────────────────────── */
async function callAPI(endpoint, fd, tid, label){
  label = label || "Processing…";
  showProgress(tid, 10, "Uploading…");
  let p = 10;
  const tick = setInterval(() => { p = Math.min(p+5, 88); showProgress(tid, p, label); }, 350);
  try {
    const resp = await fetch(API_BASE + endpoint, {method:"POST", body:fd});
    clearInterval(tick); showProgress(tid, 96, "Finishing…");
    if(resp.status === 413) throw new Error(`File too large. Limit is ${FREE_MB} MB.`);
    if(!resp.ok){
      let m = "Server error — please try again.";
      try { const j = await resp.json(); m = j.detail || j.message || m; } catch(_){}
      throw new Error(m);
    }
    showProgress(tid, 100, "Done!");
    return resp;
  } catch(e){ clearInterval(tick); throw e; }
}

/* ── Copy ───────────────────────────────────────── */
function copyResult(btn){
  const body = btn.closest(".ai-result")?.querySelector(".ai-result-body");
  if(!body) return;
  navigator.clipboard.writeText(body.textContent).then(() => {
    toast("Copied to clipboard!", "success");
    btn.textContent = "✓ Copied!";
    setTimeout(() => btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`, 1500);
  });
}

function downloadBlob(blob, name){
  const u = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {href:u, download:name});
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 2000);
}

/* ── Freemium Modal ─────────────────────────────── */
function _freemiumModal(name, size){
  document.getElementById("fallpdf-modal")?.remove();
  const m = document.createElement("div"); m.id="fallpdf-modal"; m.className="modal-overlay";
  m.innerHTML = `<div class="modal-box"><div class="modal-icon">📁</div><h3>File Too Large</h3><p><strong>${_esc(name)}</strong> is ${_bytes(size)}.</p><p>Free plan supports files up to <strong>${FREE_MB} MB</strong>.</p><div class="modal-actions"><button class="btn btn-primary btn-sm" onclick="document.getElementById('fallpdf-modal').remove()">Got it</button></div></div>`;
  document.body.appendChild(m);
  m.addEventListener("click", e => { if(e.target===m) m.remove(); });
}

/* ── Split Meta ─────────────────────────────────── */
async function loadSplitMeta(file){
  try {
    if(typeof pdfjsLib === "undefined"){
      await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:buf}).promise;
    const n   = pdf.numPages;
    const el  = document.getElementById("split-page-info");
    if(el){ el.textContent = `Total: ${n} pages`; el.style.display = "inline-flex"; }
    const es = document.getElementById("split-start"), ee = document.getElementById("split-end");
    if(es) es.max = n;
    if(ee){ ee.value = n; ee.max = n; }
  } catch(_){}
}

/* ── Logo SVG ───────────────────────────────────── */
const NAV_LOGO_SVG = `<div class="nav-logo-mark">
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2h8l4 4v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="white" fill-opacity=".9"/>
    <path d="M11 2v4h4" stroke="rgba(255,255,255,.55)" stroke-width="1" fill="none"/>
    <path d="M5.5 9h7M5.5 11.5h5" stroke="#2563EB" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
</div>`;

/* ── Nav HTML ───────────────────────────────────── */
function buildNav(){
  const tools = [
    ["merge-pdf.html","📎","Merge PDF"],["split-pdf.html","✂️","Split PDF"],
    ["compress-pdf.html","🗜️","Compress PDF"],["rotate-pdf.html","🔄","Rotate PDF"],
    ["watermark-pdf.html","🔏","Watermark PDF"],["pdf-to-word.html","📝","PDF to Word"],
    ["pdf-to-excel.html","📊","PDF to Excel"],["pdf-to-jpg.html","🖼️","PDF to JPG"],
    ["jpg-to-pdf.html","📥","Image to PDF"],["unlock-pdf.html","🔓","Unlock PDF"],
    ["protect-pdf.html","🔐","Protect PDF"],["pdf-to-pptx.html","📽️","PDF to PowerPoint"],
    ["pdf-to-text.html","📄","PDF to Text"],["add-page-numbers.html","🔢","Page Numbers"],
    ["ai-tools.html","✨","Smart Tools"],
  ];
  return `<nav class="nav">
  <a href="index.html" class="nav-logo">${NAV_LOGO_SVG}<span class="nav-logo-name">Fall<span>PDF</span></span></a>
  <div class="nav-center">
    <a href="index.html">Home</a>
    <a href="index.html#tools">Tools</a>
    <a href="index.html#pricing">Pricing</a>
    <a href="blog.html">Blog</a>
    <a href="contact.html">Contact</a>
  </div>
  <div class="nav-right">
    <span class="nav-trust">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Secure &amp; Free
    </span>
    <button class="nav-icon-btn" id="darkBtn" onclick="toggleDark()"></button>
    <a href="index.html#tools" class="nav-cta">Get Started</a>
  </div>
  <button class="hamburger" id="menuBtn" onclick="toggleMenu()"><span></span><span></span><span></span></button>
</nav>
<div class="drawer-overlay" id="navOverlay" onclick="toggleMenu()"></div>
<div class="mobile-nav" id="mobileNav">
  <div class="mobile-nav-hdr">
    <span style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--ink)">Fall<span style="color:var(--brand)">PDF</span></span>
  </div>
  <div class="mobile-nav-sep">Navigation</div>
  <a href="index.html" onclick="toggleMenu()">🏠 Home</a>
  <a href="index.html#tools" onclick="toggleMenu()">🛠️ All Tools</a>
  <a href="index.html#pricing" onclick="toggleMenu()">💰 Pricing</a>
  <a href="blog.html" onclick="toggleMenu()">📰 Blog</a>
  <a href="contact.html" onclick="toggleMenu()">✉️ Contact</a>
  <div class="mobile-nav-sep">PDF Tools</div>
  ${tools.filter(t=>!t[0].includes("ai-")).map(([href,icon,label]) => `<a href="${href}" onclick="toggleMenu()">${icon} ${label}</a>`).join("")}
  <div class="mobile-nav-sep">Smart Tools</div>
  <a href="ai-tools.html" onclick="toggleMenu()">✨ Smart Tools</a>
  <a href="index.html#tools" onclick="toggleMenu()" class="mobile-nav-cta">Browse All Tools →</a>
</div>`;
}

/* ── Footer HTML ────────────────────────────────── */
function buildFooter(){
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="footer-brand-logo">
        <div class="mark">${NAV_LOGO_SVG}</div>
        <span class="name">Fall<span>PDF</span></span>
      </div>
      <p>Professional PDF tools for everyone. Secure, fast, and completely free to use.</p>
      <div class="footer-badges">
        <div class="footer-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Files deleted after processing</div>
        <div class="footer-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 256-bit SSL encryption</div>
        <div class="footer-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> No account required</div>
      </div>
    </div>
    <div class="footer-col">
      <h4>Organize</h4>
      <a href="merge-pdf.html">Merge PDF</a>
      <a href="split-pdf.html">Split PDF</a>
      <a href="compress-pdf.html">Compress PDF</a>
      <a href="rotate-pdf.html">Rotate PDF</a>
      <a href="add-page-numbers.html">Page Numbers</a>
    </div>
    <div class="footer-col">
      <h4>Convert</h4>
      <a href="pdf-to-word.html">PDF to Word</a>
      <a href="pdf-to-excel.html">PDF to Excel</a>
      <a href="pdf-to-jpg.html">PDF to JPG</a>
      <a href="jpg-to-pdf.html">Image to PDF</a>
      <a href="pdf-to-pptx.html">PDF to PowerPoint</a>
      <a href="pdf-to-text.html">PDF to Text</a>
    </div>
    <div class="footer-col">
      <h4>Security</h4>
      <a href="protect-pdf.html">Protect PDF</a>
      <a href="unlock-pdf.html">Unlock PDF</a>
      <a href="watermark-pdf.html">Watermark PDF</a>
      <h4 style="margin-top:1.2rem">Smart</h4>
      <a href="ai-tools.html">Smart Tools</a>
      <a href="ai-tools.html#summary">Summarize PDF</a>
      <a href="ai-tools.html#ask">Ask PDF</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="about.html">About</a>
      <a href="blog.html">Blog</a>
      <a href="contact.html">Contact</a>
      <a href="about.html#privacy">Privacy Policy</a>
      <a href="about.html#terms">Terms of Service</a>
      <h4 style="margin-top:1.2rem">Follow</h4>
      <div class="footer-social">
        <a href="#" title="Twitter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
        </a>
        <a href="#" title="LinkedIn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} FallPDF. All rights reserved. Built for everyone.</p>
    <div class="footer-bottom-links">
      <a href="about.html#privacy">Privacy</a>
      <a href="about.html#terms">Terms</a>
      <a href="contact.html">Contact</a>
      <a href="sitemap.xml">Sitemap</a>
    </div>
  </div>
</footer>`;
}

/* ── Utils ──────────────────────────────────────── */
function _bytes(b){ if(b<1024) return b+" B"; if(b<1048576) return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(1)+" MB"; }
function _esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ── Init ───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  _setDarkIcon();
  initDropZones();
  _initStickyNav();
  _initScrollReveal();
  const navPh = document.getElementById("nav-placeholder");
  if(navPh) navPh.outerHTML = buildNav();
  const footerPh = document.getElementById("footer-placeholder");
  if(footerPh) footerPh.outerHTML = buildFooter();
  // Re-init after nav injected
  setTimeout(() => { _setDarkIcon(); _initStickyNav(); initDropZones(); }, 50);
});
