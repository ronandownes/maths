(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const state = { level: "foundation", setCount: 2, operation: "all" };
  const levels = { foundation: 0, core: 1, challenge: 2 };
  const screens = ["watch", "explore", "practice", "quiz", "game", "test", "pair-work"];
  const appStatus = $("appStatus");
  const activityMenu = $("activityMenu");
  const activitiesToggle = $("activitiesToggle");
  const settingsPanel = $("settingsPanel");
  const settingsToggle = $("settingsToggle");
  const operationButtons = $("operationButtons");
  const canvas = $("vennCanvas");
  const ctx = canvas.getContext("2d");

  function announce(message) {
    appStatus.textContent = message;
    appStatus.hidden = false;
  }

  function clearAnnouncement() {
    appStatus.textContent = "";
    appStatus.hidden = true;
  }

  function showScreen(name, updateHash) {
    if (!screens.includes(name)) name = "watch";
    screens.forEach((item) => {
      $("screen-" + item).hidden = item !== name;
      const button = document.querySelector('[data-view="' + item + '"]');
      if (button) button.setAttribute("aria-pressed", String(item === name));
    });
    if (updateHash) history.replaceState(null, "", "#" + name);
    if (window.matchMedia("(max-width: 720px)").matches) {
      activityMenu.hidden = true;
      activitiesToggle.setAttribute("aria-expanded", "false");
    }
    clearAnnouncement();
    if (name === "explore") drawDiagram();
    if (name === "practice") renderPractice();
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.view, true));
  });

  const mediaMobile = window.matchMedia("(max-width: 720px)");
  function syncMenus() {
    if (mediaMobile.matches) {
      activityMenu.hidden = true;
      activitiesToggle.hidden = false;
    } else {
      activityMenu.hidden = false;
      activitiesToggle.hidden = true;
    }
  }
  if (mediaMobile.addEventListener) mediaMobile.addEventListener("change", syncMenus);
  else if (mediaMobile.addListener) mediaMobile.addListener(syncMenus);
  syncMenus();

  activitiesToggle.addEventListener("click", () => {
    activityMenu.hidden = !activityMenu.hidden;
    activitiesToggle.setAttribute("aria-expanded", String(!activityMenu.hidden));
  });

  const siteToggle = $("siteMenuToggle");
  const headerLinks = document.querySelector(".header-links");
  if (siteToggle && headerLinks) {
    siteToggle.addEventListener("click", () => {
      const open = headerLinks.classList.toggle("is-open");
      siteToggle.setAttribute("aria-expanded", String(open));
    });
  }

  function toggleSettings(open) {
    const next = typeof open === "boolean" ? open : settingsPanel.hidden;
    settingsPanel.hidden = !next;
    settingsToggle.setAttribute("aria-expanded", String(next));
    if (next) $("settingsClose").focus();
  }
  settingsToggle.addEventListener("click", () => toggleSettings());
  $("settingsClose").addEventListener("click", () => toggleSettings(false));

  function updateSettingButtons() {
    document.querySelectorAll("[data-level]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.level === state.level));
    });
    document.querySelectorAll("[data-set-count]").forEach((button) => {
      const count = Number(button.dataset.setCount);
      button.setAttribute("aria-pressed", String(count === state.setCount));
      button.disabled = count === 3 && state.level !== "challenge";
    });
    $("practiceLevelBadge").textContent = state.level[0].toUpperCase() + state.level.slice(1);
  }

  document.querySelectorAll("[data-level]").forEach((button) => {
    button.addEventListener("click", () => {
      state.level = button.dataset.level;
      if (state.level !== "challenge" && state.setCount === 3) state.setCount = 2;
      updateSettingButtons();
      updateOperations();
      drawDiagram();
      if (! $("screen-practice").hidden) renderPractice(true);
      if (! $("screen-quiz").hidden && quizQuestions.length) startQuiz();
      if (! $("screen-test").hidden && testQuestions.length) startTest();
    });
  });

  document.querySelectorAll("[data-set-count]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.setCount = Number(button.dataset.setCount);
      state.operation = "all";
      updateSettingButtons();
      updateOperations();
      drawDiagram();
      if (! $("screen-practice").hidden) renderPractice(true);
      if (! $("screen-quiz").hidden && quizQuestions.length) startQuiz();
      if (! $("screen-test").hidden && testQuestions.length) startTest();
    });
  });

  const watchSteps = [
    {
      title: "Start with one collection",
      subtitle: "A set of four seasons",
      text: "A set is a collection of distinct elements. Each solid dot is one season. The oval shows the collection; it does not need a rectangle around it.",
      math: "A = {Spring, Summer, Autumn, Winter}",
      svg: seasonsSvg()
    },
    {
      title: "Order and repetition do not change a set",
      subtitle: "Count distinct elements",
      text: "The same elements can be written in a different order. Writing one element twice does not make a second element. Cardinality counts each distinct element once.",
      math: "A = {2, 4, 6, 8} = {8, 4, 2, 2}   so   #A = 4",
      svg: listSvg()
    },
    {
      title: "Now compare two sets",
      subtitle: "Two ovals can overlap",
      text: "Each oval is one set. The overlap is where an element can belong to both sets. There is no universal-set rectangle in this first two-set model.",
      math: "A                         B",
      svg: vennSvg("all")
    },
    {
      title: "Place each element once",
      subtitle: "One list, two overlapping sets",
      text: "A = {1, 2, 3} and B = {3, 4}. Put 1 and 2 in A only, 3 in both, and 4 in B only. This is a worked example to watch before trying one yourself.",
      math: "A ∩ B = {3}     A ∪ B = {1, 2, 3, 4}",
      svg: elementsSvg()
    },
    {
      title: "The shared part is the intersection",
      subtitle: "Both A and B",
      text: "The intersection contains exactly the elements that belong to A and B. Read the symbol as “A intersection B”, or simply “both”.",
      math: "A ∩ B = elements in A and in B",
      svg: vennSvg("both")
    },
    {
      title: "The union means at least one",
      subtitle: "A or B or both",
      text: "The union includes the A-only part, the overlap and the B-only part. Mathematical “or” includes the shared elements.",
      math: "A ∪ B = elements in A, in B, or in both",
      svg: vennSvg("union")
    },
    {
      title: "Only A means in A but not B",
      subtitle: "Set difference",
      text: "The difference A minus B keeps the part of A outside B. The order matters: A\\B and B\\A usually describe different regions.",
      math: "A\\B = elements in A but not in B",
      svg: vennSvg("aOnly")
    },
    {
      title: "Cardinality comes from the regions",
      subtitle: "Count each region once",
      text: "If A has 15 elements, B has 12, and 5 are in both, the A-only region is 10 and the B-only region is 7. Add the three inside regions to count the union.",
      math: "#(A ∪ B) = 10 + 5 + 7 = 22",
      svg: countsSvg()
    },
    {
      title: "Solve a two-set problem",
      subtitle: "Place both first",
      text: "Fifteen students play football, twelve play an instrument, and five do both. Put five in the overlap first. Subtract it from each set total, then add the three regions.",
      math: "F only = 15 − 5 = 10     M only = 12 − 5 = 7     #(F ∪ M) = 22",
      svg: countsSvg()
    }
  ];
  let watchIndex = 0;

  function seasonsSvg() {
    return '<svg viewBox="0 0 700 380" role="img" aria-label="One oval A contains four distinct seasons"><rect width="700" height="380" fill="white"/><ellipse cx="350" cy="193" rx="305" ry="167" fill="#f7fafc" stroke="#225c86" stroke-width="5"/><text x="95" y="75" font-size="35" font-weight="700" fill="#174765">A</text><g font-size="31" fill="#173c57"><circle cx="160" cy="153" r="7" fill="#174765"/><text x="181" y="164">Spring</text><circle cx="401" cy="153" r="7" fill="#174765"/><text x="422" y="164">Summer</text><circle cx="160" cy="252" r="7" fill="#174765"/><text x="181" y="263">Autumn</text><circle cx="401" cy="252" r="7" fill="#174765"/><text x="422" y="263">Winter</text></g></svg>';
  }

  function listSvg() {
    return '<svg viewBox="0 0 700 380" role="img" aria-label="Two lists contain the same four distinct elements"><rect width="700" height="380" fill="white"/><rect x="35" y="38" width="630" height="305" rx="16" fill="#f7fafc" stroke="#d7e0e9" stroke-width="3"/><text x="350" y="118" font-size="39" text-anchor="middle" font-weight="700" fill="#174765">A = {2, 4, 6, 8}</text><text x="350" y="190" font-size="30" text-anchor="middle" fill="#53677b">same elements, different order</text><text x="350" y="255" font-size="39" text-anchor="middle" font-weight="700" fill="#174765">A = {8, 4, 2, 2, 6}</text><text x="350" y="310" font-size="28" text-anchor="middle" fill="#294b65">#A = 4 distinct elements</text></svg>';
  }

  function vennSvg(which) {
    let fills = "";
    if (which === "union") fills = '<ellipse cx="350" cy="205" rx="205" ry="145" fill="#e4af4f" fill-opacity=".56"/><ellipse cx="530" cy="205" rx="205" ry="145" fill="#e4af4f" fill-opacity=".56"/>';
    if (which === "both") fills = '<defs><clipPath id="watch-a"><ellipse cx="350" cy="205" rx="205" ry="145"/></clipPath></defs><g clip-path="url(#watch-a)"><ellipse cx="530" cy="205" rx="205" ry="145" fill="#e4af4f"/></g>';
    if (which === "aOnly") fills = '<defs><mask id="watch-mask"><rect width="700" height="380" fill="white"/><ellipse cx="530" cy="205" rx="205" ry="145" fill="black"/></mask></defs><ellipse cx="350" cy="205" rx="205" ry="145" fill="#e4af4f" mask="url(#watch-mask)"/>';
    return '<svg viewBox="0 0 900 480" role="img" aria-label="Two overlapping ovals A and B' + (which === "both" ? ", with the shared lens highlighted" : which === "aOnly" ? ", with only A highlighted" : which === "union" ? ", with the union highlighted" : "") + '"><rect width="900" height="480" fill="white"/>' + fills + '<ellipse cx="350" cy="205" rx="205" ry="145" fill="none" stroke="#225c86" stroke-width="6"/><ellipse cx="530" cy="205" rx="205" ry="145" fill="none" stroke="#38865f" stroke-width="6"/><text x="235" y="95" font-size="40" font-weight="700" fill="#225c86">A</text><text x="630" y="95" font-size="40" font-weight="700" fill="#38865f">B</text><text x="350" y="420" font-size="28" text-anchor="middle" fill="#31516a">A only</text><text x="530" y="420" font-size="28" text-anchor="middle" fill="#31516a">B only</text></svg>';
  }

  function elementsSvg() {
    return '<svg viewBox="0 0 900 480" role="img" aria-label="A equals 1, 2 and 3; B equals 3 and 4; the shared element 3 is in the overlap"><rect width="900" height="480" fill="white"/><ellipse cx="350" cy="205" rx="205" ry="145" fill="#dcebf7" fill-opacity=".7" stroke="#225c86" stroke-width="6"/><ellipse cx="530" cy="205" rx="205" ry="145" fill="#e4f1e8" fill-opacity=".7" stroke="#38865f" stroke-width="6"/><text x="235" y="95" font-size="40" font-weight="700" fill="#225c86">A</text><text x="630" y="95" font-size="40" font-weight="700" fill="#38865f">B</text><g font-size="37" font-weight="700" text-anchor="middle" fill="#173c57"><text x="270" y="220">1, 2</text><text x="440" y="220">3</text><text x="610" y="220">4</text></g><text x="450" y="420" font-size="28" text-anchor="middle" fill="#31516a">A = {1, 2, 3}     B = {3, 4}</text></svg>';
  }

  function countsSvg() {
    return '<svg viewBox="0 0 900 480" role="img" aria-label="Two overlapping sets show 10 in A only, 5 in both and 7 in B only"><rect width="900" height="480" fill="white"/><ellipse cx="350" cy="205" rx="205" ry="145" fill="#dcebf7" fill-opacity=".8" stroke="#225c86" stroke-width="6"/><ellipse cx="530" cy="205" rx="205" ry="145" fill="#e4f1e8" fill-opacity=".75" stroke="#38865f" stroke-width="6"/><text x="235" y="95" font-size="40" font-weight="700" fill="#225c86">A</text><text x="630" y="95" font-size="40" font-weight="700" fill="#38865f">B</text><g font-size="38" font-weight="700" text-anchor="middle" fill="#173c57"><text x="270" y="220">10</text><text x="440" y="220">5</text><text x="610" y="220">7</text></g><text x="450" y="420" font-size="28" text-anchor="middle" fill="#31516a">#A = 15      #B = 12      #(A ∪ B) = 22</text></svg>';
  }

  function renderWatch() {
    const step = watchSteps[watchIndex];
    $("watch-progress").textContent = "Guided example " + (watchIndex + 1) + " of " + watchSteps.length;
    $("watch-heading").textContent = step.title;
    $("watch-subtitle").textContent = step.subtitle;
    $("watch-text").textContent = step.text;
    $("watch-math").textContent = step.math;
    $("watchDiagram").innerHTML = step.svg;
    $("watchPrevious").disabled = watchIndex === 0;
    $("watchNext").textContent = watchIndex === watchSteps.length - 1 ? "Ready to practise →" : "Next step →";
    const dots = $("watchDots");
    dots.innerHTML = "";
    watchSteps.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "step-dot";
      button.textContent = String(index + 1);
      button.setAttribute("aria-label", "Show guided example " + (index + 1) + ": " + item.title);
      if (index === watchIndex) button.setAttribute("aria-current", "step");
      button.addEventListener("click", () => { watchIndex = index; renderWatch(); });
      dots.appendChild(button);
    });
  }
  $("watchPrevious").addEventListener("click", () => { watchIndex = Math.max(0, watchIndex - 1); renderWatch(); });
  $("watchNext").addEventListener("click", () => {
    if (watchIndex === watchSteps.length - 1) showScreen("practice", true);
    else watchIndex = Math.min(watchSteps.length - 1, watchIndex + 1);
    renderWatch();
  });
  $("listenSuchThat").addEventListener("click", () => {
    if (!("speechSynthesis" in window)) { announce("Read it aloud: “such that”."); return; }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance("such that");
    speech.lang = "en-IE";
    window.speechSynthesis.speak(speech);
  });

  function operationList() {
    if (state.setCount === 2) {
      return [
        { id: "all", label: "Show both sets", title: "Two sets", meaning: "Each oval is a set. Their overlap shows the elements that belong to both." },
        { id: "both", label: "Both · A ∩ B", title: "Intersection · A ∩ B", meaning: "Only the shared part is selected: elements in A and in B." },
        { id: "union", label: "At least one · A ∪ B", title: "Union · A ∪ B", meaning: "The union contains every element in A, in B, or in both. The shared part is included once." },
        { id: "aOnly", label: "Only A · A \\ B", title: "Difference · A \\ B", meaning: "This is the part in A but not in B. The order matters." },
        { id: "bOnly", label: "Only B · B \\ A", title: "Difference · B \\ A", meaning: "This is the part in B but not in A. It can be different from A \\ B." }
      ];
    }
    return [
      { id: "all", label: "Show all regions", title: "Three sets", meaning: "Three ovals divide the diagram into eight regions: seven inside at least one set, plus the all-three overlap." },
      { id: "triple", label: "All three · A ∩ B ∩ C", title: "Intersection · A ∩ B ∩ C", meaning: "Only the centre shared by all three sets is selected." },
      { id: "union", label: "At least one · A ∪ B ∪ C", title: "Union · A ∪ B ∪ C", meaning: "The union contains every element that belongs to at least one of the three sets." },
      { id: "aOnly", label: "A only", title: "A only", meaning: "This region belongs to A and to neither B nor C." },
      { id: "abOnly", label: "A and B only", title: "A and B only", meaning: "This pair-only region belongs to A and B but not to C." },
      { id: "exactlyTwo", label: "Exactly two sets", title: "Exactly two sets", meaning: "The three pair-only regions are selected. The centre belongs to all three, so it is excluded." },
      { id: "difference", label: "A \\ B", title: "Difference · A \\ B", meaning: "This selects the part of A that is outside B. It may still overlap C." }
    ];
  }

  function updateOperations() {
    operationButtons.innerHTML = "";
    operationList().forEach((operation) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = operation.label;
      button.dataset.operation = operation.id;
      button.setAttribute("aria-pressed", String(operation.id === state.operation));
      button.addEventListener("click", () => {
        state.operation = operation.id;
        operationButtons.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        renderOperation();
        drawDiagram();
      });
      operationButtons.appendChild(button);
    });
    $("twoSetEditor").hidden = state.setCount === 3;
    $("threeRegionSummary").hidden = state.setCount === 2;
    renderOperation();
  }


  function renderOperation() {
    const operation = operationList().find((item) => item.id === state.operation) || operationList()[0];
    $("operationName").textContent = operation.title;
    $("operationMeaning").textContent = operation.meaning;
    operationButtons.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.operation === operation.id)));
    if (state.setCount === 2) renderTwoSetCounts();
    else renderThreeSetCounts();
  }

  function readTwoSetCounts() {
    return {
      a: Number($("inputA").value),
      b: Number($("inputB").value),
      both: Number($("inputBoth").value)
    };
  }

  function renderTwoSetCounts() {
    const data = readTwoSetCounts();
    const feedback = $("countFeedback");
    const valid = [data.a, data.b, data.both].every((value) => Number.isInteger(value) && value >= 0 && value <= 100) && data.both <= Math.min(data.a, data.b);
    if (!valid) {
      feedback.textContent = "The shared count must be a whole number no greater than either set total.";
      $("regionSummary").innerHTML = "";
      return;
    }
    feedback.textContent = "";
    const onlyA = data.a - data.both;
    const onlyB = data.b - data.both;
    const union = onlyA + data.both + onlyB;
    $("regionSummary").innerHTML =
      '<div class="region-count"><strong>A only</strong><span>' + onlyA + '</span></div>' +
      '<div class="region-count"><strong>Both · A ∩ B</strong><span>' + data.both + '</span></div>' +
      '<div class="region-count"><strong>B only</strong><span>' + onlyB + '</span></div>' +
      '<div class="region-count"><strong>Union · A ∪ B</strong><span>' + union + '</span></div>';
  }

  function renderThreeSetCounts() {
    const values = [
      ["A only", 9], ["B only", 8], ["C only", 6], ["A and B only", 5],
      ["A and C only", 4], ["B and C only", 3], ["All three", 2], ["Union", 37]
    ];
    $("regionSummary").innerHTML = values.map((item) =>
      '<div class="region-count"><strong>' + item[0] + '</strong><span>' + item[1] + '</span></div>'
    ).join("");
  }

  ["inputA", "inputB", "inputBoth"].forEach((id) => {
    $(id).addEventListener("input", () => {
      renderTwoSetCounts();
      drawDiagram();
    });
  });

  function circlePath(circle) {
    const path = new Path2D();
    path.ellipse(circle.x, circle.y, circle.r, circle.r, 0, 0, Math.PI * 2);
    return path;
  }

  function paintRegion(paths, include, exclude) {
    const shadeCanvas = document.createElement("canvas");
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    shadeCanvas.width = 900 * ratio;
    shadeCanvas.height = 520 * ratio;
    const shadeContext = shadeCanvas.getContext("2d");
    shadeContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    shadeContext.save();
    include.forEach((index) => shadeContext.clip(paths[index]));
    shadeContext.fillStyle = "rgba(231, 168, 61, .68)";
    shadeContext.fillRect(0, 0, 900, 520);
    if (exclude.length) {
      shadeContext.globalCompositeOperation = "destination-out";
      exclude.forEach((index) => shadeContext.clip(paths[index]));
      shadeContext.fillRect(0, 0, 900, 520);
    }
    shadeContext.restore();
    ctx.drawImage(shadeCanvas, 0, 0, 900, 520);
  }

  function drawDiagram() {
    if (!ctx || !canvas) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = 900 * ratio;
    canvas.height = 520 * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, 900, 520);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 900, 520);

    const circles = state.setCount === 2
      ? [{ x: 350, y: 260, r: 180 }, { x: 550, y: 260, r: 180 }]
      : [{ x: 365, y: 205, r: 160 }, { x: 535, y: 205, r: 160 }, { x: 450, y: 340, r: 160 }];
    const paths = circles.map(circlePath);
    const labels = state.setCount === 2
      ? [{ x: 230, y: 120, t: "A" }, { x: 650, y: 120, t: "B" }]
      : [{ x: 280, y: 100, t: "A" }, { x: 610, y: 100, t: "B" }, { x: 435, y: 500, t: "C" }];

    const op = state.operation;
    if (op === "all") {
      circles.forEach((circle, index) => {
        ctx.beginPath();
        ctx.ellipse(circle.x, circle.y, circle.r, circle.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? "rgba(65, 132, 187, .18)" : index === 1 ? "rgba(74, 145, 108, .18)" : "rgba(213, 141, 69, .18)";
        ctx.fill();
      });
    } else if (op === "union") {
      circles.forEach((circle) => {
        ctx.beginPath();
        ctx.ellipse(circle.x, circle.y, circle.r, circle.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f2d28b";
        ctx.fill();
      });
    } else if (op === "both") {
      paintRegion(paths, [0, 1], [], null);
    } else if (op === "aOnly") {
      paintRegion(paths, [0], [1], null);
    } else if (op === "bOnly") {
      paintRegion(paths, [1], [0], null);
    } else if (op === "triple") {
      paintRegion(paths, [0, 1, 2], [], null);
    } else if (op === "abOnly") {
      paintRegion(paths, [0, 1], [2], null);
    } else if (op === "exactlyTwo") {
      paintRegion(paths, [0, 1], [2], null);
      paintRegion(paths, [0, 2], [1], null);
      paintRegion(paths, [1, 2], [0], null);
    } else if (op === "difference") {
      paintRegion(paths, [0], [1], null);
    }

    circles.forEach((circle, index) => {
      ctx.beginPath();
      ctx.ellipse(circle.x, circle.y, circle.r, circle.r, 0, 0, Math.PI * 2);
      ctx.strokeStyle = index === 0 ? "#225c86" : index === 1 ? "#38865f" : "#a45a32";
      ctx.lineWidth = 5;
      ctx.stroke();
    });
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 36px Arial";
    labels.forEach((label, index) => {
      ctx.fillStyle = index === 0 ? "#225c86" : index === 1 ? "#38865f" : "#a45a32";
      ctx.fillText(label.t, label.x, label.y);
    });
    canvas.setAttribute("aria-label", state.setCount + " overlapping sets. " + $("operationName").textContent + ". The selected region is described in text beside the diagram.");
  }

  ["inputA", "inputB", "inputBoth"].forEach((id) => $(id).addEventListener("change", renderTwoSetCounts));
  window.addEventListener("resize", drawDiagram);

  const questionBank = [
    { id:"f1", level:"foundation", sets:2, prompt:"A = {red, blue, blue, green}. What is #A?", options:["2","3","4"], answer:1, why:"There are three distinct elements: red, blue and green. Repeating blue does not add another element." },
    { id:"f2", level:"foundation", sets:2, prompt:"P = {1, 3, 5} and Q = {5, 3, 1, 1}. Which statement is true?", options:["P = Q","P has more elements than Q","Q is a different set because it repeats 1"], answer:0, why:"The distinct elements are the same. Order and repetition do not change a set." },
    { id:"f3", level:"foundation", sets:2, prompt:"A = {1, 2, 3} and B = {3, 4}. What is A ∩ B?", options:["{1, 2, 3, 4}","{3}","{1, 2}"], answer:1, why:"The intersection contains the elements that are in both sets. Only 3 is shared." },
    { id:"f4", level:"foundation", sets:2, prompt:"A = {1, 2, 3} and B = {3, 4}. What is A ∪ B?", options:["{3}","{1, 2, 3, 4}","{1, 2, 4}"], answer:1, why:"The union contains every element in A or B or both. List each distinct element once." },
    { id:"f5", level:"foundation", sets:2, prompt:"A = {1, 2, 3, 4} and B = {2, 4}. What is A \\ B?", options:["{2, 4}","{1, 3}","{1, 2, 3, 4}"], answer:1, why:"A \\ B means in A but not in B, so keep 1 and 3." },
    { id:"f6", level:"foundation", sets:2, prompt:"A has 15 elements, B has 12, and 5 are in both. How many are in A only?", options:["10","7","15"], answer:0, why:"Subtract the shared elements from A: 15 − 5 = 10." },
    { id:"f7", level:"foundation", sets:2, prompt:"A has 15 elements, B has 12, and 5 are in both. How many are in A ∪ B?", options:["27","22","17"], answer:1, why:"The shared 5 have been counted twice by 15 + 12, so subtract them once: 15 + 12 − 5 = 22." },
    { id:"f8", level:"foundation", sets:2, prompt:"Which phrase describes A ∩ B?", options:["In A and in B","In A or in B or both","In A but not B"], answer:0, why:"Intersection means the elements shared by both sets." },

    { id:"c1", level:"core", sets:2, prompt:"15 students play football, 12 play an instrument, and 5 do both. How many play football only?", options:["10","7","15"], answer:0, why:"Football only is 15 − 5 = 10." },
    { id:"c2", level:"core", sets:2, prompt:"15 students play football, 12 play an instrument, and 5 do both. How many play an instrument only?", options:["5","7","12"], answer:1, why:"Instrument only is 12 − 5 = 7." },
    { id:"c3", level:"core", sets:2, prompt:"Using the same counts, how many students play at least one of the two activities?", options:["27","22","17"], answer:1, why:"At least one means the union: 15 + 12 − 5 = 22." },
    { id:"c4", level:"core", sets:2, prompt:"#A = 18, #B = 16 and #(A ∪ B) = 28. Find #(A ∩ B).", options:["6","28","34"], answer:0, why:"The union formula gives 28 = 18 + 16 − #(A ∩ B), so the overlap is 6." },
    { id:"c5", level:"core", sets:2, prompt:"Which expression means “in B but not in A”?", options:["A \\ B","A ∩ B","B \\ A"], answer:2, why:"The set named first is the set you keep. B \\ A keeps elements in B that are not in A." },
    { id:"c6", level:"core", sets:2, prompt:"A has 17 elements and 6 are shared with B. How many are in A only?", options:["11","6","23"], answer:0, why:"The A-only count is #A − #(A ∩ B) = 17 − 6 = 11." },
    { id:"c7", level:"core", sets:2, prompt:"A = {a, b, c} and B = {c, d, e}. What is #(A ∪ B)?", options:["6","5","1"], answer:1, why:"The five distinct elements are a, b, c, d and e. The shared c is counted once." },
    { id:"c8", level:"core", sets:2, prompt:"Why is #A + #B usually larger than #(A ∪ B) when the sets overlap?", options:["The shared elements are counted twice","The shared elements are missing","Union means only the overlap"], answer:0, why:"Every element in both sets appears in both set totals, so the overlap is counted twice." },

    { id:"d1", level:"challenge", sets:2, prompt:"#A = 24, #B = 21 and #(A ∩ B) = 10. Find #(A ∪ B).", options:["55","35","14"], answer:1, why:"Use the two-set formula: 24 + 21 − 10 = 35." },
    { id:"d2", level:"challenge", sets:2, prompt:"#A = 19, #B = 17 and #(A ∪ B) = 28. Find #(A ∩ B).", options:["8","36","11"], answer:0, why:"The overlap is 19 + 17 − 28 = 8." },
    { id:"d3", level:"challenge", sets:2, prompt:"#A = 20 and #(A ∩ B) = 6. How many elements are in A only?", options:["14","6","26"], answer:0, why:"A only is #A − #(A ∩ B) = 20 − 6 = 14." },
    { id:"d4", level:"challenge", sets:2, prompt:"#A = 15, #B = 12 and #(A ∩ B) = 5. How many are in exactly one set?", options:["17","22","5"], answer:0, why:"A only is 10 and B only is 7. Exactly one is 10 + 7 = 17." },
    { id:"d5", level:"challenge", sets:2, prompt:"A and B have 8 and 7 elements. A proposed overlap is 9. What can you conclude?", options:["It is possible","It is impossible: the overlap cannot exceed the smaller set","It means the union is 9"], answer:1, why:"The intersection is a subset of both sets, so its cardinality cannot exceed 7." },
    { id:"d6", level:"challenge", sets:2, prompt:"#A = 18, #B = 15 and #(A ∪ B) = 25. How many are in A only?", options:["8","7","10"], answer:2, why:"The overlap is 18 + 15 − 25 = 8. A only is 18 − 8 = 10." },
    { id:"d7", level:"challenge", sets:2, prompt:"A = {1, 2, 3, 4, 5} and B = {2, 4, 6}. How many elements are in exactly one set?", options:["4","5","2"], answer:0, why:"A only is {1, 3, 5} and B only is {6}, giving 4 elements in exactly one set." },
    { id:"d8", level:"challenge", sets:2, prompt:"Which identity explains why the overlap is subtracted once when counting a union?", options:["#(A ∪ B) = #A + #B − #(A ∩ B)","#(A ∪ B) = #A × #B","#(A ∪ B) = #A − #B"], answer:0, why:"Adding #A and #B counts every shared element twice. Subtract the intersection once." },

    { id:"t1", level:"challenge", sets:3, prompt:"In three sets, 5 are in A and B only, 4 in A and C only, 3 in B and C only, and 2 in all three. How many are in exactly two sets?", options:["12","14","2"], answer:0, why:"Exactly two means the three pair-only regions: 5 + 4 + 3 = 12." },
    { id:"t2", level:"challenge", sets:3, prompt:"#A = 20. The A-and-B-only region is 5, the A-and-C-only region is 4, and all three is 2. How many are A only?", options:["9","11","13"], answer:0, why:"Subtract every other part of A: 20 − 5 − 4 − 2 = 9." },
    { id:"t3", level:"challenge", sets:3, prompt:"#B = 18. The A-and-B-only region is 5, B-and-C-only is 3, and all three is 2. How many are B only?", options:["8","10","13"], answer:0, why:"B only is 18 − 5 − 3 − 2 = 8." },
    { id:"t4", level:"challenge", sets:3, prompt:"How many are in at least two sets if 5 are in A and B only, 4 in A and C only, 3 in B and C only, and 2 in all three?", options:["12","14","7"], answer:1, why:"At least two includes the three pair-only regions and the centre: 5 + 4 + 3 + 2 = 14." },
    { id:"t5", level:"challenge", sets:3, prompt:"A set A has 20 elements. Its other regions contain 5 in A-and-B-only, 4 in A-and-C-only, and 2 in all three. How many are A only?", options:["9","11","15"], answer:0, why:"20 − 5 − 4 − 2 = 9." },
    { id:"t6", level:"challenge", sets:3, prompt:"The seven inside regions have counts 9, 8, 6, 5, 4, 3 and 2. What is #(A ∪ B ∪ C)?", options:["37","40","53"], answer:0, why:"The union contains all seven inside regions, each counted once: the total is 37." },
    { id:"t7", level:"challenge", sets:3, prompt:"A student says the all-three region is part of A ∩ B. Is the student right?", options:["Yes; an element in all three is also in A and B","No; A ∩ B means exactly two sets","Only if A and B have equal size"], answer:0, why:"A ∩ B includes all elements in both A and B, including any that also belong to C." },
    { id:"t8", level:"challenge", sets:3, prompt:"Why do pair-only regions and the all-three region need different labels?", options:["The centre belongs to all three sets, not exactly one pair","There is no difference","The centre is outside every set"], answer:0, why:"The centre is shared by A, B and C. It must not be counted as a pair-only element." }
  ];

  function eligibleQuestions() {
    return questionBank.filter((item) =>
      levels[item.level] <= levels[state.level] && item.sets <= state.setCount
    );
  }

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i]; result[i] = result[j]; result[j] = temp;
    }
    return result;
  }

  function chooseQuestions(count) {
    const pool = shuffle(eligibleQuestions());
    if (pool.length <= count) return pool;
    return pool.slice(0, count);
  }

  function buildOptions(container, question, onSelect, selected, locked) {
    container.innerHTML = "";
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String.fromCharCode(65 + index) + ".  " + option;
      if (selected === index) button.classList.add("selected");
      if (locked) {
        button.disabled = true;
        if (index === question.answer) button.classList.add("correct");
        else if (index === selected) button.classList.add("incorrect");
      }
      button.addEventListener("click", () => onSelect(index));
      container.appendChild(button);
    });
  }

  let practiceQuestions = [];
  let practiceIndex = 0;
  let practiceSelected = {};
  function renderPractice(reset) {
    if (reset || !practiceQuestions.length) {
      practiceQuestions = shuffle(eligibleQuestions());
      practiceIndex = 0;
      practiceSelected = {};
    }
    if (!practiceQuestions.length) return;
    const question = practiceQuestions[practiceIndex];
    $("practiceLevelBadge").textContent = state.level[0].toUpperCase() + state.level.slice(1) + (state.setCount === 3 ? " · 3 sets" : " · 2 sets");
    $("practiceProgress").textContent = "Question " + (practiceIndex + 1) + " of " + practiceQuestions.length;
    $("practicePrompt").textContent = question.prompt;
    $("practiceFeedback").textContent = "";
    $("practiceFeedback").className = "answer-feedback";
    $("practiceReasoning").open = false;
    $("practiceReasoning").hidden = true;
    $("practiceWhy").textContent = question.why;
    const selected = practiceSelected[question.id];
    buildOptions($("practiceOptions"), question, (index) => {
      practiceSelected[question.id] = index;
      buildOptions($("practiceOptions"), question, () => {}, index, true);
      const correct = index === question.answer;
      $("practiceFeedback").textContent = correct ? "Correct. " + question.why : "Not quite. Look at the meaning of the region, then show the reasoning.";
      $("practiceFeedback").classList.add(correct ? "correct-text" : "incorrect-text");
      $("practiceReasoning").hidden = false;
    }, selected, selected !== undefined);
    if (selected !== undefined) {
      const correct = selected === question.answer;
      $("practiceFeedback").textContent = correct ? "Correct. " + question.why : "Try the reasoning again, then change your answer if needed.";
      $("practiceFeedback").classList.add(correct ? "correct-text" : "incorrect-text");
      $("practiceReasoning").hidden = false;
    }
    $("practicePrevious").disabled = practiceIndex === 0;
    $("practiceNext").textContent = practiceIndex === practiceQuestions.length - 1 ? "Finish →" : "Next →";
  }
  $("practiceNew").addEventListener("click", () => renderPractice(true));
  $("practicePrevious").addEventListener("click", () => { practiceIndex = Math.max(0, practiceIndex - 1); renderPractice(); });
  $("practiceNext").addEventListener("click", () => {
    if (practiceIndex === practiceQuestions.length - 1) {
      announce("You reached the end of this practice set. Choose “New question set” for another mix.");
      return;
    }
    practiceIndex += 1;
    renderPractice();
  });

  let quizQuestions = [];
  let quizAnswers = [];
  let quizIndex = 0;
  function startQuiz() {
    quizQuestions = chooseQuestions(8);
    quizAnswers = Array(quizQuestions.length).fill(null);
    quizIndex = 0;
    $("quizCard").hidden = false;
    $("quizNav").hidden = false;
    $("quizResult").hidden = true;
    renderQuiz();
  }
  function renderQuiz() {
    if (!quizQuestions.length) return;
    const question = quizQuestions[quizIndex];
    $("quizProgress").textContent = "Question " + (quizIndex + 1) + " of " + quizQuestions.length + " · " + quizAnswers.filter((x) => x !== null).length + " answered";
    $("quizPrompt").textContent = question.prompt;
    $("quizFeedback").textContent = "";
    $("quizFeedback").className = "answer-feedback";
    $("quizReasoning").hidden = true;
    $("quizReasoning").open = false;
    $("quizWhy").textContent = question.why;
    const answer = quizAnswers[quizIndex];
    buildOptions($("quizOptions"), question, (index) => {
      quizAnswers[quizIndex] = index;
      renderQuiz();
      const correct = index === question.answer;
      $("quizFeedback").textContent = correct ? "Correct. " + question.why : "Check the meaning, then read the explanation.";
      $("quizFeedback").classList.add(correct ? "correct-text" : "incorrect-text");
      $("quizReasoning").hidden = false;
    }, answer, answer !== null);
    if (answer !== null) {
      $("quizFeedback").textContent = answer === question.answer ? "Correct. " + question.why : "Read the explanation, then continue.";
      $("quizFeedback").classList.add(answer === question.answer ? "correct-text" : "incorrect-text");
      $("quizReasoning").hidden = false;
    }
    $("quizPrevious").disabled = quizIndex === 0;
    $("quizNext").textContent = quizIndex === quizQuestions.length - 1 ? "Finish quiz →" : "Next →";
  }
  function finishQuiz() {
    const score = quizAnswers.reduce((total, answer, index) => total + (answer === quizQuestions[index].answer ? 1 : 0), 0);
    $("quizCard").hidden = true;
    $("quizNav").hidden = true;
    $("quizResult").hidden = false;
    $("quizResult").innerHTML = "<h3>Quiz complete</h3><p class=\"score\">" + score + " / " + quizQuestions.length + "</p><p>Use the explanations below to decide what to practise next.</p><ol>" +
      quizQuestions.map((question, index) => "<li><strong>" + escapeHtml(question.prompt) + "</strong><br>" + (quizAnswers[index] === question.answer ? "Correct. " : "Review: ") + escapeHtml(question.why) + "</li>").join("") + "</ol><button type=\"button\" id=\"quizAgain\" class=\"primary-button\">Try another quiz</button>";
    $("quizAgain").addEventListener("click", startQuiz);
  }
  $("quizStart").addEventListener("click", startQuiz);
  $("quizPrevious").addEventListener("click", () => { quizIndex = Math.max(0, quizIndex - 1); renderQuiz(); });
  $("quizNext").addEventListener("click", () => {
    if (quizIndex === quizQuestions.length - 1) finishQuiz();
    else { quizIndex += 1; renderQuiz(); }
  });

  const gameItems = [
    { prompt: "Elements in A and B", answer: "A ∩ B", sets: 2 },
    { prompt: "Elements in A, in B, or in both", answer: "A ∪ B", sets: 2 },
    { prompt: "Elements in A but not B", answer: "A \\ B", sets: 2 },
    { prompt: "Elements in B but not A", answer: "B \\ A", sets: 2 },
    { prompt: "Elements in all three sets", answer: "A ∩ B ∩ C", sets: 3 },
    { prompt: "Elements in exactly two of three sets", answer: "A and B only, A and C only, or B and C only", sets: 3 },
    { prompt: "The shared centre of three sets", answer: "A ∩ B ∩ C", sets: 3 }
  ];
  let gameTimer = null;
  let gameSeconds = 60;
  let gameScore = 0;
  let gameRound = 0;
  let gameCurrent = null;
  function nextGamePrompt() {
    const available = gameItems.filter((item) => item.sets <= state.setCount);
    gameCurrent = available[Math.floor(Math.random() * available.length)];
    $("gamePrompt").textContent = "Which notation or phrase matches: “" + gameCurrent.prompt + "”?";
    $("gamePromptLabel").textContent = "Round " + (gameRound + 1);
    $("gameFeedback").textContent = "";
    const uniqueAnswers = Array.from(new Set(available.map((item) => item.answer)));
    const options = shuffle(uniqueAnswers).slice(0, Math.min(4, uniqueAnswers.length));
    if (!options.includes(gameCurrent.answer)) options[0] = gameCurrent.answer;
    buildOptions($("gameOptions"), { options: shuffle(options), answer: -1 }, (index) => {
      const chosen = $("gameOptions").children[index].textContent.replace(/^[A-D]\.\s*/, "");
      const correct = chosen === gameCurrent.answer;
      if (correct) { gameScore += 1; gameRound += 1; $("gameFeedback").textContent = "Correct."; $("gameFeedback").className = "answer-feedback correct-text"; $("gameScore").textContent = String(gameScore); $("gameRound").textContent = String(gameRound); setTimeout(() => { if (gameTimer) nextGamePrompt(); }, 500); }
      else { $("gameFeedback").textContent = "Try again. The clue is “" + gameCurrent.prompt + "”."; $("gameFeedback").className = "answer-feedback incorrect-text"; }
    }, null, false);
  }
  function endGame() {
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = null;
    $("gameStart").textContent = "Play another round";
    $("gameFeedback").textContent = "Round over. You matched " + gameScore + " regions. Read the clues aloud and try again.";
    $("gameFeedback").className = "answer-feedback";
  }
  $("gameStart").addEventListener("click", () => {
    if (gameTimer) clearInterval(gameTimer);
    gameSeconds = 60; gameScore = 0; gameRound = 0;
    $("gameTimer").textContent = "60"; $("gameScore").textContent = "0"; $("gameRound").textContent = "0";
    $("gameStart").textContent = "Round in progress…";
    nextGamePrompt();
    gameTimer = setInterval(() => {
      gameSeconds -= 1;
      $("gameTimer").textContent = String(gameSeconds);
      if (gameSeconds <= 0) endGame();
    }, 1000);
  });

  let testQuestions = [];
  let testAnswers = [];
  let testIndex = 0;
  let testSubmitted = false;
  function startTest() {
    testQuestions = chooseQuestions(10);
    testAnswers = Array(testQuestions.length).fill(null);
    testIndex = 0;
    testSubmitted = false;
    $("testCard").hidden = false;
    $("testNav").hidden = false;
    $("testResult").hidden = true;
    renderTest();
  }
  function renderTest() {
    if (!testQuestions.length || testSubmitted) return;
    const question = testQuestions[testIndex];
    $("testProgress").textContent = "Question " + (testIndex + 1) + " of " + testQuestions.length + " · " + testAnswers.filter((x) => x !== null).length + " answered";
    $("testPrompt").textContent = question.prompt;
    buildOptions($("testOptions"), question, (index) => {
      testAnswers[testIndex] = index;
      renderTest();
    }, testAnswers[testIndex], false);
    $("testPrevious").disabled = testIndex === 0;
    $("testNext").textContent = testIndex === testQuestions.length - 1 ? "Review →" : "Next →";
  }
  function submitTest() {
    testSubmitted = true;
    const score = testAnswers.reduce((total, answer, index) => total + (answer === testQuestions[index].answer ? 1 : 0), 0);
    $("testCard").hidden = true;
    $("testNav").hidden = true;
    $("testResult").hidden = false;
    $("testProgress").textContent = "Submitted";
    $("testResult").innerHTML = "<h3>Test submitted</h3><p class=\"score\">" + score + " / " + testQuestions.length + "</p><p>Review the reasoning and choose a topic to practise again.</p><ol>" +
      testQuestions.map((question, index) => "<li><strong>" + escapeHtml(question.prompt) + "</strong><br>" + (testAnswers[index] === question.answer ? "Correct. " : "Review: ") + escapeHtml(question.why) + "</li>").join("") + "</ol><button type=\"button\" id=\"testAgain\" class=\"primary-button\">Start a new test</button>";
    $("testAgain").addEventListener("click", startTest);
  }
  $("testStart").addEventListener("click", startTest);
  $("testPrevious").addEventListener("click", () => { testIndex = Math.max(0, testIndex - 1); renderTest(); });
  $("testNext").addEventListener("click", () => {
    if (testIndex === testQuestions.length - 1) { $("testProgress").textContent = "Last question reached. Review your choices, then submit."; return; }
    testIndex += 1; renderTest();
  });
  $("testSubmit").addEventListener("click", () => {
    const unanswered = testAnswers.filter((answer) => answer === null).length;
    if (unanswered && !window.confirm("There are " + unanswered + " unanswered questions. Submit anyway?")) return;
    submitTest();
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }

  updateSettingButtons();
  updateOperations();
  renderWatch();
  renderPractice();
  const initialView = location.hash.replace("#", "");
  showScreen(screens.includes(initialView) ? initialView : "watch", false);
  drawDiagram();
})();
