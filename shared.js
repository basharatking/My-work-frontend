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
  const icons = { success:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`, error:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>` };
  const t = document.createElement("div"); t.className=`toast ${type}`; t.innerHTML=(icons[type]||"")+_esc(msg); c.appendChild(t);
  setTimeout(() => { t.style.opacity="0"; t.style.transition="opacity .25s"; setTimeout(()=>t.remove(),260); }, dur);
}

/* ── Dropdown Nav ── */
function _initDropdowns(){
  document.querySelectorAll(".nav-dropdown").forEach(item => {
    const btn  = item.querySelector(".nav-drop-btn");
    const menu = item.querySelector(".nav-drop-menu");
    if(!btn || !menu) return;
    let timer;
    item.addEventListener("mouseenter", () => { clearTimeout(timer); menu.classList.add("open"); btn.classList.add("active"); });
    item.addEventListener("mouseleave", () => { timer = setTimeout(() => { menu.classList.remove("open"); btn.classList.remove("active"); }, 120); });
    btn.addEventListener("click", () => {
      const isOpen = menu.classList.contains("open");
      document.querySelectorAll(".nav-drop-menu.open").forEach(m => m.classList.remove("open"));
      document.querySelectorAll(".nav-drop-btn.active").forEach(b => b.classList.remove("active"));
      if(!isOpen){ menu.classList.add("open"); btn.classList.add("active"); }
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
const LOGO_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="1" width="13" height="17" rx="2.5" fill="white" fill-opacity=".95"/>
  <path d="M15 1L20 6H15V1Z" fill="white" fill-opacity=".55"/>
  <rect x="6" y="5.5" width="6" height="1.4" rx=".7" fill="#4F6EF7"/>
  <rect x="6" y="8.5" width="6" height="1.4" rx=".7" fill="#4F6EF7"/>
  <rect x="6" y="11.5" width="4" height="1.4" rx=".7" fill="#4F6EF7"/>
  <circle cx="18.5" cy="18.5" r="4.5" fill="#22C55E"/>
  <path d="M16.5 18.5L17.8 19.8L20.5 17" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ── NAV DROPDOWN DATA ── */
const NAV_DROPS = {
  convert: {
    label: "Convert PDF",
    icon: "🔄",
    tools: [
      ["pdf-to-word.html","📝","PDF to Word","Convert PDF to editable .docx"],
      ["pdf-to-excel.html","📊","PDF to Excel","Smart table extraction"],
      ["pdf-to-jpg.html","🖼️","PDF to JPG","Export pages as images"],
      ["pdf-to-pptx.html","📽️","PDF to PowerPoint","Each page = one slide"],
      ["pdf-to-text.html","📄","PDF to Text","Extract raw plain text"],
      ["word-to-pdf.html","📄","Word to PDF","Convert .docx to PDF"],
      ["excel-to-pdf.html","📋","Excel to PDF","Convert .xlsx to PDF"],
      ["jpg-to-pdf.html","📥","Image to PDF","JPG/PNG to PDF"],
    ]
  },
  merge: {
    label: "Merge PDF",
    icon: "📎",
    tools: [
      ["merge-pdf.html","📎","Merge PDF","Combine multiple PDFs into one"],
      ["rotate-pdf.html","🔄","Rotate PDF","90°, 180°, 270° rotation"],
      ["delete-pages.html","🗑️","Delete Pages","Remove unwanted pages"],
      ["reorder-pages.html","↕️","Reorder Pages","Rearrange page order"],
      ["add-page-numbers.html","🔢","Add Page Numbers","Auto number pages"],
    ]
  },
  split: {
    label: "Split PDF",
    icon: "✂️",
    tools: [
      ["split-pdf.html","✂️","Split PDF","Split into individual pages"],
      ["split-pdf.html","📄","Extract Pages","Extract a specific page range"],
      ["delete-pages.html","🗑️","Delete Pages","Remove specific pages"],
      ["pdf-to-jpg.html","🖼️","PDF to Images","Export each page as JPG"],
      ["pdf-to-text.html","📄","Extract Text","Pull text content from PDF"],
    ]
  },
  compress: {
    label: "Compress PDF",
    icon: "🗜️",
    tools: [
      ["compress-pdf.html","🗜️","Compress PDF","Reduce file size up to 90%"],
      ["optimize-pdf.html","⚡","Optimize PDF","Optimize for web/print"],
      ["repair-pdf.html","🔧","Repair PDF","Fix corrupted PDFs"],
    ]
  },
  security: {
    label: "Security",
    icon: "🔒",
    tools: [
      ["protect-pdf.html","🔐","Lock PDF","AES-256 encryption"],
      ["unlock-pdf.html","🔓","Unlock PDF","Remove password"],
      ["watermark-pdf.html","🔏","Watermark PDF","Add text watermark"],
      ["sign-pdf.html","✍️","Sign PDF","Add signature"],
    ]
  },
  ai: {
    label: "AI Tools",
    icon: "✨",
    tools: [
      ["ai-tools.html#ask","💬","Ask PDF","Chat with your document"],
      ["ai-tools.html#summary","📋","Summarize PDF","Get instant summary"],
      ["ai-tools.html#notes","📝","Generate Notes","Study notes from PDF"],
      ["ai-tools.html#quiz","❓","Quiz Generator","Auto quiz questions"],
      ["ai-tools.html#keypoints","💡","Key Points","Extract key insights"],
      ["ai-tools.html#translate","🌍","Translate PDF","Urdu, Arabic & more"],
    ]
  }
};

/* ── Mobile tools data ── */
const MOBILE_TOOLS = [
  { cat:"Convert PDF", icon:"🔄", tools:[["pdf-to-word.html","📝","PDF to Word"],["pdf-to-excel.html","📊","PDF to Excel"],["pdf-to-jpg.html","🖼️","PDF to JPG"],["pdf-to-pptx.html","📽️","PDF to PowerPoint"],["pdf-to-text.html","📄","PDF to Text"],["word-to-pdf.html","📄","Word to PDF"],["excel-to-pdf.html","📋","Excel to PDF"],["jpg-to-pdf.html","📥","Image to PDF"]] },
  { cat:"Merge & Organize", icon:"📂", tools:[["merge-pdf.html","📎","Merge PDF"],["split-pdf.html","✂️","Split PDF"],["rotate-pdf.html","🔄","Rotate PDF"],["delete-pages.html","🗑️","Delete Pages"],["reorder-pages.html","↕️","Reorder Pages"],["add-page-numbers.html","🔢","Page Numbers"]] },
  { cat:"Compress", icon:"🗜️", tools:[["compress-pdf.html","🗜️","Compress PDF"],["optimize-pdf.html","⚡","Optimize PDF"],["repair-pdf.html","🔧","Repair PDF"]] },
  { cat:"Security", icon:"🔒", tools:[["protect-pdf.html","🔐","Lock PDF"],["unlock-pdf.html","🔓","Unlock PDF"],["watermark-pdf.html","🔏","Watermark"],["sign-pdf.html","✍️","Sign PDF"]] },
  { cat:"AI Tools", icon:"✨", tools:[["ai-tools.html","💬","Ask PDF"],["ai-tools.html#summary","📋","Summarize"],["ai-tools.html#notes","📝","Notes"],["ai-tools.html#quiz","❓","Quiz Generator"],["ai-tools.html#translate","🌍","Translate"]] },
  { cat:"Business", icon:"💼", tools:[["invoice-to-excel.html","🧾","Invoice to Excel"],["bank-statement.html","🏦","Bank Statement"],["pdf-to-excel.html","📊","Smart Table Extract"]] },
];

/* ── Build dropdown HTML ── */
function _buildDrop(key) {
  const d = NAV_DROPS[key];
  const items = d.tools.map(([href, icon, label, desc]) => `
    <a href="${href}" class="drop-item">
      <span class="drop-item-icon">${icon}</span>
      <span class="drop-item-text">
        <span class="drop-item-label">${label}</span>
        <span class="drop-item-desc">${desc}</span>
      </span>
    </a>`).join("");
  return `
    <div class="nav-dropdown" data-key="${key}">
      <button class="nav-drop-btn">
        ${d.label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="nav-drop-menu">
        <div class="drop-header">${d.icon} ${d.label}</div>
        <div class="drop-items">${items}</div>
      </div>
    </div>`;
}

/* ── Build All Tools mega panel ── */
function _buildAllTools() {
  const allDropKeys = ["convert","merge","split","compress","security","ai"];
  const cols = allDropKeys.map(key => {
    const d = NAV_DROPS[key];
    return `<div class="all-tools-col">
      <div class="all-tools-col-head">${d.icon} ${d.label}</div>
      ${d.tools.map(([href,icon,label])=>`<a href="${href}" class="all-tool-link"><span>${icon}</span>${label}</a>`).join("")}
    </div>`;
  }).join("");
  return `
    <div class="nav-dropdown" data-key="all">
      <button class="nav-drop-btn nav-all-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        All Tools
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="nav-drop-menu nav-all-menu">
        <div class="all-tools-grid">${cols}</div>
        <div class="all-tools-footer">
          <span>🔒 Files deleted after processing &nbsp;·&nbsp; All 25+ tools free</span>
        </div>
      </div>
    </div>`;
}

/* ── Build Nav ── */
function buildNav(){
  const mobileAccs = MOBILE_TOOLS.map(c=>`
    <div>
      <button class="mobile-acc-btn" onclick="toggleMobileAcc(this)">
        <span>${c.icon} ${c.cat}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="mobile-acc-body">
        ${c.tools.map(([href,icon,label])=>`<a href="${href}">${icon} ${label}</a>`).join("")}
      </div>
    </div>`).join("");

  return `
<nav class="nav">
  <a href="index.html" class="nav-logo">
    <div class="nav-logo-mark">${LOGO_SVG}</div>
    <span class="nav-logo-name">Run<span>Docs</span></span>
  </a>

  <div class="nav-links">
    <a href="merge-pdf.html" class="nav-plain-link">Merge PDF</a>
    <a href="split-pdf.html" class="nav-plain-link">Split PDF</a>
    <a href="compress-pdf.html" class="nav-plain-link">Compress PDF</a>
    ${_buildDrop("convert")}
    ${_buildAllTools()}
  </div>

  <div class="nav-spacer"></div>
  <div class="nav-right">
    <button class="nav-icon-btn" id="darkBtn" onclick="toggleDark()"></button>
    <a href="contact.html" class="nav-btn-outline">Sign In</a>
    <a href="index.html#tools" class="nav-btn-primary">Get Started →</a>
  </div>
  <button class="hamburger" id="menuBtn" onclick="toggleMenu()"><span></span><span></span><span></span></button>
</nav>

<div class="drawer-overlay" id="navOverlay" onclick="toggleMenu()"></div>
<div class="mobile-nav" id="mobileNav">
  <div style="padding:.9rem 1rem .5rem;border-bottom:1px solid var(--border);margin-bottom:.4rem;display:flex;align-items:center;gap:8px">
    <div style="width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--brand),var(--brand-light));display:flex;align-items:center;justify-content:center">${LOGO_SVG}</div>
    <span style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--ink)">Run<span style="color:var(--brand)">Docs</span></span>
  </div>
  <div class="mobile-nav-sep">Navigation</div>
  <div style="padding:0 .5rem">
    <a href="index.html">🏠 Home</a>
    <a href="ai-tools.html">✨ AI Tools</a>
    <a href="index.html#pricing">💰 Pricing</a>
    <a href="contact.html">✉️ Contact</a>
  </div>
  <div class="mobile-nav-sep">All Tools</div>
  <div style="padding:0 .5rem">${mobileAccs}</div>
  <div style="padding:.75rem 1rem;display:flex;flex-direction:column;gap:.5rem;border-top:1px solid var(--border);margin-top:.5rem">
    <a href="contact.html" class="btn btn-outline btn-full" style="justify-content:center">Sign In</a>
    <a href="index.html#tools" class="btn btn-primary btn-full" style="justify-content:center">Get Started Free →</a>
  </div>
</div>`;
}

/* ── Build Footer ── */
function buildFooter(){
  return `<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo-wrap">
        <div class="footer-logo-mark">${LOGO_SVG}</div>
        <span class="footer-logo-name">Run<span>Docs</span></span>
      </div>
      <p>Professional PDF tools for everyday workflows. Fast, secure, and always free.</p>
      <div class="footer-delete-note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Files deleted after processing
      </div>
    </div>
    <div class="footer-col">
      <h4>Tools</h4>
      <a href="compress-pdf.html">Compress PDF</a>
      <a href="merge-pdf.html">Merge PDF</a>
      <a href="pdf-to-word.html">PDF to Word</a>
      <a href="pdf-to-excel.html">PDF to Excel</a>
      <a href="ai-tools.html">AI Tools</a>
      <a href="protect-pdf.html">Lock PDF</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="about.html">About Us</a>
      <a href="blog.html">Blog</a>
      <a href="contact.html">Contact Us</a>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <a href="privacy.html">Privacy Policy</a>
      <a href="terms.html">Terms of Service</a>
      <a href="about.html#security">Security</a>
      <a href="sitemap.xml">Sitemap</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} RunDocs. All rights reserved.</p>
    <div class="footer-social">
      <a href="#" class="social-btn" title="Twitter / X" aria-label="Twitter">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href="#" class="social-btn" title="Facebook" aria-label="Facebook">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href="#" class="social-btn" title="Instagram" aria-label="Instagram">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="#" class="social-btn" title="TikTok" aria-label="TikTok">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/></svg>
      </a>
      <a href="#" class="social-btn" title="Reddit" aria-label="Reddit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
      </a>
      <a href="#" class="social-btn" title="LinkedIn" aria-label="LinkedIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
    </div>
    <div class="footer-bottom-links">
      <a href="privacy.html">Privacy</a>
      <a href="terms.html">Terms</a>
      <a href="contact.html">Contact</a>
    </div>
  </div>
</footer>`;
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  const navPh=document.getElementById("nav-placeholder"); if(navPh) navPh.outerHTML=buildNav();
  const ftPh=document.getElementById("footer-placeholder"); if(ftPh) ftPh.outerHTML=buildFooter();
  setTimeout(()=>{ _setDarkIcon(); _initStickyNav(); _initScrollReveal(); initDropZones(); _initDropdowns(); },50);
});
