#!/usr/bin/env python3
"""Generate all PDFPilot tool pages."""
import os

OUT = "/home/claude/pdfpilot-frontend"

def tool_page(title, seo_title, seo_desc, icon, heading, subtext, tool_id, endpoint,
              btn_label, download_name, extra_fields="", extra_script="", faqs=None, multi=False):
    multi_attr = ' multiple' if multi else ''
    accept = 'image/*' if tool_id in ('jpg2pdf',) else '.pdf'
    faq_html = ""
    if faqs:
        items = "\n".join(f"""
      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">{q}
          <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="faq-a">{a}</div>
      </div>""" for q,a in faqs)
        faq_html = f"""
<section style="padding:3rem 0;border-top:1px solid var(--border);margin-top:2rem">
  <h2 style="font-size:20px;font-weight:800;color:var(--ink);margin-bottom:1.5rem">Frequently asked questions</h2>
  <div class="faq-list">{items}</div>
</section>"""

    script = f"""
async function run_{tool_id}(){{
  const files=fileStore["{tool_id}"]; if(!files?.length){{toast("Please select a file first","error");return;}}
  setBtnState("{tool_id}",true);
  const fd=new FormData();
  {"files.forEach(f=>fd.append('files',f));" if multi else f'fd.append("file",files[0]);'}
  {extra_script}
  try{{
    const resp=await callAPI("{endpoint}",fd,"{tool_id}","{btn_label}...");
    const blob=await resp.blob();
    showResult("{tool_id}","Done! File ready to download.");
    showDownloadBtn("{tool_id}",blob,{download_name},{{ }});
  }}catch(e){{showResult("{tool_id}",e.message,true);}}
  finally{{setBtnState("{tool_id}",false,"{btn_label}");}}
}}"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{seo_title} — PDFPilot</title>
<meta name="description" content="{seo_desc}">
<meta name="robots" content="index,follow"><meta name="author" content="PDFPilot"><meta name="theme-color" content="#2A5BFF">
<link rel="canonical" href="https://pdfpilot.netlify.app/{tool_id.replace('_','-')}.html">
<meta property="og:title" content="{seo_title} — PDFPilot"><meta property="og:type" content="website">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"SoftwareApplication","name":"PDFPilot {seo_title}","applicationCategory":"UtilitiesApplication","operatingSystem":"Web","offers":{{"@type":"Offer","price":"0","priceCurrency":"USD"}}}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@1,9..144,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="shared.css">
<script src="config.js"></script>
</head>
<body>
<div id="nav-placeholder"></div>
<div class="tool-page">
  <div class="tool-container">
    <div class="tool-header">
      <div class="tool-icon-wrap">{icon}</div>
      <h1 class="tool-title">{heading}</h1>
      <p class="tool-sub">{subtext}</p>
    </div>
    <div class="tool-card">
      <div class="upload-zone" onclick="document.getElementById('fi-{tool_id}').click()">
        <div class="uz-icon">{icon}</div>
        <div class="uz-title">Drop your file here or click to browse</div>
        <div class="uz-sub">Up to 25 MB free · Secure &amp; private</div>
        <div class="uz-badge">🔒 Files deleted after processing</div>
        <input class="file-input" id="fi-{tool_id}" type="file" accept="{accept}"{multi_attr} onchange="handleFiles('{tool_id}',this)">
      </div>
      <div class="file-chips" id="fl-{tool_id}"></div>
      <div class="pdf-preview-area" id="preview-{tool_id}"><div class="pdf-preview-header"><span>Preview</span><strong></strong></div><div class="pdf-canvas-wrap"></div></div>
      <div id="ocr-hint-{tool_id}"></div>
      {extra_fields}
      <button class="action-btn" id="btn-{tool_id}" onclick="run_{tool_id}()">{icon} {btn_label}</button>
      <div class="progress-wrap" id="pw-{tool_id}"><div class="progress-track"><div class="progress-fill" id="pb-{tool_id}"></div></div><div class="progress-label" id="pl-{tool_id}">Processing…</div></div>
      <div class="result-box" id="rb-{tool_id}"><p id="rb-{tool_id}-msg"></p></div>
    </div>
<script>{script}</script>
{faq_html}
    <div class="tool-footer-links">
      <p>More free PDF tools:</p>
      <div class="tfl-grid">
        <a href="merge-pdf.html" class="tfl-link">📎 Merge PDF</a>
        <a href="compress-pdf.html" class="tfl-link">🗜️ Compress</a>
        <a href="pdf-to-word.html" class="tfl-link">📝 PDF to Word</a>
        <a href="pdf-to-excel.html" class="tfl-link">📊 PDF to Excel</a>
        <a href="pdf-to-jpg.html" class="tfl-link">🖼️ PDF to JPG</a>
        <a href="protect-pdf.html" class="tfl-link">🔐 Lock PDF</a>
        <a href="ai-tools.html" class="tfl-link">✨ AI Tools</a>
      </div>
    </div>
  </div>
</div>
<div id="footer-placeholder"></div>
<script src="shared.js"></script>
</body>
</html>"""

# ── Define all tool pages ──────────────────────────────────────────────
pages = [
    # (filename, title, seo_title, seo_desc, icon, heading, subtext, tool_id, endpoint, btn_label, dl_name, extra_fields, extra_script, faqs, multi)
    ("compress-pdf.html",
     "Compress PDF", "Compress PDF",
     "Reduce PDF file size while maintaining quality. Up to 90% reduction. No signup. Files deleted instantly.",
     "🗜️", "Compress PDF",
     "Reduce PDF file size by up to 90% while preserving quality. Three compression levels.",
     "compress", "/compress-pdf", "Compress PDF",
     '`compressed_${files[0].name}`',
     '''<label class="f-label">Compression Level</label>
<select class="f-select" id="compress-level">
  <option value="low">Low — Best quality, smaller reduction</option>
  <option value="medium" selected>Medium — Balanced quality &amp; size</option>
  <option value="high">High — Smallest file, reduced quality</option>
</select>''',
     'fd.append("level",document.getElementById("compress-level").value);',
     [("How much can you compress a PDF?","Typically 20–70% reduction. PDFs with many images compress much more than text-only documents."),
      ("Will compression affect quality?","Low mode preserves near-original quality. Medium is balanced. High reduces image quality but creates the smallest files."),
      ("Is there a size limit?","Free plan supports up to 25 MB.")], False),

    ("merge-pdf.html",
     "Merge PDF", "Merge PDF",
     "Combine multiple PDF files into a single document. No signup. Files deleted instantly.",
     "📎", "Merge PDF",
     "Combine multiple PDF files into one perfectly ordered document.",
     "merge", "/merge-pdf", "Merge PDFs",
     '"merged.pdf"', "", "",
     [("How many PDFs can I merge?","As many as needed. Files are merged in the order you select them."),
      ("Is there a size limit?","Each file can be up to 25 MB. No limit on output size.")], True),

    ("split-pdf.html",
     "Split PDF", "Split PDF",
     "Extract specific pages or split a PDF into individual files. No signup. Files deleted instantly.",
     "✂️", "Split PDF",
     "Extract pages or split a PDF into separate individual files.",
     "split", "/split-pdf", "Split PDF",
     '"split_output.zip"',
     '''<label class="f-label">Split Mode</label>
<select class="f-select" id="split-mode" onchange="toggleSplitRange()">
  <option value="each">Split into individual pages (ZIP)</option>
  <option value="range">Extract a page range</option>
</select>
<div id="split-range" style="display:none">
  <div class="range-row">
    <div><label class="f-label">From Page</label><input class="f-input" type="number" id="split-start" value="1" min="1"></div>
    <div><label class="f-label">To Page <span id="split-page-info" style="display:none;font-weight:400;color:var(--ink4)"></span></label><input class="f-input" type="number" id="split-end" value="1" min="1"></div>
  </div>
</div>
<script>function toggleSplitRange(){const m=document.getElementById("split-mode").value;document.getElementById("split-range").style.display=m==="range"?"block":"none";}</script>''',
     '''const mode=document.getElementById("split-mode").value;
fd.append("mode",mode);
if(mode==="range"){fd.append("start_page",document.getElementById("split-start").value);fd.append("end_page",document.getElementById("split-end").value);}''',
     [("Can I extract just one page?","Yes — select 'Extract a page range' and set both start and end to the same page."),
      ("What format are the split files?","Individual pages are in a ZIP. Page range extraction is a single PDF.")], False),

    ("rotate-pdf.html",
     "Rotate PDF", "Rotate PDF",
     "Rotate PDF pages by 90, 180 or 270 degrees. No signup. Files deleted instantly.",
     "🔄", "Rotate PDF",
     "Rotate PDF pages by 90, 180 or 270 degrees. Apply to all, odd or even pages.",
     "rotate", "/rotate-pdf", "Rotate PDF",
     '`rotated_${files[0].name}`',
     '''<label class="f-label">Rotation Angle</label>
<select class="f-select" id="rotate-angle">
  <option value="90">90° Clockwise</option>
  <option value="180">180° (Upside down)</option>
  <option value="270">270° Counter-clockwise</option>
</select>
<label class="f-label">Apply To</label>
<select class="f-select" id="rotate-pages">
  <option value="all">All pages</option>
  <option value="odd">Odd pages only</option>
  <option value="even">Even pages only</option>
</select>''',
     'fd.append("angle",document.getElementById("rotate-angle").value);fd.append("pages",document.getElementById("rotate-pages").value);',
     None, False),

    ("pdf-to-word.html",
     "PDF to Word", "PDF to Word",
     "Convert PDF documents to editable Microsoft Word .docx files. No signup. Files deleted instantly.",
     "📝", "PDF to Word",
     "Convert PDF to editable Microsoft Word (.docx) with formatting preserved.",
     "pdfword", "/pdf-to-word", "Convert to Word",
     '`${files[0].name.replace(/\\.pdf$/i,"")}.docx`',
     '<div class="notice notice-blue" style="margin-top:.75rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Works best with text-based PDFs. Scanned documents produce plain text.</span></div>',
     "",
     [("Does it preserve formatting?","Yes — headings, paragraphs and basic layout are preserved for text-based PDFs."),
      ("Does it work with scanned PDFs?","Scanned PDFs produce plain text output since there is no embedded text.")], False),

    ("pdf-to-excel.html",
     "PDF to Excel", "PDF to Excel",
     "Extract tables from PDFs into Excel. Smart grouping combines multi-page tables into one sheet. No signup.",
     "📊", "PDF to Excel",
     "Smart table extraction — groups multi-page tables into one sheet automatically.",
     "pdfxl", "/pdf-to-excel", "Convert to Excel",
     '`${files[0].name.replace(/\\.pdf$/i,"")}.xlsx`',
     '''<label class="f-label">Extraction Mode</label>
<select class="f-select" id="pdfxl-mode">
  <option value="smart" selected>Smart — Auto-detect &amp; group tables by headers</option>
  <option value="tables">Tables Only — Extract tables, ignore text</option>
  <option value="text">Text Mode — Extract all text as plain rows</option>
</select>
<div class="notice notice-blue" style="margin-top:.75rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span><strong>Smart grouping:</strong> Tables with matching headers across pages are merged into one sheet automatically.</span></div>''',
     'fd.append("mode",document.getElementById("pdfxl-mode").value);',
     [("How does smart grouping work?","Tables with identical headers across multiple pages are merged into one Excel sheet. Different column structures become separate sheets."),
      ("What if my PDF has no tables?","In Smart mode, text is extracted row by row into a plain sheet."),
      ("Does it work with scanned PDFs?","No — scanned image PDFs have no extractable data.")], False),

    ("pdf-to-jpg.html",
     "PDF to JPG", "PDF to JPG",
     "Convert PDF pages to high-quality JPG images. Choose your DPI. No signup. Files deleted instantly.",
     "🖼️", "PDF to JPG",
     "Convert every PDF page to high-quality JPG images. Download as a ZIP.",
     "pdfjpg", "/pdf-to-jpg", "Convert to JPG",
     '"pdf_images.zip"',
     '''<label class="f-label">Image Quality (DPI)</label>
<select class="f-select" id="pdfjpg-dpi">
  <option value="96">96 DPI — Web quality (smallest)</option>
  <option value="150" selected>150 DPI — Standard quality</option>
  <option value="200">200 DPI — High quality</option>
  <option value="300">300 DPI — Print quality (largest)</option>
</select>''',
     'fd.append("dpi",document.getElementById("pdfjpg-dpi").value);',
     None, False),

    ("jpg-to-pdf.html",
     "Image to PDF", "Image to PDF",
     "Convert JPG, PNG and other images into a PDF document. No signup. Files deleted instantly.",
     "📥", "Image to PDF",
     "Convert JPG, PNG and other image files into a single PDF document.",
     "jpg2pdf", "/jpg-to-pdf", "Convert to PDF",
     '"images.pdf"', "", "",
     None, True),

    ("pdf-to-pptx.html",
     "PDF to PowerPoint", "PDF to PowerPoint",
     "Convert PDF pages to editable PowerPoint slides. No signup. Files deleted instantly.",
     "📽️", "PDF to PowerPoint",
     "Convert PDF pages to PowerPoint slides. Each page becomes a slide.",
     "pdfpptx", "/pdf-to-pptx", "Convert to PowerPoint",
     '`${files[0].name.replace(/\\.pdf$/i,"")}.pptx`',
     "", "",
     None, False),

    ("pdf-to-text.html",
     "PDF to Text", "PDF to Text",
     "Extract raw plain text from any PDF. Perfect for data processing. No signup.",
     "📄", "PDF to Text",
     "Extract raw plain text from any PDF. Perfect for copying content.",
     "pdftext", "/pdf-to-text", "Extract Text",
     '`${files[0].name.replace(/\\.pdf$/i,"")}.txt`',
     "", "",
     None, False),

    ("protect-pdf.html",
     "Lock PDF", "Lock PDF",
     "Add AES-256 password encryption to your PDF. No signup. Files deleted instantly.",
     "🔐", "Lock PDF",
     "Add AES-256 password encryption to your PDF to prevent unauthorized access.",
     "protect", "/protect-pdf", "Lock PDF",
     '`protected_${files[0].name}`',
     '''<label class="f-label">Password</label>
<input class="f-input" id="protect-pwd" type="password" placeholder="Enter a strong password" autocomplete="new-password">
<div class="notice notice-amber" style="margin-top:.75rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Save your password — we cannot recover it. Your PDF cannot be opened without it.</span></div>''',
     'const pwd=document.getElementById("protect-pwd").value;if(!pwd){toast("Please enter a password","error");setBtnState("protect",false,"🔐 Lock PDF");return;}fd.append("password",pwd);',
     None, False),

    ("unlock-pdf.html",
     "Unlock PDF", "Unlock PDF",
     "Remove password protection from your PDF. You must know the password. No signup.",
     "🔓", "Unlock PDF",
     "Remove password protection from your PDF. You must know the current password.",
     "unlock", "/unlock-pdf", "Unlock PDF",
     '`unlocked_${files[0].name}`',
     '''<label class="f-label">Current Password (if any)</label>
<input class="f-input" id="unlock-pwd" type="password" placeholder="Enter current password">''',
     'fd.append("password",document.getElementById("unlock-pwd").value);',
     None, False),

    ("watermark-pdf.html",
     "Watermark PDF", "Watermark PDF",
     "Add a custom text watermark to every page of your PDF. No signup. Files deleted instantly.",
     "🔏", "Watermark PDF",
     "Add a custom text watermark to every page. Control opacity, position and style.",
     "watermark", "/add-watermark", "Add Watermark",
     '`watermarked_${files[0].name}`',
     '''<label class="f-label">Watermark Text</label>
<input class="f-input" id="watermark-text" type="text" placeholder="e.g. CONFIDENTIAL, DRAFT" value="CONFIDENTIAL">
<label class="f-label">Position</label>
<select class="f-select" id="watermark-pos">
  <option value="center" selected>Center (diagonal)</option>
  <option value="bottom-right">Bottom right</option>
  <option value="bottom-center">Bottom center</option>
</select>
<label class="f-label">Opacity</label>
<select class="f-select" id="watermark-opacity">
  <option value="0.1">Very light (10%)</option>
  <option value="0.2" selected>Light (20%)</option>
  <option value="0.4">Medium (40%)</option>
  <option value="0.6">Strong (60%)</option>
</select>''',
     'const wt=document.getElementById("watermark-text").value.trim();if(!wt){toast("Please enter watermark text","error");setBtnState("watermark",false,"🔏 Add Watermark");return;}fd.append("text",wt);fd.append("position",document.getElementById("watermark-pos").value);fd.append("opacity",document.getElementById("watermark-opacity").value);',
     None, False),

    ("add-page-numbers.html",
     "Add Page Numbers", "Add Page Numbers",
     "Automatically add page numbers to every page of your PDF. No signup. Files deleted instantly.",
     "🔢", "Add Page Numbers",
     "Automatically number every page of your PDF. Choose position and format.",
     "pagenums", "/add-page-numbers", "Add Page Numbers",
     '`numbered_${files[0].name}`',
     '''<label class="f-label">Position</label>
<select class="f-select" id="pagenums-pos">
  <option value="bottom-center" selected>Bottom Center</option>
  <option value="bottom-right">Bottom Right</option>
  <option value="top-center">Top Center</option>
  <option value="top-right">Top Right</option>
</select>
<label class="f-label">Format</label>
<select class="f-select" id="pagenums-fmt">
  <option value="number" selected>1, 2, 3…</option>
  <option value="page-of">Page 1 of N</option>
  <option value="roman">i, ii, iii…</option>
</select>
<label class="f-label">Start Number</label>
<input class="f-input" id="pagenums-start" type="number" value="1" min="1">''',
     'fd.append("position",document.getElementById("pagenums-pos").value);fd.append("format",document.getElementById("pagenums-fmt").value);fd.append("start",document.getElementById("pagenums-start").value);',
     None, False),
]

for args in pages:
    filename = args[0]
    html = tool_page(
        title=args[1], seo_title=args[2], seo_desc=args[3],
        icon=args[4], heading=args[5], subtext=args[6],
        tool_id=args[7], endpoint=args[8], btn_label=args[9],
        download_name=args[10], extra_fields=args[11], extra_script=args[12],
        faqs=args[13], multi=args[14]
    )
    with open(os.path.join(OUT, filename), "w") as f:
        f.write(html)
    print(f"✅ {filename}")

# ── Placeholder pages for new tools ───────────────────────────────────
placeholder_pages = [
    ("word-to-pdf.html", "Word to PDF", "📄", "word2pdf", "/jpg-to-pdf"),
    ("excel-to-pdf.html", "Excel to PDF", "📋", "excel2pdf", "/jpg-to-pdf"),
    ("delete-pages.html", "Delete Pages", "🗑️", "delpages", "/split-pdf"),
    ("reorder-pages.html", "Reorder Pages", "↕️", "reorder", "/split-pdf"),
    ("repair-pdf.html", "Repair PDF", "🔧", "repair", "/compress-pdf"),
    ("optimize-pdf.html", "Optimize PDF", "⚡", "optimize", "/compress-pdf"),
    ("sign-pdf.html", "Sign PDF", "✍️", "signpdf", "/compress-pdf"),
    ("invoice-to-excel.html", "Invoice to Excel", "🧾", "invoice2xl", "/pdf-to-excel"),
    ("bank-statement.html", "Bank Statement to Excel", "🏦", "bankstmt", "/pdf-to-excel"),
]
for filename, title, icon, tid, endpoint in placeholder_pages:
    html = tool_page(
        title=title, seo_title=title, seo_desc=f"{title} — PDFPilot. Free, no signup.",
        icon=icon, heading=title, subtext=f"Use PDFPilot to {title.lower()} instantly. Free and secure.",
        tool_id=tid, endpoint=endpoint, btn_label=f"Process File",
        download_name='"output.pdf"', extra_fields="", extra_script="",
        faqs=None, multi=False
    )
    with open(os.path.join(OUT, filename), "w") as f:
        f.write(html)
    print(f"✅ {filename} (placeholder)")

print("\n✅ All tool pages generated.")
