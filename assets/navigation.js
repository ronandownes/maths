/* Shared Maths navigation: Strand (top) -> Topic (dropdown) -> Section (sidebar).
   A topic's sidebar sections are read from its real lesson headings, not a second list.
   All book pages and standalone apps use this one component. */
(() => {
  "use strict";
  const script = document.currentScript;
  if (!script) return;
  const root = new URL("../", script.src);
  const url = path => new URL(path, root).href;
  const L = (label, path) => ({ label, path });
  const T = (label, home, activities = []) => ({ label, home, activities });

  const strands = [
    { label: "Number", home: "number/index.html", topics: [
      T("Sets and subsets", "number/sets/index.html", [
        L("Sets explorer", "apps/sets/index.html"),
        L("Explore two sets", "number/sets/explorer.html"),
        L("Set rule builder", "apps/sets/rule-builder.html"),
        L("Listing and notation", "apps/sets/list-and-notation.html"),
        L("Number sets", "apps/sets/number-sets.html"),
        L("Number Venn diagrams", "apps/sets/number-venn.html"),
        L("Universal set and complement", "apps/sets/universal-complement.html"),
        L("Venn problem solving", "apps/sets/venn-problem-solving.html")
      ]),
      T("Sequences", "number/sequences/index.html", [
        L("Linear sequences", "apps/linear-sequences/index.html"),
        L("Sequence graphs", "apps/linear-sequences/graph.html"),
        L("Sequences in Algebra", "algebra/sequences/index.html"),
        L("Quadratic sequences", "apps/quadratic-sequences/index.html"),
        L("Geometric sequences", "apps/geometric-sequences/index.html"),
        L("Sequence challenges", "apps/sequence-challenges/index.html")
      ]),
      T("Fractions and decimals", "number/fractions/index.html", [
        L("Farey sequences explorer", "apps/farey-sequences/index.html")
      ]),
      T("Complex numbers", "number/complex-numbers/index.html", [
        L("Complex Numbers Explorer", "apps/complex-numbers/index.html")
      ])
    ]},
    { label: "Algebra", home: "algebra/index.html", topics: [
      T("Expanding brackets", "algebra/expansions/index.html", [
        L("Split the brackets", "apps/split-brackets/index.html"),
        L("Place-value multiplication", "apps/polynomial-place-value/index.html"),
        L("Vertical FOIL", "apps/vertical-foil/index.html"),
        L("Inline rainbow", "apps/inline-rainbow/index.html"),
        L("FOIL representations", "apps/foil/index.html"),
        L("Linear right margin", "apps/linear-right-margin/index.html")
      ]),
      T("Factorising", "algebra/factorising/index.html", [
        L("Factorising frame", "apps/factorising-frame/index.html")
      ])
    ]},
    { label: "Functions", home: "functions/index.html", topics: [
      T("Quadratic functions", "functions/quadratic-functions/index.html")
    ]},
    { label: "Geometry", home: "geometry/index.html", topics: [
      T("Squares and rectangles", "geometry/rectangle-variables/index.html", [
        L("Rectangle explorer", "geometry/rectangle-variables/app.html")
      ]),
      T("Pythagoras", "apps/pythagoras/index.html")
    ]},
    { label: "Trigonometry", home: "trigonometry/index.html", topics: [
      T("Right-angled triangles", "apps/right-angle-ratios/index.html", [
        L("Sine ratio", "apps/trigonometry/sine/index.html"),
        L("Cosine ratio", "apps/trigonometry/cosine/index.html"),
        L("Tangent ratio", "apps/trigonometry/tangent/index.html")
      ]),
      T("Sine and cosine rules", "trigonometry/triangle-rules/index.html", [
        L("Triangle explorer", "apps/triangle-rules/index.html"),
        L("Geometry triangle rules", "geometry/triangle-rules/index.html")
      ])
    ]},
    { label: "Statistics", home: "statistics/index.html", topics: [
      T("Describing data", "statistics/describing-data/index.html")
    ]},
    { label: "Probability", home: "probability/index.html", topics: [
      T("Probability experiments", "probability/theoretical-experimental/index.html"),
      T("Tree diagrams", "probability/tree-diagrams/index.html"),
      T("Counting principles", "probability/counting/index.html")
    ]},
    { label: "Combinatorics", home: "combinatorics/index.html", topics: [
      T("Counting", "combinatorics/counting/index.html")
    ]}
  ];

  const relative = decodeURIComponent(location.pathname).startsWith(root.pathname)
    ? decodeURIComponent(location.pathname).slice(root.pathname.length).replace(/^\/+/, "")
    : "";
  const path = !relative ? "index.html" : relative.endsWith("/") ? relative + "index.html" : relative;
  let strand = null, topic = null;
  for (const s of strands) {
    for (const t of s.topics) {
      if (path === t.home || t.activities.some(item => item.path === path)) {
        strand = s; topic = t; break;
      }
    }
    if (topic) break;
  }
  if (!strand) strand = strands.find(s => path === s.home) || null;

  function link(item, cls = "", active = false) {
    const el = document.createElement("a");
    el.href = url(item.path);
    el.textContent = item.label;
    el.className = cls;
    if (active || (!location.hash && path === item.path)) {
      el.classList.add("maths-current");
      el.setAttribute("aria-current", "page");
    }
    return el;
  }
  function caption(label) {
    const h = document.createElement("h3");
    h.className = "maths-side-caption";
    h.textContent = label;
    return h;
  }
  function list(items, cls) {
    const group = document.createElement("div");
    group.className = "maths-side-list " + (cls || "");
    items.forEach(item => group.append(link(item)));
    return group;
  }

  function navigation(menu) {
    menu.classList.add("maths-strands");
    menu.setAttribute("aria-label", "Mathematics strands and topics");
    menu.replaceChildren();
    for (const s of strands) {
      const details = document.createElement("details");
      details.className = "maths-strand" + (s === strand ? " maths-selected-strand" : "");
      const summary = document.createElement("summary");
      summary.append(document.createTextNode(s.label + " "));
      const arrow = document.createElement("span");
      arrow.textContent = "⌄";
      arrow.setAttribute("aria-hidden", "true");
      summary.append(arrow);
      details.append(summary);
      const dropdown = document.createElement("div");
      dropdown.className = "maths-dropdown";
      dropdown.append(link(L("All " + s.label, s.home), "maths-all-topics"));
      s.topics.forEach(t => dropdown.append(link(L(t.label, t.home), "", t === topic)));
      details.append(dropdown);
      menu.append(details);
      details.addEventListener("toggle", () => {
        if (details.open) menu.querySelectorAll("details").forEach(other => {
          if (other !== details) other.open = false;
        });
      });
    }
    const closeAll = () => menu.querySelectorAll("details").forEach(d => { d.open = false; });
    menu.addEventListener("click", e => {
      if (!e.target.closest("a")) return;
      closeAll();
      menu.classList.remove("open");
      const toggle = document.getElementById("menu-toggle") || document.getElementById("maths-app-menu-toggle");
      toggle?.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", e => { if (!menu.contains(e.target)) closeAll(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  }

  function slug(text) {
    return text.normalize("NFKD").toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
  }
  function extractSections(doc) {
    const scope = doc.querySelector("#main .lesson") || doc.querySelector(".lesson") || doc.querySelector("main");
    if (!scope) return [];
    const headings = [...scope.querySelectorAll("h2")].filter(h =>
      !h.closest("aside, nav, footer, details, [hidden]"));
    const ids = new Set([...doc.querySelectorAll("[id]")].map(el => el.id));
    const sections = [];
    for (const h of headings) {
      const title = h.textContent.replace(/\s+/g, " ").trim();
      if (!title) continue;
      const enclosing = h.closest("section[id]");
      const target = enclosing && scope.contains(enclosing) ? enclosing : h;
      if (!target.id) {
        const base = "maths-section-" + slug(title);
        let id = base, k = 2;
        while (ids.has(id)) id = base + "-" + (k++);
        target.id = id;
        ids.add(id);
      }
      if (!sections.some(s => s.id === target.id)) sections.push({ title, id: target.id });
    }
    return sections;
  }

  function renderSidebar(element) {
    element.replaceChildren();
    element.setAttribute("aria-label", topic ? "Sections in " + topic.label : "Mathematics topics");
    const heading = document.createElement("h2");
    heading.textContent = topic ? topic.label : strand ? strand.label : "Explore Maths";
    element.append(heading);

    if (!topic) {
      if (strand) element.append(link(L("← Maths home", "index.html"), "maths-back-link"));
      if (path === "unifying/index.html") {
        heading.textContent = "Unifying strand";
        element.append(link(L("Introduction", "unifying/index.html"), "maths-back-link"));
      }
      element.append(caption(strand ? "Topics" : "Strands"));
      element.append(list(strand ? strand.topics.map(t => L(t.label, t.home))
        : strands.map(s => L(s.label, s.home)), "maths-topic-links"));
      return;
    }

    element.append(link(L("← All " + strand.label, strand.home), "maths-back-link"));
    element.append(caption("Sections"));
    const sectionsSlot = document.createElement("div");
    sectionsSlot.className = "maths-side-list maths-section-links";
    const intro = link(L("Introduction", topic.home), "", path === topic.home && !location.hash);
    sectionsSlot.append(intro);
    element.append(sectionsSlot);

    if (topic.activities.length) {
      element.append(caption("Interactive activities"));
      element.append(list(topic.activities, "maths-activity-links"));
    }

    const renderSections = doc => {
      const sections = extractSections(doc);
      for (const item of sections) {
        const a = link(L(item.title, topic.home + "#" + encodeURIComponent(item.id)), "maths-section-link");
        a.dataset.sectionId = item.id;
        sectionsSlot.append(a);
      }
      const markActive = () => {
        sectionsSlot.querySelectorAll("a").forEach(a => {
          const selected = a.dataset.sectionId
            ? path === topic.home && location.hash === "#" + encodeURIComponent(a.dataset.sectionId)
            : path === topic.home && !location.hash;
          a.classList.toggle("maths-current", selected);
          if (selected) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      };
      markActive();
      window.addEventListener("hashchange", markActive);
    };

    if (path === topic.home) {
      renderSections(document);
      // Headings without source IDs receive stable IDs here. A browser may have
      // tried to resolve the URL fragment before those IDs existed.
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      }
    } else {
      fetch(url(topic.home))
        .then(response => { if (!response.ok) throw new Error("No section index"); return response.text(); })
        .then(html => renderSections(new DOMParser().parseFromString(html, "text/html")))
        .catch(() => { /* Introduction and activity links remain available offline. */ });
    }
  }

  function start() {
    if (window.self !== window.top) return; // Embedded explorer already has its book's navigation.
    if (document.documentElement.dataset.mathsNavReady) return;
    document.documentElement.dataset.mathsNavReady = "yes";
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = new URL("navigation.css", script.src).href;
    document.head.append(css);

    let menu = document.getElementById("main-menu");
    let sidebar = document.querySelector(".stage > .sidebar");
    if (!menu) {
      document.body.classList.add("maths-standalone-page");
      const bar = document.createElement("div");
      bar.className = "maths-unified-top";
      const brand = link(L("", "index.html"), "maths-unified-brand");
      brand.setAttribute("aria-label", "Maths home");
      const logo = document.createElement("img");
      logo.alt = "Maths four-dot logo";
      logo.src = url("assets/maths-logo.svg");
      brand.append(logo);
      bar.append(brand);

      const toggle = document.createElement("button");
      toggle.id = "maths-app-menu-toggle";
      toggle.className = "maths-unified-toggle";
      toggle.type = "button";
      toggle.textContent = "☰ Strands";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "maths-app-strands");
      bar.append(toggle);

      menu = document.createElement("nav");
      menu.id = "maths-app-strands";
      bar.append(menu);
      document.body.prepend(bar);
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(expanded));
        menu.classList.toggle("open", expanded);
      });

      sidebar = document.createElement("aside");
      sidebar.className = "maths-unified-side";
      bar.insertAdjacentElement("afterend", sidebar);
    }
    navigation(menu);
    if (sidebar) sidebar && sidebar.append && sidebar && sidebar.nodeType === 1 && sidebar && sidebar.tagName && sidebar && sidebar && sidebar; // no-op
    if (sidebar) sidebarRender(sidebar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();