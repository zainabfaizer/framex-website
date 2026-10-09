// ================= FRAME X MOTION SYSTEM =================
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isDesktop = window.matchMedia("(min-width: 961px)");
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* Hero visual: gentle tilt that follows the cursor (desktop with a mouse only) */
  function initHeroTilt() {
    const hero = document.querySelector(".hero");
    const visual = document.querySelector(".fx-visual");
    if (!hero || !visual) return;
    if (reduceMotion.matches || !isDesktop.matches || !hasMouse.matches) return;

    let frame = 0;

    hero.addEventListener("pointermove", (event) => {
      if (frame) return; // at most one update per animation frame
      frame = requestAnimationFrame(() => {
        const box = hero.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
        const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
        visual.style.setProperty("--fx-px", x.toFixed(3));
        visual.style.setProperty("--fx-py", y.toFixed(3));
        frame = 0;
      });
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      visual.style.setProperty("--fx-px", 0);
      visual.style.setProperty("--fx-py", 0);
    });
  }

    /* Reusable trigger: adds .is-in once when a [data-fx-inview] element scrolls into view */
  function initInView() {
    const items = document.querySelectorAll("[data-fx-inview], .section__head");
    if (!items.length) return;

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    document.documentElement.classList.add("fx-ready");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    items.forEach((el) => observer.observe(el));
  }
    /* Footer quote: split into words so they can appear one by one */
  function initFooterQuote() {
    const quote = document.querySelector(".site-footer__quote");
    if (!quote || reduceMotion.matches || !("IntersectionObserver" in window)) return;

    const text = quote.textContent.trim();

    // Screen readers get the full sentence; the animated words are hidden from them
    const readable = document.createElement("span");
    readable.className = "visually-hidden";
    readable.textContent = text;

    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    text.split(/\s+/).forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "fx-word";
      span.style.setProperty("--w", index);
      span.textContent = word;
      visual.append(span, " ");
    });

    quote.replaceChildren(readable, visual);
    quote.setAttribute("data-fx-inview", "");
  }

    /* Roadmap: glowing marker that travels with the tip of the gold line */
  function initRoadmapMarker() {
    const roadmap = document.querySelector("[data-roadmap]");
    if (!roadmap || reduceMotion.matches) return;

    const dot = document.createElement("span");
    dot.className = "fx-roadmap__dot";
    dot.setAttribute("aria-hidden", "true");
    roadmap.append(dot);
  }

    /* Cursor spotlight: a soft gold glow follows the mouse inside cards (mouse devices only) */
  function initSpotlight() {
    if (reduceMotion.matches || !hasMouse.matches) return;

    const selector = ".avatar-card, .pipeline__stage, .placeholder-card, .fit__col, .roadmap__item";
    document.querySelectorAll(selector).forEach((host) => {
      host.classList.add("fx-spot-host");
      const spot = document.createElement("span");
      spot.className = "fx-spot";
      spot.setAttribute("aria-hidden", "true");
      host.append(spot);
    });

    let frame = 0;
    document.addEventListener("pointermove", (event) => {
      const host = event.target.closest?.(".fx-spot-host");
      if (!host || frame) return; // at most one update per animation frame
      frame = requestAnimationFrame(() => {
        const box = host.getBoundingClientRect();
        host.style.setProperty("--fx-mx", `${event.clientX - box.left}px`);
        host.style.setProperty("--fx-my", `${event.clientY - box.top}px`);
        frame = 0;
      });
    }, { passive: true });
  }

  initHeroTilt();
  initFooterQuote();
  initInView();
  initRoadmapMarker();
   initSpotlight();
})();