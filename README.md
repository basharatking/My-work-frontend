# RunDocs Frontend

Static frontend for RunDocs — deploy on Netlify in one click.

## Quick Deploy to Netlify

1. Push this folder to GitHub
2. Go to netlify.com → New Site → Import from GitHub
3. Build command: leave blank
4. Publish directory: `.`
5. Click Deploy

## Configuration

Edit `config.js` and set your backend URL:

```js
window.RUNDOCS_CONFIG = {
  API_BASE: "https://your-replit-backend.replit.app",
  FREE_LIMIT_MB: 25,
  BRAND: "RunDocs",
  VERSION: "1.0.0",
};
```

## File Structure

```
rundocs-frontend/
├── index.html              ← Homepage
├── ai-tools.html           ← AI tools page
├── compress-pdf.html
├── merge-pdf.html
├── split-pdf.html
├── rotate-pdf.html
├── pdf-to-word.html
├── pdf-to-excel.html
├── pdf-to-jpg.html
├── jpg-to-pdf.html
├── pdf-to-pptx.html
├── pdf-to-text.html
├── protect-pdf.html
├── unlock-pdf.html
├── watermark-pdf.html
├── add-page-numbers.html
├── word-to-pdf.html
├── excel-to-pdf.html
├── delete-pages.html
├── reorder-pages.html
├── repair-pdf.html
├── optimize-pdf.html
├── sign-pdf.html
├── invoice-to-excel.html
├── bank-statement.html
├── about.html
├── contact.html
├── privacy.html
├── terms.html
├── shared.css              ← All styles
├── shared.js               ← Nav, footer, utilities
├── config.js               ← API URL config
├── netlify.toml            ← Netlify routing
├── robots.txt
└── sitemap.xml
```

## Branding

All branding is RunDocs. Zero traces of old names.
To change brand name: edit `config.js` BRAND field
and update `shared.js` buildNav() / buildFooter().
