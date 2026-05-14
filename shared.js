document.addEventListener("DOMContentLoaded", () => {
    // Logo and Title update
    const brand = window.CATCHPDF_CONFIG.BRAND_NAME || "CatchPDF";
    document.title = document.title.replace("JasonPDF", brand);
    
    // Dynamic Footer
    const footer = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.style.padding = '2rem';
    footer.innerHTML = `<p>© ${new Date().getFullYear()} ${brand}. All files deleted after processing.</p>`;
    document.body.appendChild(footer);
});
