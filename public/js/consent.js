// Egyszerű szükséges-cookie banner logika
console.log("consent loaded");

document.addEventListener("DOMContentLoaded", function () {
    const key = "cookieConsent_basic_v1";
    const banner = document.getElementById("cookie-banner");
    const btn = document.getElementById("cookie-ok");

    if (!localStorage.getItem(key)) {
        banner && (banner.style.display = "block");
    }

    btn && btn.addEventListener("click", () => {
        localStorage.setItem(key, "accepted");
        banner && (banner.style.display = "none");
    });

    console.log("consent loaded"); // ellenőrzéshez
});

