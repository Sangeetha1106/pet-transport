/* ==========================================================
   Sri Yogi Pet Transport – main.js
   ========================================================== */

/* ----------  EDIT YOUR BUSINESS DETAILS HERE  ---------- */
const CONFIG = {
  whatsapp: "919999999999",            // country code + number, no "+" or spaces
  phoneDisplay: "+91 99999 99999",
  email: "hello@sriyogipettransport.com",
  defaultMessage: "Hi Sri Yogi Pet Transport, I would like to enquire about pet transportation."
};
/* ------------------------------------------------------- */

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Contact links ---------- */
  const waBase = `https://wa.me/${CONFIG.whatsapp}`;
  const waUrl = (text) => `${waBase}?text=${encodeURIComponent(text || CONFIG.defaultMessage)}`;
  $$("[data-wa-link]").forEach(a => { a.href = waUrl(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-text],[data-phone-text]").forEach(el => el.textContent = CONFIG.phoneDisplay);
  $$("[data-phone-link]").forEach(a => a.href = `tel:+${CONFIG.whatsapp}`);
  $$("[data-mail-link]").forEach(a => a.href = `mailto:${CONFIG.email}`);
  $$("[data-mail-text]").forEach(el => el.textContent = CONFIG.email);
  const yr=$("#year"); if(yr) yr.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  const pre = $("#preloader");
  const hidePre = () => pre && pre.classList.add("is-done");
  window.addEventListener("load", () => setTimeout(hidePre, 700));
  setTimeout(hidePre, 3500); // safety

  /* ---------- Nav ---------- */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks"), toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-show", y > 700);
    updateTimeline();
    parallax(y);
  };
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false");
  }));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---------- Hero slider ---------- */
  const slides = $$(".hero__slide");
  let si = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[si].classList.remove("is-active");
      si = (si + 1) % slides.length;
      // restart ken-burns animation
      const next = slides[si]; next.style.animation = "none"; void next.offsetWidth; next.style.animation = "";
      next.classList.add("is-active");
    }, 6500);
  }

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.01, rootMargin: "0px 0px 60px 0px" });
  $$(".reveal, .reveal-img").forEach(el => revealObs.observe(el));

  // Immediate check for elements in/near viewport on load
  const triggerVisible = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    $$(".reveal:not(.is-visible), .reveal-img:not(.is-visible)").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh + 60 && r.bottom > -40) el.classList.add("is-visible");
    });
  };
  triggerVisible();
  window.addEventListener("DOMContentLoaded", triggerVisible);
  window.addEventListener("load", triggerVisible);

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1600, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      reduce ? (el.textContent = target) : requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => countObs.observe(el));

  /* ---------- 3D tilt on service cards (desktop) ---------- */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".tilt").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Parallax glow ---------- */
  const glow = $(".hero__glow");
  function parallax(y) { if (glow && !reduce && y < 1200) glow.style.translate = `0 ${y * 0.18}px`; }

  /* ---------- Timeline progress ---------- */
  const tl = $(".timeline"), fill = $("#timelineFill");
  function updateTimeline() {
    if (!tl || !fill) return;
    const r = tl.getBoundingClientRect(), vh = window.innerHeight;
    const p = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1);
    fill.style.height = (p * 100) + "%";
  }

  /* ---------- Routes explorer ---------- */
  const ROUTES = {
    train: { icon: "#i-train", info: "Train · Railway-to-railway & Door-to-door", list: [["Chennai","Mumbai"],["Chennai","Delhi"],["Bangalore","Kolkata"],["Coimbatore","Hyderabad"],["Chennai","Kochi"],["Madurai","Bangalore"],["Chennai","Bangalore"],["Bangalore","Delhi"]] },
    air:   { icon: "#i-plane", info: "Airport Flight · Domestic & International", list: [["India","USA"],["India","Canada"],["India","UK"],["India","UAE"],["India","Australia"],["India","Singapore"],["Chennai","Delhi"],["Bangalore","Mumbai"]] }
  };
  const listEl = $("#routeList"), path = $("#routePath"), mover = $("#mover"), moverIcon = $("#moverIcon");
  let mode = "train", raf, pathLen = 0;

  function renderRoutes() {
    listEl.innerHTML = "";
    ROUTES[mode].list.forEach(([a, b], i) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "route-chip" + (i === 0 ? " is-active" : "");
      chip.style.animationDelay = (i * 60) + "ms";
      chip.innerHTML = `<svg width="16" height="16"><use href="#i-pin"/></svg>${a} → ${b}`;
      chip.addEventListener("click", () => selectRoute(chip, a, b));
      listEl.appendChild(chip);
    });
    const [a, b] = ROUTES[mode].list[0];
    setMap(a, b);
  }
  function selectRoute(chip, a, b) {
    $$(".route-chip", listEl).forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    setMap(a, b);
  }
  function setMap(a, b) {
    $("#mapFrom").textContent = a; $("#mapTo").textContent = b;
    $("#mapEta").textContent = `${a} → ${b}`;
    $("#mapInfo").textContent = ROUTES[mode].info;
    moverIcon.setAttribute("href", ROUTES[mode].icon);
  }
  $$(".route-mode").forEach(btn => btn.addEventListener("click", () => {
    $$(".route-mode").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active"); mode = btn.dataset.mode; renderRoutes();
  }));

  // decorative dot-grid on the map
  const dots = $(".map-dots");
  if (dots) {
    let s = "";
    for (let x = 20; x < 520; x += 26) for (let y = 20; y < 340; y += 26) s += `<circle cx="${x}" cy="${y}" r="1.6"/>`;
    dots.innerHTML = s;
  }
  function animateMover() {
    if (!path) return;
    pathLen = path.getTotalLength();
    const dur = 5200;
    const start = performance.now();
    const loop = (t) => {
      const p = ((t - start) % dur) / dur;
      const eased = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const pt = path.getPointAtLength(eased * pathLen);
      mover.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) { const pt = path.getPointAtLength(pathLen * .5); mover.setAttribute("transform", `translate(${pt.x} ${pt.y})`); }
    else raf = requestAnimationFrame(loop);
  }
  if (listEl) { renderRoutes(); animateMover(); }

  /* ---------- Service buttons -> prefill form ---------- */
  const serviceSelect = $("#serviceSelect");
  $$("[data-service]").forEach(a => a.addEventListener("click", () => {
    if (!serviceSelect) return;
    const val = a.dataset.service;
    const opt = [...serviceSelect.options].find(o => o.textContent.trim() === val);
    if (opt) serviceSelect.value = opt.value || opt.textContent;
  }));

  /* ---------- Enquiry form -> WhatsApp ---------- */
  const form = $("#enquiryForm"), note = $("#formNote");
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    let ok = true;
    ["name", "phone", "service"].forEach(n => {
      const f = form.elements[n].closest(".field");
      const bad = !String(d[n] || "").trim() || (n === "phone" && String(d[n]).replace(/\D/g, "").length < 10);
      f.classList.toggle("has-error", bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = "Please fill name, a valid phone number and the service."; note.style.color = "#d64545"; return; }
    note.style.color = ""; note.textContent = "Opening WhatsApp with your enquiry…";
    const lines = [
      "*New Enquiry – Sri Yogi Pet Transport*",
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      `Service: ${d.service}`,
      d.from || d.to ? `Route: ${d.from || "-"} → ${d.to || "-"}` : "",
      `Pet: ${d.pet}${d.breed ? " (" + d.breed + ")" : ""}`,
      d.date ? `Travel date: ${d.date}` : "",
      d.msg ? `Message: ${d.msg}` : ""
    ].filter(Boolean).join("\n");
    window.open(waUrl(lines), "_blank", "noopener");
  });
  if (form) $$(".field input,.field select", form).forEach(el => el.addEventListener("input", () => el.closest(".field").classList.remove("has-error")));

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
