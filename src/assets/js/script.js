(function () {
    "use strict";

    const navToggle = document.querySelector(".nav__toggle");
    const navLinks = document.querySelector(".nav__links");

    function closeNav() {
        if (!navToggle || !navLinks) return;
        navToggle.classList.remove("active");
        navLinks.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const isOpen = navToggle.classList.toggle("active");
            navLinks.classList.toggle("active", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeNav);
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".nav")) closeNav();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && navLinks.classList.contains("active")) {
                closeNav();
                navToggle.focus();
            }
        });
    }

    // In-page anchors: offset by the sticky header. Native smooth scrolling is
    // already on via CSS, so only the offset needs handling here.
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (event) {
            const id = anchor.getAttribute("href");
            if (id === "#") return;
            const target = document.querySelector(id);
            if (!target) return;
            event.preventDefault();
            const header = document.querySelector(".header");
            const offset = header ? header.offsetHeight : 0;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - offset,
                behavior: "smooth",
            });
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        });
    });

    const scrollToTopBtn = document.getElementById("scrollToTop");
    if (scrollToTopBtn) {
        let ticking = false;
        const update = function () {
            const show = window.scrollY > 300;
            scrollToTopBtn.classList.toggle("visible", show);
            scrollToTopBtn.hidden = !show;
            ticking = false;
        };
        window.addEventListener(
            "scroll",
            function () {
                if (!ticking) {
                    ticking = true;
                    window.requestAnimationFrame(update);
                }
            },
            { passive: true }
        );
        update();

        scrollToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const skip = document.querySelector(".skip-link");
            if (skip) skip.focus();
        });
    }
})();
