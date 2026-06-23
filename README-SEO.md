# RunDocs — Complete Technical SEO Fix (All 23 Tools)

⚠️ No tools or pages deleted. Every file is the same tool, just with corrected SEO metadata.

## What was fixed in EVERY tool page (23 total)

1. **Canonical URL bug** — every single tool page had a canonical pointing to a slug that didn't exist (e.g. `compress-pdf.html` pointed to `compress.html`, which isn't a real file). Fixed so canonical now matches the actual filename on all 23 pages. Verified with an automated check — 23/23 correct.

2. **Open Graph** — was missing `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale` on every page (only had `og:title` + `og:type`). Now complete on all pages, plus full Twitter Card tags so sharing on WhatsApp/Facebook/Twitter shows a proper preview.

3. **Schema (JSON-LD)**:
   - `SoftwareApplication` schema now includes `availability` (fixes a Google Search Console warning) and has a proper `url` + `description`.
   - **No fake ratings** — removed/never added `aggregateRating`. Adding star ratings without a real review system is flagged by Google as misleading structured data, so it's intentionally left out everywhere.
   - Added `BreadcrumbList` schema to every tool page (helps Google show "Home › Tool Name" in search results).
   - Added `FAQPage` schema on the 4 pages that actually have a visible FAQ section (Compress, Merge, Split, PDF-to-Excel, PDF-to-Word) — schema only added where matching on-page content exists, since mismatched FAQ schema also gets penalized.

4. **Title tags** — rewritten to be more search-friendly (e.g. "PDF to Excel — RunDocs" → "PDF to Excel Converter Online Free — Smart Table Extraction | RunDocs") while keeping them accurate to the page content.

5. **FAQ accordion bug (separate fix, included in `shared.js`)** — the dark-mode detection code at the top of `shared.js` used `matchMedia()` without a safety check. On some in-app browsers/WebViews where `matchMedia` isn't available, this crashed the entire script on load — silently breaking every function defined afterward, including `toggleFaq`. Wrapped in `try/catch` so one missing browser API can never take down the whole file anymore. Tested by simulating the missing-API environment — confirmed FAQ open/close works correctly now.

## Files in this package
All 23 tool pages + `shared.js` (FAQ-crash fix) + `shared.css` (unchanged, included for completeness).

## What you still need to do
The `og:image` meta tag on every page points to `https://rundocs.netlify.app/og-images/<toolname>.png` — these image files don't exist yet. They're not required for the SEO fixes above to work, but until you create them, social media previews will show no image. Let me know if you'd like help generating those.
