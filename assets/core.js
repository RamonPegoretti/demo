/* Shared engine for all designs: reads window.SITE and fills the page.
   Designs only provide HTML hooks (data-*) and CSS. */
(function () {
  const S = window.SITE;
  if (!S) return;
  const L = {
    it: { days: ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"], short: ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"], closed: "Chiuso", openNow: "Aperto ora", closedNow: "Chiuso ora", until: "fino alle", opens: "apre alle", opensDay: "riapre", },
    de: { days: ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"], short: ["So","Mo","Di","Mi","Do","Fr","Sa"], closed: "Geschlossen", openNow: "Jetzt offen", closedNow: "Jetzt geschlossen", until: "bis", opens: "öffnet um", opensDay: "öffnet" },
    fr: { days: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], short: ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"], closed: "Fermé", openNow: "Ouvert", closedNow: "Fermé", until: "jusqu'à", opens: "ouvre à", opensDay: "ouvre" },
    en: { days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], short: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], closed: "Closed", openNow: "Open now", closedNow: "Closed now", until: "until", opens: "opens at", opensDay: "opens" }
  };
  const T = L[S.lang || document.documentElement.lang || "it"] || L.it;
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), S);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const chf = (n) => Number(n).toFixed(2);

  /* ---- text fields ---- */
  $$("[data-field]").forEach(el => { const v = get(el.dataset.field); if (v != null && v !== "") el.textContent = v; });
  $$("[data-paragraphs]").forEach(el => {
    const v = get(el.dataset.paragraphs) || [];
    el.innerHTML = v.map(p => `<p>${esc(p)}</p>`).join("");
  });
  if (S.name) document.title = document.title.replace("YOUR BUSINESS", S.name);
  if (S.accent) document.documentElement.style.setProperty("--accent", S.accent);
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  /* ---- links ---- */
  const C = S.contact || {};
  const links = {
    tel: "tel:" + (C.phoneHref || ""),
    mail: C.email ? "mailto:" + C.email : "",
    maps: C.mapsUrl || "#",
    book: C.bookingUrl || ("tel:" + (C.phoneHref || "")),
    whatsapp: C.whatsapp ? "https://wa.me/" + C.whatsapp : "",
    instagram: C.instagram || "", facebook: C.facebook || ""
  };
  $$("[data-href]").forEach(el => {
    const h = links[el.dataset.href];
    if (!h) { el.hidden = true; return; }
    el.href = h;
    if (/^https?:/.test(h)) { el.target = "_blank"; el.rel = "noopener"; }
  });

  /* ---- hours & open-now (Europe/Zurich) ---- */
  const zurichNow = () => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.find(x => x.type === "weekday").value);
    const h = +p.find(x => x.type === "hour").value % 24, m = +p.find(x => x.type === "minute").value;
    return { day: wd, min: h * 60 + m };
  };
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  function status() {
    const H = S.hours || {}, now = zurichNow();
    // still open from yesterday's late slot?
    const yd = (now.day + 6) % 7;
    for (const [o, c] of (H[yd] || [])) if (toMin(c) < toMin(o) && now.min < toMin(c)) return { open: true, text: `${T.openNow} · ${T.until} ${c}` };
    for (const [o, c] of (H[now.day] || [])) {
      const oo = toMin(o), cc = toMin(c) <= oo ? toMin(c) + 1440 : toMin(c);
      if (now.min >= oo && now.min < cc) return { open: true, text: `${T.openNow} · ${T.until} ${c}` };
    }
    for (const [o] of (H[now.day] || [])) if (toMin(o) > now.min) return { open: false, text: `${T.closedNow} · ${T.opens} ${o}` };
    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7, s = H[d] || [];
      if (s.length) return { open: false, text: `${T.closedNow} · ${T.opensDay} ${T.days[d].toLowerCase()} ${s[0][0]}` };
    }
    return { open: false, text: T.closedNow };
  }
  function paintStatus() {
    const st = status();
    $$("[data-open-status]").forEach(el => { el.textContent = st.text; el.closest("[data-open-state]")?.setAttribute("data-open-state", st.open ? "open" : "closed"); });
    $$("[data-open-word]").forEach(el => { el.textContent = st.open ? T.openNow : T.closedNow; });
    document.documentElement.dataset.open = st.open ? "open" : "closed";
  }
  paintStatus(); setInterval(paintStatus, 60000);

  const today = zurichNow().day;
  $$("[data-hours]").forEach(el => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    el.innerHTML = order.map(d => {
      const slots = (S.hours || {})[d] || [];
      const time = slots.length ? slots.map(([o, c]) => `${o}–${c}`).join(" · ") : T.closed;
      return `<li class="hours-row${d === today ? " is-today" : ""}${slots.length ? "" : " is-closed"}"><span class="hours-day">${T.days[d]}</span><span class="hours-time">${time}</span></li>`;
    }).join("");
  });

  /* ---- menu ---- */
  $$("[data-menu]").forEach(el => {
    const limit = +el.dataset.menuLimit || 0;          // items per category (0 = all)
    const cats = +el.dataset.menuCats || 0;            // number of categories (0 = all)
    const menu = (S.menu || []).slice(0, cats || undefined);
    el.innerHTML = menu.map((cat, i) => `
      <section class="menu-cat" data-reveal>
        <h3 class="menu-cat-title"><span class="menu-cat-n">${String(i + 1).padStart(2, "0")}</span><span class="menu-cat-name">${esc(cat.category)}</span></h3>
        <ul class="menu-items">${cat.items.slice(0, limit || undefined).map(it => `
          <li class="menu-item">
            <div class="menu-line"><span class="menu-name">${esc(it.name)}</span><span class="menu-dots" aria-hidden="true"></span><span class="menu-price">${chf(it.price)}</span></div>
            ${it.desc ? `<p class="menu-desc">${esc(it.desc)}</p>` : ""}
          </li>`).join("")}
        </ul>
      </section>`).join("");
  });
  $$("[data-marquee-dishes]").forEach(el => {
    const names = (S.menu || []).flatMap(c => c.items.map(i => i.name));
    const run = names.map(n => `<span>${esc(n)}</span>`).join("");
    el.innerHTML = `<div class="marquee-track">${run}${run}</div>`;
  });

  /* ---- highlights ---- */
  $$("[data-highlights]").forEach(el => {
    el.innerHTML = (S.highlights || []).map((h, i) => `
      <li class="hl" data-reveal><span class="hl-n">${String(i + 1).padStart(2, "0")}</span><h3 class="hl-title">${esc(h.title)}</h3><p class="hl-text">${esc(h.text)}</p></li>`).join("");
  });

  /* ---- photos (designed placeholder when src is empty) ---- */
  $$("[data-photo]").forEach(el => {
    const p = (S.photos || {})[el.dataset.photo] || {};
    if (p.src) {
      el.classList.remove("ph");
      el.innerHTML = `<img src="${esc(p.src)}" alt="${esc(p.alt || "")}" loading="${el.dataset.eager ? "eager" : "lazy"}">`;
    } else {
      el.classList.add("ph");
      el.setAttribute("data-gap", "photo");
      if (!el.querySelector(".ph-cap")) el.insertAdjacentHTML("beforeend", `<span class="ph-cap">${esc(p.caption || "Foto")}</span>`);
    }
  });

  /* ---- structured data ---- */
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const ld = {
    "@context": "https://schema.org", "@type": "Restaurant", name: S.name, telephone: C.phone, email: C.email,
    address: { "@type": "PostalAddress", streetAddress: C.street, addressLocality: C.city, addressCountry: "CH" },
    servesCuisine: S.kind, menu: "menu.html",
    openingHoursSpecification: Object.entries(S.hours || {}).flatMap(([d, slots]) => slots.map(([o, c]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: days[d], opens: o, closes: c })))
  };
  const sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);

  /* ---- reveal on scroll ---- */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = $$("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) els.forEach(e => e.classList.add("in"));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    els.forEach(e => io.observe(e));
  }

  /* ---- mobile nav toggle ---- */
  $$("[data-nav-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const open = document.documentElement.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open);
  }));
  $$(".nav-panel a").forEach(a => a.addEventListener("click", () => document.documentElement.classList.remove("nav-open")));

  window.SITE_T = T;
})();
