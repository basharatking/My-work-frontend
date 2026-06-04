/* RunDocs shared.js v2.0 */
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
  const icons = { success:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`, error:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>` };
  const t = document.createElement("div"); t.className=`toast ${type}`; t.innerHTML=(icons[type]||"")+_esc(msg); c.appendChild(t);
  setTimeout(() => { t.style.opacity="0"; t.style.transition="opacity .25s"; setTimeout(()=>t.remove(),260); }, dur);
}

/* ── Mega Menu ── */
function _initMegaMenu(){
  const btn = document.getElementById("toolsMenuBtn");
  const ov  = document.getElementById("megaOverlay");
  if(!btn || !ov) return;
  let open = false;
  const openM  = () => { open=true;  ov.classList.add("open");    btn.classList.add("active"); };
  const closeM = () => { open=false; ov.classList.remove("open"); btn.classList.remove("active"); };
  btn.addEventListener("click", e => { e.stopPropagation(); open ? closeM() : openM(); });
  document.addEventListener("click", e => { if(open && !ov.contains(e.target) && !btn.contains(e.target)) closeM(); });
  document.addEventListener("keydown", e => { if(e.key==="Escape" && open) closeM(); });
}
function toggleMenu(){
  const nav=document.getElementById("mobileNav"), ov=document.getElementById("navOverlay"), btn=document.getElementById("menuBtn"); if(!nav) return;
  const open=nav.classList.toggle("open");
  ov?.classList.toggle("open",open); btn?.classList.toggle("open",open);
  document.body.style.overflow = open ? "hidden" : "";
}
function toggleMobileAcc(btn){
  const body=btn.nextElementSibling, wasOpen=btn.classList.contains("open");
  document.querySelectorAll(".mobile-acc-btn.open").forEach(b=>{ b.classList.remove("open"); b.nextElementSibling.classList.remove("open"); });
  if(!wasOpen){ btn.classList.add("open"); body.classList.add("open"); }
}

/* ── Drop Zones ── */
function initDropZones(){
  document.querySelectorAll(".upload-zone").forEach(z => {
    z.addEventListener("dragover",  e => { e.preventDefault(); z.classList.add("drag-over"); });
    z.addEventListener("dragleave", ()  => z.classList.remove("drag-over"));
    z.addEventListener("drop", e => {
      e.preventDefault(); z.classList.remove("drag-over");
      const inp = z.querySelector(".file-input"); if(!inp) return;
      const dt = new DataTransfer(); Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
      inp.files = dt.files; inp.dispatchEvent(new Event("change"));
    });
  });
}

/* ── File Store ── */
const fileStore = {};
function handleFiles(tid, input){
  const files = Array.from(input.files); if(!files.length) return;
  for(const f of files){ if(f.size > FREE_BYTES){ _freemiumModal(f.name, f.size); input.value=""; return; } }
  fileStore[tid] = files;
  _renderChips(tid, files);
  if(files[0]?.type === "application/pdf") _renderPdfPreview(tid, files[0]);
  _ocrHint(tid, files[0]);
  if(tid === "split" && files[0]) loadSplitMeta(files[0]);
}
function _renderChips(tid, files){
  const el=document.getElementById("fl-"+tid); if(!el) return;
  el.innerHTML=files.map((f,i)=>`<div class="file-chip"><svg class="fc-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="fc-name">${_esc(f.name)}</span><span class="fc-size">${_bytes(f.size)}</span><button class="fc-rm" onclick="removeFile('${tid}',${i})">×</button></div>`).join("");
}
function removeFile(tid, idx){
  fileStore[tid]?.splice(idx,1); _renderChips(tid, fileStore[tid]||[]);
  if(!fileStore[tid]?.length){ document.getElementById("preview-"+tid)?.classList.remove("show"); }
}
async function _renderPdfPreview(tid, file){
  const area=document.getElementById("preview-"+tid); if(!area) return;
  try{
    const buf=await file.arrayBuffer();
    if(typeof pdfjsLib==="undefined"){ await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"); pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; }
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    const page=await pdf.getPage(1); const vp=page.getViewport({scale:1.2});
    const canvas=document.createElement("canvas"); canvas.width=vp.width; canvas.height=vp.height;
    await page.render({canvasContext:canvas.getContext("2d"),viewport:vp}).promise;
    const wrap=area.querySelector(".pdf-canvas-wrap"); if(wrap){ wrap.innerHTML=""; wrap.appendChild(canvas); }
    const hdr=area.querySelector(".pdf-preview-header strong"); if(hdr) hdr.textContent=`${file.name} — Page 1 of ${pdf.numPages}`;
    area.classList.add("show");
  }catch(e){ console.warn("Preview:",e); }
}
function _loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
async function _ocrHint(tid, file){
  const el=document.getElementById("ocr-hint-"+tid); if(!el||!file) return;
  try{ const fd=new FormData(); fd.append("file",file); const r=await fetch(`${API_BASE}/ocr-check`,{method:"POST",body:fd}); if(!r.ok) return; const d=await r.json(); if(d.is_scanned) el.innerHTML=`<div class="notice notice-amber"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span><strong>Scanned PDF detected.</strong> Text extraction may be limited.</span></div>`; }catch(_){}
}
function showProgress(tid,pct,lbl){ document.getElementById("pw-"+tid)?.classList.add("show"); const pb=document.getElementById("pb-"+tid); const pl=document.getElementById("pl-"+tid); if(pb) pb.style.width=pct+"%"; if(pl&&lbl) pl.textContent=lbl; }
function hideProgress(tid){ document.getElementById("pw-"+tid)?.classList.remove("show"); const pb=document.getElementById("pb-"+tid); if(pb) pb.style.width="0%"; }
function showResult(tid,msg,err){
  const rb=document.getElementById("rb-"+tid), mp=document.getElementById("rb-"+tid+"-msg"); if(!rb||!mp) return;
  rb.className="result-box show"+(err?" err":"");
  const ico=err?`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  mp.innerHTML=ico+" "+_esc(msg); if(!err) toast(msg,"success"); else toast(msg,"error");
}
function setBtnState(tid,loading,label){ const btn=document.getElementById("btn-"+tid); if(!btn) return; btn.disabled=loading; if(loading) btn.innerHTML=`<span class="spinner"></span> Processing…`; else if(label) btn.textContent=label; }
function showDownloadBtn(tid,blob,filename){
  document.getElementById("dl-btn-"+tid)?.remove();
  const btn=document.createElement("button"); btn.id="dl-btn-"+tid; btn.className="download-btn";
  btn.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download ${_esc(filename)}`;
  btn.onclick=()=>{ downloadBlob(blob,filename); toast("Download started!","success"); };
  const rb=document.getElementById("rb-"+tid), ab=document.getElementById("btn-"+tid);
  const after=rb||ab; if(after?.parentNode) after.parentNode.insertBefore(btn,after.nextSibling);
}
async function callAPI(endpoint,fd,tid,label){
  label=label||"Processing…"; showProgress(tid,10,"Uploading…");
  let p=10; const tick=setInterval(()=>{ p=Math.min(p+5,88); showProgress(tid,p,label); },350);
  try{
    const resp=await fetch(API_BASE+endpoint,{method:"POST",body:fd});
    clearInterval(tick); showProgress(tid,96,"Finishing…");
    if(resp.status===413) throw new Error(`File too large. Limit is ${FREE_MB} MB.`);
    if(!resp.ok){ let m="Server error — please try again."; try{ const j=await resp.json(); m=j.detail||j.message||m; }catch(_){} throw new Error(m); }
    showProgress(tid,100,"Done!"); return resp;
  }catch(e){ clearInterval(tick); throw e; }
}
function copyResult(btn){ const body=btn.closest(".ai-result")?.querySelector(".ai-result-body"); if(!body) return; navigator.clipboard.writeText(body.textContent).then(()=>{ toast("Copied!","success"); btn.textContent="✓ Copied"; setTimeout(()=>btn.textContent="Copy",1500); }); }
function downloadBlob(blob,name){ const u=URL.createObjectURL(blob); const a=Object.assign(document.createElement("a"),{href:u,download:name}); document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(u); a.remove(); },2000); }
function _freemiumModal(name,size){ document.getElementById("rundocs-modal")?.remove(); const m=document.createElement("div"); m.id="rundocs-modal"; m.className="modal-overlay"; m.innerHTML=`<div class="modal-box"><div class="modal-icon">📁</div><h3>File Too Large</h3><p><strong>${_esc(name)}</strong> is ${_bytes(size)}.</p><p>Free plan supports up to <strong>${FREE_MB} MB</strong>.</p><div class="modal-actions"><button class="btn btn-primary btn-sm" onclick="document.getElementById('rundocs-modal').remove()">Got it</button></div></div>`; document.body.appendChild(m); m.addEventListener("click",e=>{ if(e.target===m) m.remove(); }); }
async function loadSplitMeta(file){ try{ if(typeof pdfjsLib==="undefined"){ await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"); pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; } const buf=await file.arrayBuffer(); const pdf=await pdfjsLib.getDocument({data:buf}).promise; const n=pdf.numPages; const el=document.getElementById("split-page-info"); if(el){ el.textContent=`Total: ${n} pages`; el.style.display="inline"; } const es=document.getElementById("split-start"), ee=document.getElementById("split-end"); if(es) es.max=n; if(ee){ ee.value=n; ee.max=n; } }catch(_){} }
function toggleFaq(btn){ const item=btn.closest(".faq-item"); const wasOpen=item.classList.contains("open"); document.querySelectorAll(".faq-item.open").forEach(i=>i.classList.remove("open")); if(!wasOpen) item.classList.add("open"); }
function _bytes(b){ if(b<1024) return b+" B"; if(b<1048576) return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(1)+" MB"; }
function _esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ── LOGO SVG ── */
const LOGO_SVG = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="1" width="11" height="15" rx="2" fill="white" fill-opacity=".95"/>
  <rect x="5" y="5" width="5" height="1.2" rx=".6" fill="#4F6EF7"/>
  <rect x="5" y="8" width="5" height="1.2" rx=".6" fill="#4F6EF7"/>
  <rect x="5" y="11" width="3.5" height="1.2" rx=".6" fill="#4F6EF7"/>
  <path d="M12 1L16 5H12V1Z" fill="rgba(255,255,255,.55)"/>
  <circle cx="15.5" cy="15.5" r="3.5" fill="#22C55E"/>
  <path d="M14 15.5L15 16.5L17 14.5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ── MEGA MENU DATA ── */
const MEGA_TOOLS = [
  { cat:"Convert PDF", icon:"🔄", color:"#EEF1FF", tools:[["pdf-to-word.html","📝","PDF to Word"],["pdf-to-excel.html","📊","PDF to Excel"],["pdf-to-pptx.html","📽️","PDF to PowerPoint"],["pdf-to-jpg.html","🖼️","PDF to JPG"],["pdf-to-text.html","📄","PDF to Text"],["word-to-pdf.html","📄","Word to PDF"],["excel-to-pdf.html","📋","Excel to PDF"]] },
  { cat:"Organize PDF", icon:"📂", color:"#F0FDF4", tools:[["merge-pdf.html","📎","Merge PDF"],["split-pdf.html","✂️","Split PDF"],["rotate-pdf.html","🔄","Rotate PDF"],["delete-pages.html","🗑️","Delete Pages"],["reorder-pages.html","↕️","Reorder Pages"],["add-page-numbers.html","🔢","Page Numbers"]] },
  { cat:"Compress", icon:"🗜️", color:"#FFFBEB", tools:[["compress-pdf.html","🗜️","Compress PDF"],["repair-pdf.html","🔧","Repair PDF"],["optimize-pdf.html","⚡","Optimize PDF"]] },
  { cat:"Security", icon:"🔒", color:"#FEF2F2", tools:[["protect-pdf.html","🔐","Lock PDF"],["unlock-pdf.html","🔓","Unlock PDF"],["watermark-pdf.html","🔏","Watermark PDF"],["sign-pdf.html","✍️","Sign PDF"]] },
  { cat:"AI Tools", icon:"✨", color:"#EEF1FF", tools:[["ai-tools.html#ask","💬","Ask PDF"],["ai-tools.html#summary","📋","Summarize PDF"],["ai-tools.html#notes","📝","Generate Notes"],["ai-tools.html#quiz","❓","Quiz Generator"],["ai-tools.html#keypoints","💡","Key Points"],["ai-tools.html#translate","🌍","Translate PDF"]] },
  { cat:"Business", icon:"💼", color:"#F0FDF4", tools:[["invoice-to-excel.html","🧾","Invoice to Excel"],["bank-statement.html","🏦","Bank Statement"],["jpg-to-pdf.html","📥","Image to PDF"],["pdf-to-excel.html","📊","Smart Table Extract"]] }
];

function buildNav(){
  const megaCols=MEGA_TOOLS.map(c=>`<div class="mega-col"><div class="mega-col-head"><div class="mega-col-icon" style="background:${c.color}">${c.icon}</div><span class="mega-col-title">${c.cat}</span></div>${c.tools.map(([href,icon,label])=>`<a href="${href}" class="mega-tool-link"><span class="tl-icon">${icon}</span>${label}</a>`).join("")}</div>`).join("");
  const mobileAccs=MEGA_TOOLS.map(c=>`<div><button class="mobile-acc-btn" onclick="toggleMobileAcc(this)"><span>${c.icon} ${c.cat}</span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button><div class="mobile-acc-body">${c.tools.map(([href,icon,label])=>`<a href="${href}">${icon} ${label}</a>`).join("")}</div></div>`).join("");
  return `<nav class="nav">
  <a href="index.html" class="nav-logo"><div class="nav-logo-mark">${LOGO_SVG}</div><span class="nav-logo-name">Run<span>Docs</span></span></a>
  <button class="nav-tools-btn" id="toolsMenuBtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>All Tools<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>
  <div class="nav-links"><a href="ai-tools.html">✨ AI Tools</a><a href="index.html#pricing">Pricing</a><a href="contact.html">Contact</a></div>
  <div class="nav-spacer"></div>
  <div class="nav-right">
    <button class="nav-icon-btn" id="darkBtn" onclick="toggleDark()"></button>
    <a href="contact.html" class="nav-btn-outline">Sign In</a>
    <a href="index.html#tools" class="nav-btn-primary">Get Started →</a>
  </div>
  <button class="hamburger" id="menuBtn" onclick="toggleMenu()"><span></span><span></span><span></span></button>
</nav>
<div id="megaOverlay" class="mega-overlay"><div class="mega-inner">${megaCols}</div><div class="mega-footer"><span class="mega-footer-text">🔒 Files deleted after processing &nbsp;·&nbsp; All 25+ tools free</span><a href="index.html#tools" class="btn btn-primary btn-sm">View All Tools →</a></div></div>
<div class="drawer-overlay" id="navOverlay" onclick="toggleMenu()"></div>
<div class="mobile-nav" id="mobileNav">
  <div style="padding:.9rem 1rem .5rem;border-bottom:1px solid var(--border);margin-bottom:.4rem;display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--brand),var(--brand-light));display:flex;align-items:center;justify-content:center">${LOGO_SVG}</div><span style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--ink)">Run<span style="color:var(--brand)">Docs</span></span></div>
  <div class="mobile-nav-sep">Navigation</div>
  <div style="padding:0 .5rem"><a href="index.html">🏠 Home</a><a href="ai-tools.html">✨ AI Tools</a><a href="index.html#pricing">💰 Pricing</a><a href="contact.html">✉️ Contact</a></div>
  <div class="mobile-nav-sep">All Tools</div>
  <div style="padding:0 .5rem">${mobileAccs}</div>
  <div style="padding:.75rem 1rem"><a href="index.html#tools" class="btn btn-primary btn-full" style="justify-content:center">Get Started Free →</a></div>
</div>`;
}

function buildFooter(){
  return `<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo-wrap"><div class="footer-logo-mark">${LOGO_SVG}</div><span class="footer-logo-name">Run<span>Docs</span></span></div>
      <p>Professional PDF tools for everyday workflows. Fast, secure, and always free.</p>
      <div class="footer-delete-note"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Files deleted after processing</div>
    </div>
    <div class="footer-col"><h4>Tools</h4><a href="compress-pdf.html">Compress PDF</a><a href="merge-pdf.html">Merge PDF</a><a href="pdf-to-word.html">PDF to Word</a><a href="pdf-to-excel.html">PDF to Excel</a><a href="ai-tools.html">AI Tools</a><a href="protect-pdf.html">Lock PDF</a></div>
    <div class="footer-col"><h4>Company</h4><a href="about.html">About</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms</a></div>
    <div class="footer-col"><h4>Legal</h4><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Service</a><a href="about.html#security">Security</a><a href="sitemap.xml">Sitemap</a></div>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} RunDocs. All rights reserved. Files are automatically deleted after processing.</p>
    <div class="footer-bottom-links"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="contact.html">Contact</a></div>
  </div>
</footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const navPh=document.getElementById("nav-placeholder"); if(navPh) navPh.outerHTML=buildNav();
  const ftPh=document.getElementById("footer-placeholder"); if(ftPh) ftPh.outerHTML=buildFooter();
  setTimeout(()=>{ _setDarkIcon(); _initStickyNav(); _initScrollReveal(); initDropZones(); _initMegaMenu(); },50);
});
