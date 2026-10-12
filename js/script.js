/* ==========================================================================
   FrameX Prime — script.js
   Each feature is a small init function. Animations are added in Stage 8.
   ========================================================================== */
(() => {
    "use strict";

    const config = window.FRAMEX_CONFIG || {};
    const MOBILE_NAV_QUERY = "(max-width: 960px)";

    /* Header: add a background once the page has scrolled -------------------- */
    function initHeader() {
        const header = document.querySelector("[data-header]");
        if (!header || !("IntersectionObserver" in window)) return;

        // A 1px sentinel at the top of the page avoids a scroll event listener.
        const sentinel = document.createElement("div");
        sentinel.setAttribute("aria-hidden", "true");
        sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
        document.body.prepend(sentinel);

        new IntersectionObserver(([entry]) => {
            header.classList.toggle("is-scrolled", !entry.isIntersecting);
        }).observe(sentinel);
    }

    /* Mobile navigation ------------------------------------------------------ */
    function initNav() {
        const toggle = document.querySelector("[data-nav-toggle]");
        const nav = document.querySelector("[data-nav]");
        if (!toggle || !nav) return;

        const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
        const setOpen = (open) => toggle.setAttribute("aria-expanded", String(open));

        toggle.addEventListener("click", () => setOpen(!isOpen()));

        // Close after choosing a link
        nav.addEventListener("click", (event) => {
            if (event.target.closest("a")) setOpen(false);
        });

        // Close with Escape and return focus to the button
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isOpen()) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Close when clicking outside the header
        document.addEventListener("click", (event) => {
            if (isOpen() && !event.target.closest("[data-header]")) setOpen(false);
        });

        // Reset when the viewport grows to desktop
        window.matchMedia(MOBILE_NAV_QUERY).addEventListener("change", (query) => {
            if (!query.matches) setOpen(false);
        });
    }

    /* Booking links and optional embed (one URL, set in js/config.js) -------- */
    function initBooking() {
        const url = config.bookingUrl;
        if (!url) return;

        const isExternal = !url.startsWith("#");
        document.querySelectorAll("[data-booking-link]").forEach((link) => {
            link.setAttribute("href", url);
            if (isExternal) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
                link.setAttribute("aria-label", `${link.textContent.trim()} (opens in a new tab)`);
            }
        });

        const slot = document.querySelector("[data-booking-embed]");
        if (slot && config.embedBooking && isExternal) {
            const frame = document.createElement("iframe");
            frame.src = url;
            frame.title = "Book your free strategy call";
            frame.loading = "lazy";
            frame.style.cssText = "width:100%;min-height:42rem;border:0";
            slot.replaceChildren(frame);
            slot.removeAttribute("data-placeholder");
        }
    }

    /* Footer year ------------------------------------------------------------ */
    function initFooterYear() {
        document.querySelectorAll("[data-year]").forEach((el) => {
            el.textContent = new Date().getFullYear();
        });
    }

    /* Hero intro: split headline into words, then play on load --------------- */
    function splitWords(element) {
        let index = 0;

        const build = (node) => {
            const fragment = document.createDocumentFragment();
            node.childNodes.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    child.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
                        const outer = document.createElement("span");
                        outer.className = "split-word";
                        outer.setAttribute("aria-hidden", "true");
                        const inner = document.createElement("span");
                        inner.className = "split-word__inner";
                        inner.style.setProperty("--i", index++);
                        inner.textContent = word;
                        outer.append(inner);
                        fragment.append(outer, " ");
                    });
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const clone = child.cloneNode(false); // keeps classes such as .text-gold
                    clone.append(build(child));
                    fragment.append(clone);
                }
            });
            return fragment;
        };
        // Screen readers get the full sentence; the animated words are hidden from them
        const readable = document.createElement("span");
        readable.className = "visually-hidden";
        readable.textContent = element.textContent.replace(/\s+/g, " ").trim();

        const visual = document.createElement("span");
        visual.setAttribute("aria-hidden", "true");
        visual.append(build(element));

        element.replaceChildren(readable, visual);
    }

    function initHero() {
        const hero = document.querySelector(".hero");
        if (!hero) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const title = hero.querySelector("[data-hero-split]");
        if (title) splitWords(title);

        // Hand hover transitions back to the CTA once its intro has finished
        hero.querySelectorAll("[data-hero]").forEach((el) => {
            el.addEventListener("transitionend", function done(event) {
                if (event.propertyName !== "opacity") return;
                el.removeEventListener("transitionend", done);
                el.removeAttribute("data-hero");
            });
        });

        // Start once fonts are ready (but never wait more than 700ms)
        const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
        Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 700))]).then(() => {
            requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-loaded")));
        });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => {
                hero.classList.toggle("is-offscreen", !entry.isIntersecting);
            }).observe(hero);
        }
    }

    /* Booking form: frontend prototype. The browser checks every required field first;
    nothing is sent or stored. A valid form moves on to the booking page. */
    function initBookingForm() {
        const form = document.querySelector("[data-booking-form]");
        if (!form) return;
        const status = form.querySelector("[data-form-status]");
        const nextPage = config.bookingPageUrl || "booking.html";

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (status) status.textContent = "Details complete. Taking you to the next step…";
            window.location.assign(nextPage);
        });
    }

    /* Scroll reveals (staggered by arrival order, not by DOM position) ------- */
    function initReveal() {
        const items = document.querySelectorAll("[data-reveal]");
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduceMotion || !("IntersectionObserver" in window)) {
            items.forEach((el) => el.removeAttribute("data-reveal"));
            return;
        }

        // Once revealed, drop the attributes so normal hover styles take over.
        const finish = (el) => {
            el.removeAttribute("data-reveal");
            el.classList.remove("is-visible");
            el.style.removeProperty("--reveal-delay");
        };

        const observer = new IntersectionObserver((entries) => {
            entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {
                const el = entry.target;
                observer.unobserve(el);
                el.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 90}ms`);
                el.classList.add("is-visible");
                el.addEventListener("transitionend", function done(event) {
                    if (event.target !== el || event.propertyName !== "opacity") return;
                    el.removeEventListener("transitionend", done);
                    finish(el);
                });
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

        items.forEach((el) => observer.observe(el));
    }

    /* Roadmap line draws once when it scrolls into view ---------------------- */
    function initRoadmap() {
        const roadmap = document.querySelector("[data-roadmap]");
        if (!roadmap || !("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            roadmap.classList.add("is-drawn");
            observer.disconnect();
        }, { threshold: 0.15 });
        observer.observe(roadmap);
    }

    /* FAQ: native <details> stays the source of truth; we only animate it ---- */
    function initFaq() {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        document.querySelectorAll("[data-faq] .faq__item").forEach((item) => {
            const summary = item.querySelector("summary");
            const panel = item.querySelector(".faq__answer");
            let animation = null;

            summary.addEventListener("click", (event) => {
                if (reduceMotion.matches || !panel.animate) return; // browser handles it
                event.preventDefault();
                if (animation) return; // ignore clicks mid-animation

                const opening = !item.open;
                if (opening) item.open = true;

                const frames = [
                    { height: "0px", opacity: 0 },
                    { height: `${panel.offsetHeight}px`, opacity: 1 },
                ];
                if (!opening) frames.reverse();

                panel.style.overflow = "hidden";
                animation = panel.animate(frames, { duration: 350, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
                animation.onfinish = () => {
                    if (!opening) item.open = false;
                    panel.style.overflow = "";
                    animation = null;
                };
            });
        });
    }

    initHeader();
    initNav();
    initBooking();
    initBookingForm();
    initFooterYear();
    initHero();
    initReveal();
    initRoadmap();
    initFaq();



    document.documentElement.setAttribute("data-ready", ""); // tells the head failsafe we started
})();