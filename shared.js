/* RunDocs shared.js v3.1 — Real Tabler Icons (replaces emoji) */
const _CFG = window.RUNDOCS_CONFIG || {};
const API_BASE   = _CFG.API_BASE   || "";
const FREE_MB    = _CFG.FREE_LIMIT_MB || 25;
const FREE_BYTES = FREE_MB * 1024 * 1024;

/* ── Real Icon Map (Tabler Icons — replaces all emoji) ── */
const TOOL_ICONS = {
  "compress-pdf.html": "ti-zoom-out",
  "merge-pdf.html": "ti-stack-2",
  "split-pdf.html": "ti-cut",
  "pdf-to-word.html": "ti-file-word",
  "pdf-to-excel.html": "ti-file-spreadsheet",
  "pdf-to-jpg.html": "ti-photo",
  "pdf-to-pptx.html": "ti-presentation",
  "pdf-to-text.html": "ti-file-text",
  "word-to-pdf.html": "ti-file-type-doc",
  "excel-to-pdf.html": "ti-file-type-xls",
  "jpg-to-pdf.html": "ti-photo-plus",
  "rotate-pdf.html": "ti-rotate-clockwise",
  "delete-pages.html": "ti-trash",
  "reorder-pages.html": "ti-arrows-sort",
  "add-page-numbers.html": "ti-number-123",
  "protect-pdf.html": "ti-lock",
  "unlock-pdf.html": "ti-lock-open",
  "watermark-pdf.html": "ti-stamp",
  "sign-pdf.html": "ti-signature",
  "repair-pdf.html": "ti-tool",
  "optimize-pdf.html": "ti-bolt",
  "bank-statement.html": "ti-building-bank",
  "invoice-to-excel.html": "ti-receipt",
  "ai-tools.html": "ti-sparkles",
};

/* Icon for the small AI-feature cards on ai-tools.html, keyed by element id */
const AI_CARD_ICONS = {
  summary: "ti-clipboard-text",
  notes: "ti-notes",
  quiz: "ti-help-circle",
  keypoints: "ti-bulb",
  translate: "ti-language",
  ask: "ti-message-circle-2",
};

function _iconHTML(name, extraClass) {
  return `<i class="ti ${name}${extraClass ? " " + extraClass : ""}" aria-hidden="true"></i>`;
}

/* Replace emoji glyphs inside known icon containers with real Tabler icons,
   based on the current page filename or explicit data-tool attributes. */
function _applyRealIcons() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const iconName = TOOL_ICONS[path];

  if (iconName) {
    const heroIcon = document.querySelector(".tool-icon-wrap");
    if (heroIcon) heroIcon.innerHTML = _iconHTML(iconName);

    const uzIcon = document.querySelector(".uz-icon");
    if (uzIcon) uzIcon.innerHTML = _iconHTML(iconName);
  }

  // ai-tools.html small card icons
  Object.keys(AI_CARD_ICONS).forEach(key => {
    const card = document.getElementById(key);
    if (!card) return;
    const iconEl = card.querySelector(".ai-card-icon");
    if (iconEl) iconEl.innerHTML = _iconHTML(AI_CARD_ICONS[key]);
  });

  // Homepage tool-card-link icons (.tc-icon spans with emoji inside)
  document.querySelectorAll(".tool-card-link").forEach(link => {
    const href = link.getAttribute("href")?.split("#")[0];
    const iconWrap = link.querySelector(".tc-icon");
    if (iconWrap && TOOL_ICONS[href]) {
      iconWrap.innerHTML = _iconHTML(TOOL_ICONS[href]);
    }
  });

  // about.html value cards (privacy/speed/free/honest) — keep distinct icons
  const valueIconMap = ["ti-shield-lock", "ti-bolt", "ti-gift", "ti-sparkles"];
  document.querySelectorAll(".value-icon").forEach((el, i) => {
    el.innerHTML = _iconHTML(valueIconMap[i] || "ti-check");
  });

  // homepage trust section icons
  const trustIconMap = ["ti-lock", "ti-trash", "ti-ban", "ti-bell-off"];
  document.querySelectorAll(".trust-icon").forEach((el, i) => {
    el.innerHTML = _iconHTML(trustIconMap[i] || "ti-shield-check");
  });
}

/* ── Theme ── */
(function(){
  try {
    const s = localStorage.getItem("rundocs-theme");
    const dark = s === "dark" || (!s && typeof matchMedia === "function" && matchMedia("(prefers-color-scheme:dark)").matches);
    if(dark) document.documentElement.setAttribute("data-theme","dark");
  } catch(e) {
    console.warn("Theme detection skipped:", e);
  }
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
  btn.innerHTML = dark ? _iconHTML("ti-sun") : _iconHTML("ti-moon");
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
  const icons = { success: _iconHTML("ti-check"), error: _iconHTML("ti-x") };
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
  el.innerHTML=files.map((f,i)=>`<div class="file-chip">${_iconHTML("ti-file-text","fc-icon")}<span class="fc-name">${_esc(f.name)}</span><span class="fc-size">${_bytes(f.size)}</span><button class="fc-rm" onclick="removeFile('${tid}',${i})">×</button></div>`).join("");
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
  try{ const fd=new FormData(); fd.append("file",file); const r=await fetch(`${API_BASE}/ocr-check`,{method:"POST",body:fd}); if(!r.ok) return; const d=await r.json(); if(d.is_scanned) el.innerHTML=`<div class="notice notice-amber">${_iconHTML("ti-alert-circle")}<span><strong>Scanned PDF detected.</strong> Text extraction may be limited.</span></div>`; }catch(_){}
}
function showProgress(tid,pct,lbl){ document.getElementById("pw-"+tid)?.classList.add("show"); const pb=document.getElementById("pb-"+tid); const pl=document.getElementById("pl-"+tid); if(pb) pb.style.width=pct+"%"; if(pl&&lbl) pl.textContent=lbl; }
function hideProgress(tid){ document.getElementById("pw-"+tid)?.classList.remove("show"); const pb=document.getElementById("pb-"+tid); if(pb) pb.style.width="0%"; }
function showResult(tid,msg,err){
  const rb=document.getElementById("rb-"+tid), mp=document.getElementById("rb-"+tid+"-msg"); if(!rb||!mp) return;
  rb.className="result-box show"+(err?" err":"");
  const ico=err?_iconHTML("ti-x"):_iconHTML("ti-check");
  mp.innerHTML=ico+" "+_esc(msg); if(!err) toast(msg,"success"); else toast(msg,"error");
}
function setBtnState(tid,loading,label){ const btn=document.getElementById("btn-"+tid); if(!btn) return; btn.disabled=loading; if(loading) btn.innerHTML=`<span class="spinner"></span> Processing…`; else if(label) btn.textContent=label; }
function showDownloadBtn(tid,blob,filename){
  document.getElementById("dl-btn-"+tid)?.remove();
  const btn=document.createElement("button"); btn.id="dl-btn-"+tid; btn.className="download-btn";
  btn.innerHTML=`${_iconHTML("ti-download")} Download ${_esc(filename)}`;
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
function _freemiumModal(name,size){ document.getElementById("rundocs-modal")?.remove(); const m=document.createElement("div"); m.id="rundocs-modal"; m.className="modal-overlay"; m.innerHTML=`<div class="modal-box"><div class="modal-icon">${_iconHTML("ti-folder-x")}</div><h3>File Too Large</h3><p><strong>${_esc(name)}</strong> is ${_bytes(size)}.</p><p>Free plan supports up to <strong>${FREE_MB} MB</strong>.</p><div class="modal-actions"><button class="btn btn-primary btn-sm" onclick="document.getElementById('rundocs-modal').remove()">Got it</button></div></div>`; document.body.appendChild(m); m.addEventListener("click",e=>{ if(e.target===m) m.remove(); }); }
async function loadSplitMeta(file){ try{ if(typeof pdfjsLib==="undefined"){ await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"); pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; } const buf=await file.arrayBuffer(); const pdf=await pdfjsLib.getDocument({data:buf}).promise; const n=pdf.numPages; const el=document.getElementById("split-page-info"); if(el){ el.textContent=`Total: ${n} pages`; el.style.display="inline"; } const es=document.getElementById("split-start"), ee=document.getElementById("split-end"); if(es) es.max=n; if(ee){ ee.value=n; ee.max=n; } }catch(_){} }
function toggleFaq(btn){ const item=btn.closest(".faq-item"); const wasOpen=item.classList.contains("open"); document.querySelectorAll(".faq-item.open").forEach(i=>i.classList.remove("open")); if(!wasOpen) item.classList.add("open"); }
function _bytes(b){ if(b<1024) return b+" B"; if(b<1048576) return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(1)+" MB"; }
function _esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ── LOGO SVG (unchanged — this is the brand mark, not a tool icon) ── */
const LOGO_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="1" width="13" height="17" rx="2.5" fill="white" fill-opacity=".95"/>
  <path d="M15 1L20 6H15V1Z" fill="white" fill-opacity=".55"/>
  <rect x="6" y="5.5" width="6" height="1.4" rx=".7" fill="#4F6EF7"/>
  <rect x="6" y="8.5" width="6" height="1.4" rx=".7" fill="#4F6EF7"/>
  <rect x="6" y="11.5" width="4" height="1.4" rx=".7" fill="#4F6EF7"/>
  <circle cx="18.5" cy="18.5" r="4.5" fill="#22C55E"/>
  <path d="M16.5 18.5L17.8 19.8L20.5 17" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ── NAV DROPDOWN DATA — icon field now holds a Tabler class, not emoji ── */
const NAV_DROPS = {
  convert: {
    label: "Convert PDF",
    icon: "ti-replace",
    tools: [
      ["pdf-to-word.html","ti-file-word","PDF to Word","Convert PDF to editable .docx"],
      ["pdf-to-excel.html","ti-file-spreadsheet","PDF to Excel","Smart table extraction"],
      ["pdf-to-jpg.html","ti-photo","PDF to JPG","Export pages as images"],
      ["pdf-to-pptx.html","ti-presentation","PDF to PowerPoint","Each page = one slide"],
      ["pdf-to-text.html","ti-file-text","PDF to Text","Extract raw plain text"],
      ["word-to-pdf.html","ti-file-type-doc","Word to PDF","Convert .docx to PDF"],
      ["excel-to-pdf.html","ti-file-type-xls","Excel to PDF","Convert .xlsx to PDF"],
      ["jpg-to-pdf.html","ti-photo-plus","Image to PDF","JPG/PNG to PDF"],
    ]
  },
  merge: {
    label: "Merge PDF",
    icon: "ti-stack-2",
    tools: [
      ["merge-pdf.html","ti-stack-2","Merge PDF","Combine multiple PDFs into one"],
      ["rotate-pdf.html","ti-rotate-clockwise","Rotate PDF","90°, 180°, 270° rotation"],
      ["delete-pages.html","ti-trash","Delete Pages","Remove unwanted pages"],
      ["reorder-pages.html","ti-arrows-sort","Reorder Pages","Rearrange page order"],
      ["add-page-numbers.html","ti-number-123","Add Page Numbers","Auto number pages"],
    ]
  },
  split: {
    label: "Split PDF",
    icon: "ti-cut",
    tools: [
      ["split-pdf.html","ti-cut","Split PDF","Split into individual pages"],
      ["split-pdf.html","ti-file-export","Extract Pages","Extract a specific page range"],
      ["delete-pages.html","ti-trash","Delete Pages","Remove specific pages"],
      ["pdf-to-jpg.html","ti-photo","PDF to Images","Export each page as JPG"],
      ["pdf-to-text.html","ti-file-text","Extract Text","Pull text content from PDF"],
    ]
  },
  compress: {
    label: "Compress PDF",
    icon: "ti-zoom-out",
    tools: [
      ["compress-pdf.html","ti-zoom-out","Compress PDF","Reduce file size up to 90%"],
      ["optimize-pdf.html","ti-bolt","Optimize PDF","Optimize for web/print"],
      ["repair-pdf.html","ti-tool","Repair PDF","Fix corrupted PDFs"],
    ]
  },
  security: {
    label: "Security",
    icon: "ti-shield-lock",
    tools: [
      ["protect-pdf.html","ti-lock","Lock PDF","AES-256 encryption"],
      ["unlock-pdf.html","ti-lock-open","Unlock PDF","Remove password"],
      ["watermark-pdf.html","ti-stamp","Watermark PDF","Add text watermark"],
      ["sign-pdf.html","ti-signature","Sign PDF","Add signature"],
    ]
  },
  ai: {
    label: "AI Tools",
    icon: "ti-sparkles",
    tools: [
      ["ai-tools.html#ask","ti-message-circle-2","Ask PDF","Chat with your document"],
      ["ai-tools.html#summary","ti-clipboard-text","Summarize PDF","Get instant summary"],
      ["ai-tools.html#notes","ti-notes","Generate Notes","Study notes from PDF"],
      ["ai-tools.html#quiz","ti-help-circle","Quiz Generator","Auto quiz questions"],
      ["ai-tools.html#keypoints","ti-bulb","Key Points","Extract key insights"],
      ["ai-tools.html#translate","ti-language","Translate PDF","Urdu, Arabic & more"],
    ]
  }
};

/* ── Mobile tools data — icon field now holds a Tabler class ── */
const MOBILE_TOOLS = [
  { cat:"Convert PDF", icon:"ti-replace", tools:[["pdf-to-word.html","ti-file-word","PDF to Word"],["pdf-to-excel.html","ti-file-spreadsheet","PDF to Excel"],["pdf-to-jpg.html","ti-photo","PDF to JPG"],["pdf-to-pptx.html","ti-presentation","PDF to PowerPoint"],["pdf-to-text.html","ti-file-text","PDF to Text"],["word-to-pdf.html","ti-file-type-doc","Word to PDF"],["excel-to-pdf.html","ti-file-type-xls","Excel to PDF"],["jpg-to-pdf.html","ti-photo-plus","Image to PDF"]] },
  { cat:"Merge & Organize", icon:"ti-folder", tools:[["merge-pdf.html","ti-stack-2","Merge PDF"],["split-pdf.html","ti-cut","Split PDF"],["rotate-pdf.html","ti-rotate-clockwise","Rotate PDF"],["delete-pages.html","ti-trash","Delete Pages"],["reorder-pages.html","ti-arrows-sort","Reorder Pages"],["add-page-numbers.html","ti-number-123","Page Numbers"]] },
  { cat:"Compress", icon:"ti-zoom-out", tools:[["compress-pdf.html","ti-zoom-out","Compress PDF"],["optimize-pdf.html","ti-bolt","Optimize PDF"],["repair-pdf.html","ti-tool","Repair PDF"]] },
  { cat:"Security", icon:"ti-shield-lock", tools:[["protect-pdf.html","ti-lock","Lock PDF"],["unlock-pdf.html","ti-lock-open","Unlock PDF"],["watermark-pdf.html","ti-stamp","Watermark"],["sign-pdf.html","ti-signature","Sign PDF"]] },
  { cat:"AI Tools", icon:"ti-sparkles", tools:[["ai-tools.html","ti-message-circle-2","Ask PDF"],["ai-tools.html#summary","ti-clipboard-text","Summarize"],["ai-tools.html#notes","ti-notes","Notes"],["ai-tools.html#quiz","ti-help-circle","Quiz Generator"],["ai-tools.html#translate","ti-language","Translate"]] },
  { cat:"Business", icon:"ti-briefcase", tools:[["invoice-to-excel.html","ti-receipt","Invoice to Excel"],["bank-statement.html","ti-building-bank","Bank Statement"],["pdf-to-excel.html","ti-file-spreadsheet","Smart Table Extract"]] },
];

/* ── Build dropdown HTML ── */
function _buildDrop(key) {
  const d = NAV_DROPS[key];
  const items = d.tools.map(([href, icon, label, desc]) => `
    <a href="${href}" class="drop-item">
      <span class="drop-item-icon">${_iconHTML(icon)}</span>
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
        <div class="drop-header">${_iconHTML(d.icon)} ${d.label}</div>
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
      <div class="all-tools-col-head">${_iconHTML(d.icon)} ${d.label}</div>
      ${d.tools.map(([href,icon,label])=>`<a href="${href}" class="all-tool-link">${_iconHTML(icon)}${label}</a>`).join("")}
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
          <span>${_iconHTML("ti-lock")} Files deleted after processing &nbsp;·&nbsp; All 25+ tools free</span>
        </div>
      </div>
    </div>`;
}

/* ── Build Nav ── */
function buildNav(){
  const mobileAccs = MOBILE_TOOLS.map(c=>`
    <div>
      <button class="mobile-acc-btn" onclick="toggleMobileAcc(this)">
        <span>${_iconHTML(c.icon)} ${c.cat}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="mobile-acc-body">
        ${c.tools.map(([href,icon,label])=>`<a href="${href}">${_iconHTML(icon)} ${label}</a>`).join("")}
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
    <a href="index.html">${_iconHTML("ti-home")} Home</a>
    <a href="ai-tools.html">${_iconHTML("ti-sparkles")} AI Tools</a>
    <a href="index.html#pricing">${_iconHTML("ti-coin")} Pricing</a>
    <a href="contact.html">${_iconHTML("ti-mail")} Contact</a>
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
        ${_iconHTML("ti-shield-check")}
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
  setTimeout(()=>{ _setDarkIcon(); _initStickyNav(); _initScrollReveal(); initDropZones(); _initDropdowns(); _applyRealIcons(); },50);
});
