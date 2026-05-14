/* JasonPDF v8 — shared.js */
const _CFG = window.JASONPDF_CONFIG || {};
const API_BASE    = _CFG.API_BASE    || "";
const FREE_MB     = _CFG.FREE_LIMIT_MB || 25;
const FREE_BYTES  = FREE_MB * 1024 * 1024;
const GA_ID       = _CFG.GA_ID || "";

/* ── Theme ── */
(function(){
  const s = localStorage.getItem("jasonpdf-theme");
  const dark = s==="dark"||(!s&&matchMedia("(prefers-color-scheme:dark)").matches);
  if(dark) document.documentElement.setAttribute("data-theme","dark");
})();
function toggleDark(){
  const next = document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";
  document.documentElement.setAttribute("data-theme",next);
  localStorage.setItem("jasonpdf-theme",next);
  _setDarkIcon();
}
function _setDarkIcon(){
  const btn=document.getElementById("darkBtn"); if(!btn)return;
  const dark=document.documentElement.getAttribute("data-theme")==="dark";
  btn.innerHTML=dark
    ?`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    :`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  btn.title=dark?"Light mode":"Dark mode";
}

/* ── Toast Notifications ── */
function toast(msg, type="success", duration=3500){
  let container = document.getElementById("toast-container");
  if(!container){
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icons = {
    success:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = (icons[type]||"") + _esc(msg);
  container.appendChild(t);
  setTimeout(()=>{
    t.style.animation="toastOut .3s ease forwards";
    setTimeout(()=>t.remove(), 300);
  }, duration);
}

/* ── Mobile Menu ── */
function toggleMenu(){
  const nav=document.getElementById("mobileNav");
  const ov=document.getElementById("navOverlay");
  const btn=document.getElementById("menuBtn");
  if(!nav)return;
  const open=nav.classList.toggle("open");
  ov&&ov.classList.toggle("open",open);
  btn&&btn.classList.toggle("open",open);
  document.body.style.overflow=open?"hidden":"";
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    const n=document.getElementById("mobileNav");
    if(n&&n.classList.contains("open"))toggleMenu();
    document.querySelectorAll(".modal-overlay").forEach(m=>m.remove());
  }
});

/* ── Drop Zones ── */
function initDropZones(){
  document.querySelectorAll(".upload-zone").forEach(zone=>{
    zone.addEventListener("dragover",e=>{e.preventDefault();zone.classList.add("drag-over");});
    zone.addEventListener("dragleave",()=>zone.classList.remove("drag-over"));
    zone.addEventListener("drop",e=>{
      e.preventDefault();zone.classList.remove("drag-over");
      const inp=zone.querySelector(".file-input"); if(!inp)return;
      const dt=new DataTransfer();
      Array.from(e.dataTransfer.files).forEach(f=>dt.items.add(f));
      inp.files=dt.files; inp.dispatchEvent(new Event("change"));
    });
  });
}

/* ── File Store ── */
const fileStore={};
function handleFiles(tid,input){
  const files=Array.from(input.files); if(!files.length)return;
  for(const f of files){
    if(f.size>FREE_BYTES){_freemiumModal(f.name,f.size);input.value="";return;}
  }
  fileStore[tid]=files;
  _renderChips(tid,files);
  if(files[0]?.type==="application/pdf") _renderPdfPreview(tid,files[0]);
  _ocrHint(tid,files[0]);
  if(tid==="split"&&files[0]) loadSplitMeta(files[0]);
  _trackEvent("file_upload",{tool:tid,size:files[0]?.size});
}
function _renderChips(tid,files){
  const el=document.getElementById("fl-"+tid); if(!el)return;
  el.innerHTML=files.map((f,i)=>`<div class="file-chip">
    <svg class="fc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <span class="fc-name">${_esc(f.name)}</span>
    <span class="fc-size">${_bytes(f.size)}</span>
    <button class="fc-rm" onclick="removeFile('${tid}',${i})" title="Remove">×</button>
  </div>`).join("");
}
function removeFile(tid,idx){
  fileStore[tid]?.splice(idx,1);
  _renderChips(tid,fileStore[tid]||[]);
  if(!fileStore[tid]?.length){const pa=document.getElementById("preview-"+tid);if(pa)pa.classList.remove("show");}
}

/* ── PDF Preview ── */
async function _renderPdfPreview(tid,file){
  const area=document.getElementById("preview-"+tid); if(!area)return;
  try{
    const buf=await file.arrayBuffer();
    if(typeof pdfjsLib==="undefined"){
      await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    const page=await pdf.getPage(1);
    const vp=page.getViewport({scale:1.2});
    const canvas=document.createElement("canvas");
    canvas.width=vp.width; canvas.height=vp.height;
    await page.render({canvasContext:canvas.getContext("2d"),viewport:vp}).promise;
    const wrap=area.querySelector(".pdf-canvas-wrap");
    if(wrap){wrap.innerHTML="";wrap.appendChild(canvas);}
    const hdr=area.querySelector(".pdf-preview-header strong");
    if(hdr)hdr.textContent=`${file.name} — Page 1 of ${pdf.numPages}`;
    area.classList.add("show");
  }catch(e){console.warn("Preview failed:",e);}
}
function _loadScript(src){
  return new Promise((res,rej)=>{
    const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);
  });
}

/* ── OCR Hint ── */
async function _ocrHint(tid,file){
  const el=document.getElementById("ocr-hint-"+tid); if(!el||!file)return;
  try{
    const fd=new FormData();fd.append("file",file);
    const r=await fetch(`${API_BASE}/ocr-check`,{method:"POST",body:fd});
    if(!r.ok)return;
    const d=await r.json();
    if(d.is_scanned){
      el.innerHTML=`<div class="notice notice-amber"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span><strong>Scanned PDF detected.</strong> Text extraction may be limited.</span></div>`;
      el.style.display="block";
    }
  }catch(_){}
}

/* ── Progress ── */
function showProgress(tid,pct,label){
  const pw=document.getElementById("pw-"+tid);
  const pb=document.getElementById("pb-"+tid);
  const pl=document.getElementById("pl-"+tid);
  pw?.classList.add("show");
  if(pb)pb.style.width=pct+"%";
  if(pl&&label)pl.textContent=label;
}
function hideProgress(tid){
  const pw=document.getElementById("pw-"+tid);
  const pb=document.getElementById("pb-"+tid);
  pw?.classList.remove("show");
  if(pb)pb.style.width="0%";
}
function showResult(tid,msg,err){
  const rb=document.getElementById("rb-"+tid);
  const mp=document.getElementById("rb-"+tid+"-msg");
  if(!rb||!mp)return;
  rb.className="result-box show"+(err?" err":"");
  const ico=err
    ?`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
    :`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  mp.innerHTML=ico+" "+_esc(msg);
  if(!err) toast(msg,"success"); else toast(msg,"error");
}
function setBtnState(tid,loading,label){
  const btn=document.getElementById("btn-"+tid); if(!btn)return;
  btn.disabled=loading;
  if(loading)btn.innerHTML=`<span class="spinner"></span> Processing…`;
  else if(label)btn.textContent=label;
}

/* ── Download Button ── */
function showDownloadBtn(tid,blob,filename){
  const old=document.getElementById("dl-btn-"+tid);if(old)old.remove();
  const btn=document.createElement("button");
  btn.id="dl-btn-"+tid; btn.className="download-btn";
  btn.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download ${_esc(filename)}`;
  btn.onclick=()=>{downloadBlob(blob,filename);toast("Download started! ✓","success");};
  const rb=document.getElementById("rb-"+tid);
  const ab=document.getElementById("btn-"+tid);
  const after=rb||ab;
  if(after?.parentNode)after.parentNode.insertBefore(btn,after.nextSibling);
}

/* ── API Call ── */
async function callAPI(endpoint,fd,tid,label){
  label=label||"Processing…";
  showProgress(tid,12,"Uploading…");
  let p=12;
  const tick=setInterval(()=>{p=Math.min(p+6,88);showProgress(tid,p,label);},320);
  try{
    const resp=await fetch(API_BASE+endpoint,{method:"POST",body:fd});
    clearInterval(tick);showProgress(tid,96,"Finishing…");
    if(resp.status===413)throw new Error(`File too large. Limit is ${FREE_MB} MB.`);
    if(!resp.ok){
      let m="Server error — please try again.";
      try{const j=await resp.json();m=j.detail||j.message||m;}catch(_){}
      throw new Error(m);
    }
    showProgress(tid,100,"Done!");
    _trackEvent("tool_complete",{tool:tid});
    return resp;
  }catch(e){clearInterval(tick);throw e;}
}

/* ── AI API Call ── */
async function callAI(endpoint, fd, resultId){
  const result = document.getElementById(resultId);
  const body   = result?.querySelector(".ai-result-body");
  if(result) result.classList.add("show");
  if(body)   body.innerHTML = `<span style="color:var(--brand2)">🤖 AI is thinking…</span>`;
  try{
    const resp = await fetch(API_BASE+endpoint,{method:"POST",body:fd});
    if(!resp.ok){
      const j = await resp.json().catch(()=>({}));
      throw new Error(j.detail||"AI processing failed.");
    }
    const data = await resp.json();
    if(body) body.textContent = data.result || data.text || JSON.stringify(data);
    toast("AI result ready! ✓","info");
    _trackEvent("ai_complete",{endpoint});
    return data;
  }catch(e){
    if(body) body.innerHTML=`<span style="color:var(--red)">❌ ${_esc(e.message)}</span>`;
    toast(e.message,"error");
    throw e;
  }
}

/* ── Copy to Clipboard ── */
function copyResult(btn){
  const body = btn.closest(".ai-result")?.querySelector(".ai-result-body");
  if(!body)return;
  navigator.clipboard.writeText(body.textContent).then(()=>{
    toast("Copied to clipboard!","success");
    btn.textContent="✓ Copied!";
    setTimeout(()=>btn.innerHTML=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`,1500);
  });
}

function downloadBlob(blob,name){
  const u=URL.createObjectURL(blob);
  const a=Object.assign(document.createElement("a"),{href:u,download:name});
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},2000);
}

/* ── Freemium Modal ── */
function _freemiumModal(name,size){
  document.getElementById("jasonpdf-modal")?.remove();
  const m=document.createElement("div");m.id="jasonpdf-modal";m.className="modal-overlay";
  m.innerHTML=`<div class="modal-box"><div class="modal-icon">📁</div><h3>File Too Large</h3><p><strong>${_esc(name)}</strong> is ${_bytes(size)}.</p><p>Free plan supports files up to <strong>${FREE_MB} MB</strong>.</p><div class="modal-actions"><button class="btn btn-brand btn-sm" onclick="document.getElementById('jasonpdf-modal').remove()">Got it</button></div></div>`;
  document.body.appendChild(m);
  m.addEventListener("click",e=>{if(e.target===m)m.remove();});
}

/* ── Split Meta ── */
async function loadSplitMeta(file){
  try{
    if(typeof pdfjsLib==="undefined"){
      await _loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const buf=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    const n=pdf.numPages;
    const el=document.getElementById("split-page-info");
    if(el){el.textContent=`Total: ${n} pages`;el.style.display="inline-flex";}
    const es=document.getElementById("split-start");
    const ee=document.getElementById("split-end");
    if(es)es.max=n;
    if(ee){ee.value=n;ee.max=n;}
  }catch(_){}
}

/* ── GA Tracking ── */
function _trackEvent(name, params={}){
  if(typeof gtag!=="undefined") gtag("event",name,params);
}

/* ── Utils ── */
function _bytes(b){if(b<1024)return b+" B";if(b<1048576)return(b/1024).toFixed(1)+" KB";return(b/1048576).toFixed(1)+" MB";}
function _esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

/* ── Logo SVG ── */
const NAV_LOGO_SVG=`<svg class="nav-logo-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="10" fill="#FF3814"/><path d="M10 8h11l5 5.5V28H10V8z" fill="white"/><path d="M21 8v5.5h5" stroke="#FF3814" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M14 17h8M14 20.5h6M14 24h4" stroke="#FF3814" stroke-width="1.5" stroke-linecap="round"/><circle cx="26" cy="26" r="7" fill="#7C3AED"/><path d="M23.5 26l2 2L29 23.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

/* ── Nav HTML ── */
function buildNav(){
  const tools=[
    ["merge-pdf.html","📎","Merge PDF"],["split-pdf.html","✂️","Split PDF"],
    ["compress-pdf.html","🗜️","Compress PDF"],["rotate-pdf.html","🔄","Rotate PDF"],
    ["watermark-pdf.html","🔏","Watermark PDF"],["pdf-to-word.html","📝","PDF to Word"],
    ["pdf-to-excel.html","📊","PDF to Excel"],["pdf-to-jpg.html","🖼️","PDF to JPG"],
    ["jpg-to-pdf.html","📥","Image to PDF"],["unlock-pdf.html","🔓","Unlock PDF"],
    ["protect-pdf.html","🔐","Protect PDF"],["pdf-to-pptx.html","📽️","PDF to PowerPoint"],
    ["pdf-to-text.html","📄","PDF to Text"],["add-page-numbers.html","🔢","Add Page Numbers"],
    ["ai-tools.html","🤖","AI Tools"],
  ];
  return `<nav class="nav">
  <a href="index.html" class="nav-logo">${NAV_LOGO_SVG}<span class="nav-logo-name">Jason<em>PDF</em></span></a>
  <button class="hamburger" id="menuBtn" onclick="toggleMenu()"><span></span><span></span><span></span></button>
  <div class="nav-center">
    <a href="index.html#tools">Tools</a>
    <a href="ai-tools.html" style="color:var(--brand2);font-weight:700">🤖 AI Tools</a>
    <a href="index.html#modes">Modes</a>
    <a href="index.html#faq">FAQ</a>
    <a href="contact.html">Contact</a>
  </div>
  <div class="nav-right">
    <span class="nav-ai-badge">🤖 AI Powered</span>
    <span class="nav-secure-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Files auto-deleted</span>
    <button class="nav-btn-icon" id="darkBtn" onclick="toggleDark()"></button>
    <a href="index.html#tools" class="nav-cta">Try Free →</a>
  </div>
</nav>
<div class="drawer-overlay" id="navOverlay" onclick="toggleMenu()"></div>
<div class="mobile-nav" id="mobileNav">
  <div class="mobile-nav-hdr"><span class="nav-logo-name">Jason<em style="color:var(--brand)">PDF</em></span></div>
  <div class="mobile-nav-sep">🤖 AI Tools</div>
  <a href="ai-tools.html" onclick="toggleMenu()" style="color:var(--brand2);font-weight:700">🤖 All AI Tools</a>
  <div class="mobile-nav-sep">PDF Tools</div>
  ${tools.filter(t=>!t[0].includes("ai-")).map(([href,icon,label])=>`<a href="${href}" onclick="toggleMenu()">${icon} ${label}</a>`).join("")}
  <div class="mobile-nav-sep">Pages</div>
  <a href="contact.html" onclick="toggleMenu()">✉️ Contact</a>
  <a href="about.html" onclick="toggleMenu()">ℹ️ About</a>
  <a href="index.html#tools" onclick="toggleMenu()" class="mobile-nav-cta">All Tools →</a>
</div>`;
}

/* ── Footer HTML ── */
function buildFooter(){
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="index.html" class="nav-logo">${NAV_LOGO_SVG}<span class="nav-logo-name" style="font-size:22px">Jason<em>PDF</em></span></a>
      <p>AI-powered PDF workspace. 14 free tools + 6 AI features. No signup, no watermarks, 100% private.</p>
    </div>
    <div class="footer-col">
      <h4>Organize</h4>
      <a href="merge-pdf.html">Merge PDF</a><a href="split-pdf.html">Split PDF</a>
      <a href="compress-pdf.html">Compress PDF</a><a href="rotate-pdf.html">Rotate PDF</a>
      <a href="add-page-numbers.html">Add Page Numbers</a>
    </div>
    <div class="footer-col">
      <h4>Convert</h4>
      <a href="pdf-to-word.html">PDF to Word</a><a href="pdf-to-excel.html">PDF to Excel</a>
      <a href="pdf-to-jpg.html">PDF to JPG</a><a href="jpg-to-pdf.html">Image to PDF</a>
      <a href="pdf-to-pptx.html">PDF to PowerPoint</a><a href="pdf-to-text.html">PDF to Text</a>
    </div>
    <div class="footer-col">
      <h4>🤖 AI Tools</h4>
      <a href="ai-tools.html#summary">AI Summary</a><a href="ai-tools.html#notes">AI Notes</a>
      <a href="ai-tools.html#quiz">Quiz Generator</a><a href="ai-tools.html#translate">Translate PDF</a>
      <a href="ai-tools.html#ask">Ask PDF</a>
      <h4 style="margin-top:1.2rem">Security</h4>
      <a href="protect-pdf.html">Protect PDF</a><a href="unlock-pdf.html">Unlock PDF</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} JasonPDF. All rights reserved.</p>
    <div style="display:flex;gap:1.5rem;align-items:center">
      <a href="about.html#privacy">Privacy Policy</a>
      <a href="about.html#terms">Terms</a>
      <a href="about.html">About</a>
    </div>
  </div>
</footer>`;
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded",()=>{
  _setDarkIcon();
  initDropZones();
  const navPh=document.getElementById("nav-placeholder");
  if(navPh) navPh.outerHTML=buildNav();
  const footerPh=document.getElementById("footer-placeholder");
  if(footerPh) footerPh.outerHTML=buildFooter();
});
