# RunDocs — Complete Real Icons Update

⚠️ **No tools or pages were deleted.** Every file here is either a full rewrite (emoji → real icons) or stayed exactly as before.

## What to do
**Replace these 28 files in your Netlify project with the ones in this zip** (same filenames — just overwrite):

```
about.html              jpg-to-pdf.html          repair-pdf.html
add-page-numbers.html   merge-pdf.html           rotate-pdf.html
ai-tools.html           optimize-pdf.html        shared.css   ← also updated
bank-statement.html     pdf-to-excel.html        shared.js    ← also updated
blog.html               pdf-to-jpg.html          sign-pdf.html
compress-pdf.html       pdf-to-pptx.html         split-pdf.html
contact.html            pdf-to-text.html         unlock-pdf.html
delete-pages.html       pdf-to-word.html         watermark-pdf.html
excel-to-pdf.html       protect-pdf.html         word-to-pdf.html
index.html
invoice-to-excel.html
```

## Files NOT included (because nothing needed to change in them)
`config.js`, `netlify.toml`, `robots.txt`, `sitemap.xml`, `privacy.html`, `terms.html`, `main.py`, `requirements.txt`, `.replit` — keep your existing versions of these, they're untouched.

## What changed
1. **Every page** now loads the Tabler Icons font (one extra `<link>` tag in `<head>`)
2. **Every tool page's** hero icon and upload-zone icon is now a real icon matching that tool (e.g. Compress PDF → magnifier-minus icon, not 🗜️)
3. **`shared.js`** — nav menu, mega menu, mobile menu, footer badge, toasts, and file chips now render real icons instead of emoji
4. **`shared.css`** — added the new icon-sizing/coloring rules at the top; all your original styles below are untouched
5. **`index.html`** — homepage's 8 tool cards + 4 trust cards now use real icons
6. **`about.html`** — the 4 value cards now use real icons
7. Bonus: this package also includes the previous round of fixes (word-to-pdf/excel-to-pdf/delete-pages/reorder-pages/sign-pdf calling the correct API endpoints, the WhatsApp Pro button in contact.html, and the real blog articles) — so if you haven't applied those yet, you get them here too.

## After uploading
Hard-refresh your browser (Ctrl+Shift+R) once Netlify redeploys, so the new icon font isn't served from cache. Every tool icon across the whole site should now look crisp and identical on any device.
