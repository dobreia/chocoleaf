document.addEventListener("DOMContentLoaded", function () {
    const KEY = "cookieConsent_v1"; // ha változik a szöveg/kategória: v1 -> v2
    const defaultState = { necessary: true, analytics: false, marketing: false, ts: null };

    const $ = id => document.getElementById(id);
    const els = {
        banner: $("cookie-banner"),
        modal: $("cookie-modal"),
        accept: $("cookie-accept"),
        reject: $("cookie-reject"),
        customize: $("cookie-customize"),
        save: $("cookie-save"),
        cancel: $("cookie-cancel"),
        openSettings: $("open-cookie-settings"),
        chkAnalytics: $("consent-analytics"),
        chkMarketing: $("consent-marketing"),
    };

    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } };
    const save = s => localStorage.setItem(KEY, JSON.stringify({ ...s, ts: new Date().toISOString() }));

    function showBanner() { els.banner.style.display = "flex"; }
    function hideBanner() { els.banner.style.display = "none"; }
    function openModal() {
        const s = read() || defaultState;
        els.chkAnalytics.checked = !!s.analytics;
        els.chkMarketing.checked = !!s.marketing;
        els.modal.style.display = "block";
    }
    function closeModal() { els.modal.style.display = "none"; }

    // Consenthez kötött scriptek aktiválása:
    // <script type="plain/text" data-consent="analytics" data-src="..."></script>
    // vagy inline: <script type="plain/text" data-consent="marketing"> ... </script>
    function applyConsent(consent) {
        const pending = document.querySelectorAll('script[type="plain/text"][data-consent]:not([data-loaded])');
        pending.forEach(node => {
            const cat = node.getAttribute("data-consent");
            if (consent[cat]) {
                const real = document.createElement("script");
                const src = node.getAttribute("data-src");
                if (src) { real.src = src; real.async = true; }
                else { real.text = node.textContent; }
                node.setAttribute("data-loaded", "1");
                node.parentNode.insertBefore(real, node.nextSibling);
            }
        });
    }

    els.accept?.addEventListener("click", () => {
        const s = { ...defaultState, analytics: true, marketing: true };
        save(s); hideBanner(); applyConsent(s);
    });
    els.reject?.addEventListener("click", () => {
        const s = { ...defaultState, analytics: false, marketing: false };
        save(s); hideBanner();
    });
    els.customize?.addEventListener("click", openModal);
    els.cancel?.addEventListener("click", closeModal);
    els.save?.addEventListener("click", () => {
        const s = { ...defaultState, analytics: !!els.chkAnalytics.checked, marketing: !!els.chkMarketing.checked };
        save(s); closeModal(); hideBanner(); applyConsent(s);
    });
    els.openSettings?.addEventListener("click", openModal);

    const saved = read();
    if (!saved) showBanner(); else applyConsent(saved);
});
