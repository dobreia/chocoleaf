document.addEventListener("DOMContentLoaded", function () {
    const KEY = "cookieConsent_v1";
    const defaultState = { necessary: true, analytics: false, marketing: false, ts: null };

    const $ = id => document.getElementById(id);
    const els = {
        banner: $("cookie-banner"),
        modal: $("cookie-modal"),

        // banner gombok
        acceptAll: $("cookie-accept-all"),
        reject: $("cookie-reject"),
        customize: $("cookie-customize"),

        // modal gombok
        modalSave: $("cookie-modal-save"),
        modalCancel: $("cookie-modal-cancel"),
        modalAcceptAll: $("cookie-modal-accept-all"),

        // checkboxok
        chkAnalytics: $("consent-analytics"),
        chkMarketing: $("consent-marketing"),

        // sarokban lévő beállítás gomb
        openSettings: $("open-cookie-settings"),
    };

    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
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

    // --- Banner gombok ---
    els.acceptAll?.addEventListener("click", () => {
        const s = { necessary: true, analytics: true, marketing: true };
        save(s); hideBanner(); applyConsent(s);
    });

    els.reject?.addEventListener("click", () => {
        const s = { ...defaultState, analytics: false, marketing: false };
        save(s); hideBanner();
    });

    els.customize?.addEventListener("click", openModal);

    // --- Modal gombok ---
    els.modalSave?.addEventListener("click", () => {
        const s = {
            ...defaultState,
            analytics: !!els.chkAnalytics.checked,
            marketing: !!els.chkMarketing.checked
        };
        save(s); closeModal(); hideBanner(); applyConsent(s);
    });

    els.modalCancel?.addEventListener("click", closeModal);

    els.modalAcceptAll?.addEventListener("click", () => {
        // bepipálja a checkboxokat vizuálisan is
        els.chkAnalytics.checked = true;
        els.chkMarketing.checked = true;

        const s = { necessary: true, analytics: true, marketing: true };
        save(s); closeModal(); hideBanner(); applyConsent(s);
    });

    // --- Sarokban lévő beállítás gomb ---
    els.openSettings?.addEventListener("click", openModal);

    // --- Betöltéskor ---
    const saved = read();

    if (!saved) {
        // Új látogató: banner látszik, lebegő gomb rejtve
        showBanner();
        els.openSettings.style.display = "none";
    } else {
        // Már döntött: banner rejtve, gomb látszik
        hideBanner();
        els.openSettings.classList.add("show");
        applyConsent(saved);
    }

});
