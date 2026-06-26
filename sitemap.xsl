<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>RunDocs — Sitemap</title>
<meta name="robots" content="noindex"/>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#FFFFFF;color:#0A0F1E;margin:0;padding:2.5rem 1.5rem;}
  .wrap{max-width:820px;margin:0 auto;}
  .brand{display:flex;align-items:center;gap:9px;margin-bottom:1.5rem;}
  .brand-mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#4F6EF7,#6B85FF);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;font-family:Georgia,serif;}
  .brand-name{font-size:17px;font-weight:700;}
  .brand-name span{color:#4F6EF7;}
  h1{font-size:22px;margin:0 0 4px;letter-spacing:-.3px;}
  .sub{color:#8B91AA;font-size:13.5px;margin-bottom:1.75rem;}
  table{width:100%;border-collapse:collapse;font-size:13.5px;border:1px solid #E4E7F2;border-radius:10px;overflow:hidden;}
  th{text-align:left;padding:11px 14px;background:#EEF1FF;color:#4F6EF7;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em;}
  td{padding:11px 14px;border-top:1px solid #E4E7F2;vertical-align:middle;}
  tr:hover td{background:#F7F8FC;}
  a{color:#161B30;text-decoration:none;font-weight:500;}
  a:hover{color:#4F6EF7;text-decoration:underline;}
  .pill{display:inline-block;padding:2px 9px;border-radius:100px;background:#F0FDF4;color:#22C55E;font-size:11.5px;font-weight:600;}
  .pri{color:#8B91AA;font-variant-numeric:tabular-nums;}
  footer{margin-top:1.5rem;font-size:12px;color:#8B91AA;}
</style>
</head>
<body>
<div class="wrap">
  <div class="brand">
    <div class="brand-mark">R</div>
    <div class="brand-name">Run<span>Docs</span></div>
  </div>
  <h1>XML Sitemap</h1>
  <p class="sub"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> pages submitted for search engine indexing</p>
  <table>
    <tr><th>URL</th><th>Change Frequency</th><th>Priority</th></tr>
    <xsl:for-each select="sitemap:urlset/sitemap:url">
    <tr>
      <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
      <td><span class="pill"><xsl:value-of select="sitemap:changefreq"/></span></td>
      <td class="pri"><xsl:value-of select="sitemap:priority"/></td>
    </tr>
    </xsl:for-each>
  </table>
  <footer>This is an XML sitemap, meant for search engines — it lists the pages on rundocs.netlify.app.</footer>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
