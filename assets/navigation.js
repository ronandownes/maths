/* Shared Maths navigation: Strand (top) -> Topic (dropdown) -> Section (sidebar).
   A topic's sidebar sections are read from its real lesson headings, not a second list.
   All book pages and standalone apps use this one component. */
(() => {
  "use strict";
  const script = document.currentScript;
  if (!script) return;
  const root = new URL("../", script.src);
  const url = path => new URL(path, root).href;
  const bookRoot = new URL("../book/", root);
  // These IDs correspond to stable xml:id values in the PreTeXt source.
  const bookPart = {
    Number: "part-number", Algebra: "part-algebra",
    Functions: "part-functions", Geometry: "part-geometry",
    Trigonometry: "part-trigonometry", Statistics: "part-statistics",
    Probability: "part-probability", Combinatorics: "part-combinatorics"
  };
  const bookChapter = {
    "number/sets/index.html": "chapter-sets",
    "number/sequences/index.html": "chapter-sequences",
    "number/complex-numbers/index.html": "chapter-complex",
    "algebra/factorising/index.html": "chapter-factorisation",
    "functions/quadratic-functions/index.html": "chapter-functions",
    "geometry/rectangle-variables/index.html": "chapter-geometry",
    "apps/right-angle-ratios/index.html": "chapter-trigonometry",
    "trigonometry/triangle-rules/index.html": "chapter-trigonometry",
    "statistics/describing-data/index.html": "chapter-statistics",
    "probability/index.html": "chapter-probability",
    "combinatorics/counting/index.html": "chapter-counting"
  };
  function bookLink(label, id) {
    const a = document.createElement("a");
    a.href = new URL(id + ".html", bookRoot).href;
    a.className = "maths-book-link";
    a.textContent = label;
    return a;
  }
  const L = (label, path) => ({ label, path });
  const T = (label, home, activities = []) => ({ label, home, activities });

  const strands = [
    { label: "Number", home: "number/index.html", topics: [
      T("Sets", "number/sets/index.html", [
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
        L("Split the brackets · binomial practice", "apps/split-brackets/polynomials.html"),
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
      T("Solving triangles", "apps/trigonometry/solving-triangles/index.html", [
        L("Sine and cosine rules — lesson", "trigonometry/triangle-rules/index.html"),
        L("Triangle explorer — earlier app", "apps/triangle-rules/index.html")
      ])
    ]},
    { label: "Statistics", home: "statistics/index.html", topics: [
      T("Describing data", "statistics/describing-data/index.html")
    ]},
    { label: "Probability", home: "probability/index.html", topics: [
      T("Experimental probability", "probability/theoretical-experimental/index.html", [
        L("Marble bag probability", "apps/probability/marble-bag/index.html")
      ]),
      T("Tree diagrams", "probability/tree-diagrams/index.html", [
        L("Tree diagram explorer", "apps/probability/tree-diagrams/index.html")
      ]),
      T("Two-way tables", "apps/probability/two-way-tables/index.html"),
      T("Counting & combinatorics", "probability/counting/index.html", [
        L("Combinatorics", "combinatorics/counting/index.html")
      ])
    ]}
  ];

  const referenceEntries = [{"label":"Sets","home":"reference/am1/chapter-01/index.html","activities":[],"source":"am1","chapter":1,"lc":false,"strand":"Number"},{"label":"Natural Numbers","home":"reference/am1/chapter-02/index.html","activities":[],"source":"am1","chapter":2,"lc":false,"strand":"Number"},{"label":"Integers","home":"reference/am1/chapter-03/index.html","activities":[],"source":"am1","chapter":3,"lc":false,"strand":"Number"},{"label":"Rational Numbers","home":"reference/am1/chapter-04/index.html","activities":[],"source":"am1","chapter":4,"lc":false,"strand":"Number"},{"label":"Geometry I","home":"reference/am1/chapter-05/index.html","activities":[],"source":"am1","chapter":5,"lc":false,"strand":"Geometry"},{"label":"Constructions I","home":"reference/am1/chapter-06/index.html","activities":[],"source":"am1","chapter":6,"lc":false,"strand":"Geometry"},{"label":"Rational Numbers II","home":"reference/am1/chapter-07/index.html","activities":[],"source":"am1","chapter":7,"lc":false,"strand":"Number"},{"label":"Decimals and Percentages","home":"reference/am1/chapter-08/index.html","activities":[],"source":"am1","chapter":8,"lc":false,"strand":"Number"},{"label":"Fundamental Principle of Counting and Probability","home":"reference/am1/chapter-09/index.html","activities":[],"source":"am1","chapter":9,"lc":false,"strand":"Probability"},{"label":"Co-ordinate Geometry I","home":"reference/am1/chapter-10/index.html","activities":[],"source":"am1","chapter":10,"lc":false,"strand":"Geometry"},{"label":"Transformation Geometry","home":"reference/am1/chapter-11/index.html","activities":[],"source":"am1","chapter":11,"lc":false,"strand":"Geometry"},{"label":"Number Patterns I","home":"reference/am1/chapter-12/index.html","activities":[],"source":"am1","chapter":12,"lc":false,"strand":"Number"},{"label":"Indices and Scientific Notation","home":"reference/am1/chapter-13/index.html","activities":[],"source":"am1","chapter":13,"lc":false,"strand":"Number"},{"label":"Algebra I: An Introduction","home":"reference/am1/chapter-14/index.html","activities":[],"source":"am1","chapter":14,"lc":false,"strand":"Algebra"},{"label":"Algebra II: Solving Linear Equations","home":"reference/am1/chapter-15/index.html","activities":[],"source":"am1","chapter":15,"lc":false,"strand":"Algebra"},{"label":"Applied Arithmetic II","home":"reference/am1/chapter-16/index.html","activities":[],"source":"am1","chapter":16,"lc":false,"strand":"Number"},{"label":"Functions I","home":"reference/am1/chapter-17/index.html","activities":[],"source":"am1","chapter":17,"lc":false,"strand":"Functions"},{"label":"Statistics I: Collecting Data","home":"reference/am1/chapter-18/index.html","activities":[],"source":"am1","chapter":18,"lc":false,"strand":"Statistics"},{"label":"Statistics II: Representing Data Graphically","home":"reference/am1/chapter-19/index.html","activities":[],"source":"am1","chapter":19,"lc":false,"strand":"Statistics"},{"label":"Applied Measure","home":"reference/am1/chapter-20/index.html","activities":[],"source":"am1","chapter":20,"lc":false,"strand":"Geometry"},{"label":"Geometry II: Theorems","home":"reference/am1/chapter-21/index.html","activities":[],"source":"am1","chapter":21,"lc":false,"strand":"Geometry"},{"label":"Algebra III: Problem-Solving with Linear Equations","home":"reference/am1/chapter-22/index.html","activities":[],"source":"am1","chapter":22,"lc":false,"strand":"Algebra"},{"label":"Geometry III: Further Theorems","home":"reference/am1/chapter-23/index.html","activities":[],"source":"am1","chapter":23,"lc":false,"strand":"Geometry"},{"label":"Co-ordinate Geometry II","home":"reference/am1/chapter-24/index.html","activities":[],"source":"am1","chapter":24,"lc":false,"strand":"Geometry"},{"label":"Constructions II","home":"reference/am1/chapter-25/index.html","activities":[],"source":"am1","chapter":25,"lc":false,"strand":"Geometry"},{"label":"Statistics III: Representing Data Numerically and Interpreting Data","home":"reference/am1/chapter-26/index.html","activities":[],"source":"am1","chapter":26,"lc":false,"strand":"Statistics"},{"label":"Co-ordinate Geometry III","home":"reference/am1/chapter-27/index.html","activities":[],"source":"am1","chapter":27,"lc":false,"strand":"Geometry"},{"label":"Algebra IV: Linear Inequalities","home":"reference/am1/chapter-28/index.html","activities":[],"source":"am1","chapter":28,"lc":false,"strand":"Algebra"},{"label":"Algebra V: Simultaneous Equations","home":"reference/am1/chapter-29/index.html","activities":[],"source":"am1","chapter":29,"lc":false,"strand":"Algebra"},{"label":"Applied Measure II","home":"reference/am1/chapter-30/index.html","activities":[],"source":"am1","chapter":30,"lc":false,"strand":"Geometry"},{"label":"Algebra VI: Algebraic Factorising","home":"reference/am1/chapter-31/index.html","activities":[],"source":"am1","chapter":31,"lc":false,"strand":"Algebra"},{"label":"Distance, Speed, Time and Graphs","home":"reference/am1/chapter-32/index.html","activities":[],"source":"am1","chapter":32,"lc":false,"strand":"Functions"},{"label":"Trigonometry","home":"reference/am1/chapter-33/index.html","activities":[],"source":"am1","chapter":33,"lc":false,"strand":"Trigonometry"},{"label":"Applied Arithmetic III","home":"reference/am1/chapter-34/index.html","activities":[],"source":"am1","chapter":34,"lc":false,"strand":"Number"},{"label":"Algebra VII: Solving Quadratic Equations","home":"reference/am1/chapter-35/index.html","activities":[],"source":"am1","chapter":35,"lc":false,"strand":"Algebra"},{"label":"Functions II","home":"reference/am1/chapter-36/index.html","activities":[],"source":"am1","chapter":36,"lc":false,"strand":"Functions"},{"label":"Number Patterns II","home":"reference/am1/chapter-37/index.html","activities":[],"source":"am1","chapter":37,"lc":false,"strand":"Number"},{"label":"Algebra VIII: Algebraic Fractions","home":"reference/am1/chapter-38/index.html","activities":[],"source":"am1","chapter":38,"lc":false,"strand":"Algebra"},{"label":"Algebra IX: Expansions and Division in Algebra","home":"reference/am1/chapter-39/index.html","activities":[],"source":"am1","chapter":39,"lc":false,"strand":"Algebra"},{"label":"Sets","home":"reference/am2/chapter-01/index.html","activities":[],"source":"am2","chapter":1,"lc":false,"strand":"Number"},{"label":"Counting and Probability","home":"reference/am2/chapter-02/index.html","activities":[],"source":"am2","chapter":2,"lc":false,"strand":"Probability"},{"label":"Statistics","home":"reference/am2/chapter-03/index.html","activities":[],"source":"am2","chapter":3,"lc":false,"strand":"Statistics"},{"label":"Alg I: Expressions","home":"reference/am2/chapter-04/index.html","activities":[],"source":"am2","chapter":4,"lc":false,"strand":"Number"},{"label":"Alg II: Factorising","home":"reference/am2/chapter-05/index.html","activities":[],"source":"am2","chapter":5,"lc":false,"strand":"Number"},{"label":"Co-ordinate Geo I","home":"reference/am2/chapter-06/index.html","activities":[],"source":"am2","chapter":6,"lc":false,"strand":"Number"},{"label":"Applied Arithmetic","home":"reference/am2/chapter-07/index.html","activities":[],"source":"am2","chapter":7,"lc":false,"strand":"Number"},{"label":"Geometry I","home":"reference/am2/chapter-08/index.html","activities":[],"source":"am2","chapter":8,"lc":false,"strand":"Geometry"},{"label":"Indices","home":"reference/am2/chapter-09/index.html","activities":[],"source":"am2","chapter":9,"lc":false,"strand":"Number"},{"label":"Algebra III: Algebraic Fractions and Manipulation of Formulae","home":"reference/am2/chapter-10/index.html","activities":[],"source":"am2","chapter":10,"lc":false,"strand":"Algebra"},{"label":"Applied Measure I","home":"reference/am2/chapter-11/index.html","activities":[],"source":"am2","chapter":11,"lc":false,"strand":"Geometry"},{"label":"Distance, Speed, Time and Real-Life Graphs","home":"reference/am2/chapter-12/index.html","activities":[],"source":"am2","chapter":12,"lc":false,"strand":"Functions"},{"label":"Algebra IV: Linear Equations","home":"reference/am2/chapter-13/index.html","activities":[],"source":"am2","chapter":13,"lc":false,"strand":"Algebra"},{"label":"Algebra V: Linear Inequalities","home":"reference/am2/chapter-14/index.html","activities":[],"source":"am2","chapter":14,"lc":false,"strand":"Algebra"},{"label":"Number Systems","home":"reference/am2/chapter-15/index.html","activities":[],"source":"am2","chapter":15,"lc":false,"strand":"Number"},{"label":"Algebra VI: Quadratic Equations","home":"reference/am2/chapter-16/index.html","activities":[],"source":"am2","chapter":16,"lc":false,"strand":"Algebra"},{"label":"Co-ordinate Geometry II","home":"reference/am2/chapter-17/index.html","activities":[],"source":"am2","chapter":17,"lc":false,"strand":"Geometry"},{"label":"Number Patterns","home":"reference/am2/chapter-18/index.html","activities":[],"source":"am2","chapter":18,"lc":false,"strand":"Number"},{"label":"Graphing Functions","home":"reference/am2/chapter-19/index.html","activities":[],"source":"am2","chapter":19,"lc":false,"strand":"Functions"},{"label":"Geometry II","home":"reference/am2/chapter-20/index.html","activities":[],"source":"am2","chapter":20,"lc":false,"strand":"Geometry"},{"label":"Constructions","home":"reference/am2/chapter-21/index.html","activities":[],"source":"am2","chapter":21,"lc":false,"strand":"Geometry"},{"label":"Applied Measure II","home":"reference/am2/chapter-22/index.html","activities":[],"source":"am2","chapter":22,"lc":false,"strand":"Geometry"},{"label":"Trigonometry","home":"reference/am2/chapter-23/index.html","activities":[],"source":"am2","chapter":23,"lc":false,"strand":"Trigonometry"},{"label":"Geometry III: Proofs","home":"reference/am2/chapter-24/index.html","activities":[],"source":"am2","chapter":24,"lc":false,"strand":"Geometry"},{"label":"Real Numbers","home":"reference/am3/chapter-01/index.html","activities":[],"source":"am3","chapter":1,"lc":false,"strand":"Number"},{"label":"Arithmetic","home":"reference/am3/chapter-02/index.html","activities":[],"source":"am3","chapter":2,"lc":false,"strand":"Number"},{"label":"Algebra I","home":"reference/am3/chapter-03/index.html","activities":[],"source":"am3","chapter":3,"lc":false,"strand":"Algebra"},{"label":"Indices and Surds","home":"reference/am3/chapter-04/index.html","activities":[],"source":"am3","chapter":4,"lc":false,"strand":"Number"},{"label":"Algebra II","home":"reference/am3/chapter-05/index.html","activities":[],"source":"am3","chapter":5,"lc":false,"strand":"Algebra"},{"label":"Linear and Quadratic Functions","home":"reference/am3/chapter-06/index.html","activities":[],"source":"am3","chapter":6,"lc":false,"strand":"Functions"},{"label":"Complex Numbers","home":"reference/am3/chapter-07/index.html","activities":[],"source":"am3","chapter":7,"lc":true,"strand":"Number"},{"label":"Cubic and Exponential Functions","home":"reference/am3/chapter-08/index.html","activities":[],"source":"am3","chapter":8,"lc":false,"strand":"Functions"},{"label":"Number Patterns","home":"reference/am3/chapter-09/index.html","activities":[],"source":"am3","chapter":9,"lc":false,"strand":"Number"},{"label":"Calculus","home":"reference/am3/chapter-10/index.html","activities":[],"source":"am3","chapter":10,"lc":true,"strand":"Functions"},{"label":"Applied Measure","home":"reference/am3/chapter-11/index.html","activities":[],"source":"am3","chapter":11,"lc":false,"strand":"Geometry"},{"label":"Counting and Arrangements","home":"reference/am3/chapter-12/index.html","activities":[],"source":"am3","chapter":12,"lc":false,"strand":"Combinatorics"},{"label":"Probability","home":"reference/am3/chapter-13/index.html","activities":[],"source":"am3","chapter":13,"lc":false,"strand":"Probability"},{"label":"Statistics I","home":"reference/am3/chapter-14/index.html","activities":[],"source":"am3","chapter":14,"lc":false,"strand":"Statistics"},{"label":"Statistics II","home":"reference/am3/chapter-15/index.html","activities":[],"source":"am3","chapter":15,"lc":false,"strand":"Statistics"},{"label":"Geometry","home":"reference/am3/chapter-16/index.html","activities":[],"source":"am3","chapter":16,"lc":false,"strand":"Geometry"},{"label":"Trigonometry","home":"reference/am3/chapter-17/index.html","activities":[],"source":"am3","chapter":17,"lc":false,"strand":"Trigonometry"},{"label":"Coordinate Geometry: The Line","home":"reference/am3/chapter-18/index.html","activities":[],"source":"am3","chapter":18,"lc":false,"strand":"Geometry"},{"label":"Constructions, Transformations and Enlargements","home":"reference/am3/chapter-19/index.html","activities":[],"source":"am3","chapter":19,"lc":false,"strand":"Geometry"},{"label":"Coordinate Geometry: The Circle","home":"reference/am3/chapter-20/index.html","activities":[],"source":"am3","chapter":20,"lc":true,"strand":"Geometry"}];
  for (const item of referenceEntries) {
    const strand = strands.find(s => s.label === (item.strand === "Combinatorics" ? "Probability" : item.strand));
    if (strand) strand.topics.push(item);
  }

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
      // The entire strand name opens its topic menu; no decorative chevron.
      summary.textContent = ({ Trigonometry: "Trig", Statistics: "Stats" })[s.label] || s.label;
      summary.setAttribute("aria-label", "Explore " + s.label + " topics");
      details.append(summary);
      const dropdown = document.createElement("div");
      dropdown.className = "maths-dropdown";
      dropdown.append(link(L("All " + s.label, s.home), "maths-all-topics"));
      s.topics.filter(t => !t.source).forEach(t => dropdown.append(link(L(t.label, t.home), "", t === topic)));
      if (bookPart[s.label]) dropdown.append(bookLink("Read " + s.label + " in the Book", bookPart[s.label]));
      for (const book of ["am1", "am2", "am3"]) {
        const refs = s.topics.filter(t => t.source === book);
        if (!refs.length) continue;
        const group = document.createElement("details");
        group.className = "maths-reference-group";
        const header = document.createElement("summary");
        header.textContent = {"am1":"Active Maths 1 · JC", "am2":"Active Maths 2 · JC", "am3":"Active Maths 3 · LC"}[book] + " (" + refs.length + ")";
        group.append(header);
        const links = document.createElement("div");
        links.className = "maths-reference-links";
        for (const t of refs) {
          const a = link(L(t.label,t.home), "", t === topic);
          if (t.lc) {
            const b = document.createElement("span"); b.className = "maths-lc-marker";
            b.textContent = "LC"; b.setAttribute("aria-label", "Leaving Certificate");
            a.append(b);
          }
          links.append(a);
        }
        group.append(links);
        if (topic && topic.source === book) group.open = true;
        dropdown.append(group);
      }
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
      const title = [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(" ").replace(/\s+/g, " ").trim() || h.textContent.replace(/\s+/g, " ").trim();
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
    if (topic && bookChapter[topic.home]) {
      const read = bookLink("Read in the Book", bookChapter[topic.home]);
      read.classList.add("maths-side-book-link");
      element.append(read);
    }

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

    // Topic sidebars show only sections. Other topics are in the strand dropdown.
    element.append(caption("Sections"));
    const sectionsSlot = document.createElement("div");
    sectionsSlot.className = "maths-side-list maths-section-links";
    const intro = link(L("Top of page", topic.home), "maths-top-link", path === topic.home && !location.hash);
    sectionsSlot.append(intro);
    element.append(sectionsSlot);


    const renderSections = doc => {
      const sections = extractSections(doc);
      sectionsSlot.replaceChildren();
      sectionsSlot.append(intro);
      for (const item of sections) {
        const label = item.title.replace(/^\s*\d+(?:\.\d+)*[.)]\s+/, "");
        const a = link(L(label, topic.home + "#" + encodeURIComponent(item.id)), "maths-section-link");
        a.dataset.sectionId = item.id;
        sectionsSlot.append(a);
      }
      const markActive = () => {
        sectionsSlot.querySelectorAll("a").forEach(a => {
          const selected = a.dataset.sectionId
            ? path === topic.home && (location.hash === "#" + encodeURIComponent(a.dataset.sectionId)
              )
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
    if (window.self !== window.top) return;
    // Page titles remain consistent even on older generated HTML pages.
    document.title = document.title.replace(/ \| (?:Irish School Maths Apps|Maths)$/, " | JC and LC Maths");
    const mainBrand = document.querySelector(".topbar .brand img");
    if (mainBrand) mainBrand.alt = "JC and LC Maths, by Mr Ronan Downes";
    const mainBrandLink = document.querySelector(".topbar .brand");
    if (mainBrandLink) mainBrandLink.setAttribute("aria-label", "JC and LC Maths home");

    // Four-dot quick links are separate from the Maths logo. Logo remains Home.
    function addQuickLinks(bar){
      if(!bar||bar.querySelector(".maths-quick-links"))return;
      const links=[
        ["red","A · Apps","https://ronandownes.github.io/maths/"],
        ["green","B · Maths Book","https://ronandownes.github.io/book/"],
        ["blue","C · Calculator","https://ronandownes.github.io/calculator/"],
        ["black","D · Desmos","https://www.desmos.com/calculator"]
      ];
      const nav=document.createElement("nav");
      nav.className="maths-quick-links";
      nav.setAttribute("aria-label","Quick links: A Apps, B Book, C Calculator, D Desmos");
      links.forEach(([colour,label,href])=>{
        const link=document.createElement("a");
        link.className="maths-quick-dot maths-quick-"+colour;
        link.href=href;
        link.title=label;
        link.setAttribute("aria-label",label);
        if(colour==="black"){link.target="_blank";link.rel="noopener noreferrer";}
        const dot=document.createElement("i");
        dot.setAttribute("aria-hidden","true");
        link.append(dot);
        nav.append(link);
      });
      const before=bar.querySelector(".menu-toggle,#menu-toggle,#main-menu,#maths-app-menu-toggle,#maths-app-strands");
      if(before)bar.insertBefore(nav,before);
      else bar.append(nav);
    }
    addQuickLinks(document.querySelector(".topbar"));

    if (topic) {
      document.body.classList.add("maths-topic-page");
      const paper = document.querySelector("main.paper");
      const toolbar = paper?.querySelector(":scope > .toolbar");
      if (paper && toolbar) paper.insertBefore(toolbar, paper.firstElementChild);
    }
 // Embedded explorer already has its book's navigation.
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
      brand.setAttribute("aria-label", "JC and LC Maths home");
      const logo = document.createElement("img");
      logo.alt = "JC and LC Maths, by Mr Ronan Downes";
      logo.src = url("assets/maths-logo.svg");
      brand.append(logo);
      bar.append(brand);
      addQuickLinks(bar);

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
    if (sidebar) renderSidebar(sidebar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();