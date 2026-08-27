const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- boot screen ---------- */
const bootLines = [
  "abrindo portfólio_khaleesi.exe ...",
  "carregando sinais A1:F32 ...",
  "conferindo projetos ... OK ✓",
  "iniciando próxima versão.",
];
const bootLog = document.getElementById("bootLog");
const bootScreen = document.getElementById("bootScreen");

if (bootLog && bootScreen) {
  if (prefersReducedMotion) {
    bootScreen.classList.add("done");
  } else {
    let delay = 120;
    bootLines.forEach((line, index) => {
      const element = document.createElement("div");
      element.className = "line";
      element.textContent = line;
      if (index === bootLines.length - 1) {
        const cursor = document.createElement("span");
        cursor.className = "boot-cursor";
        element.appendChild(cursor);
      }
      bootLog.appendChild(element);
      window.setTimeout(() => element.classList.add("show"), delay);
      delay += 270;
    });
    window.setTimeout(() => bootScreen.classList.add("done"), delay + 420);
  }
}

/* ---------- lightweight WebGL shader ---------- */
function startShader() {
  const canvas = document.getElementById("shaderCanvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
  if (!gl) {
    canvas.style.display = "none";
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_scroll;
    varying vec2 v_uv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    void main() {
      vec2 uv = v_uv;
      vec2 p = uv - 0.5;
      p.x *= u_resolution.x / max(u_resolution.y, 1.0);
      vec2 pointer = u_pointer - 0.5;
      pointer.x *= u_resolution.x / max(u_resolution.y, 1.0);
      float time = u_time * 0.08;
      float scroll = u_scroll * 0.0008;
      p += vec2(sin(scroll * 0.7) * 0.04, cos(scroll) * 0.025);
      float field = noise(p * 2.2 + vec2(time + scroll, -time * 0.6 + scroll * 0.35));
      float wave = sin(length(p + pointer * 0.2) * 15.0 - time * 4.0 + field * 3.0);
      float pulse = smoothstep(0.75, 0.08, abs(wave) * 0.34 + length(p) * 0.3);
      float glow = smoothstep(0.58, 0.05, length(p - vec2(0.2, -0.24))) * 0.45;
      vec3 purple = vec3(0.43, 0.08, 0.78);
      vec3 magenta = vec3(1.0, 0.22, 0.62);
      vec3 lilac = vec3(0.74, 0.40, 1.0);
      vec3 color = mix(purple, lilac, clamp(field + pulse * 0.42, 0.0, 1.0));
      color = mix(color, magenta, glow);
      float vignette = smoothstep(1.2, 0.15, length(p));
      gl_FragColor = vec4(color * vignette * 0.52, vignette * 0.82);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) {
    canvas.style.display = "none";
    return;
  }

  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.style.display = "none";
    return;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const pointerLocation = gl.getUniformLocation(program, "u_pointer");
  const scrollLocation = gl.getUniformLocation(program, "u_scroll");
  const pointer = { x: 0.5, y: 0.5 };
  let scrollPosition = window.scrollY || 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", event => {
    pointer.x = event.clientX / Math.max(window.innerWidth, 1);
    pointer.y = 1 - event.clientY / Math.max(window.innerHeight, 1);
  }, { passive: true });
  window.addEventListener("scroll", () => { scrollPosition = window.scrollY || 0; }, { passive: true });
  resize();

  const render = timestamp => {
    gl.uniform1f(timeLocation, timestamp * 0.001);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(pointerLocation, pointer.x, pointer.y);
    gl.uniform1f(scrollLocation, scrollPosition);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!prefersReducedMotion) window.requestAnimationFrame(render);
  };
  window.requestAnimationFrame(render);
}
startShader();

/* ---------- infinite marquee ---------- */
const marqueeBand = document.querySelector(".marquee-band");
const marqueeTrack = document.querySelector(".marquee-track");
const marqueeSet = marqueeTrack?.querySelector(".marquee-set");
let marqueeOffset = 0;
let marqueeLoopWidth = 0;
let marqueePaused = prefersReducedMotion;
let marqueeLastTimestamp = 0;
const measureMarquee = () => {
  if (marqueeSet) marqueeLoopWidth = marqueeSet.getBoundingClientRect().width;
};
const animateMarquee = timestamp => {
  if (!marqueeLastTimestamp) marqueeLastTimestamp = timestamp;
  const delta = Math.min(timestamp - marqueeLastTimestamp, 48);
  marqueeLastTimestamp = timestamp;
  if (marqueeTrack && marqueeLoopWidth > 0 && !marqueePaused) {
    marqueeOffset -= delta * 0.052;
    if (Math.abs(marqueeOffset) >= marqueeLoopWidth) marqueeOffset += marqueeLoopWidth;
    marqueeTrack.style.transform = `translate3d(${marqueeOffset}px, 0, 0)`;
  }
  window.requestAnimationFrame(animateMarquee);
};
measureMarquee();
window.addEventListener("resize", measureMarquee, { passive: true });
marqueeBand?.addEventListener("mouseenter", () => { marqueePaused = true; });
marqueeBand?.addEventListener("mouseleave", () => { marqueePaused = prefersReducedMotion; });
window.requestAnimationFrame(animateMarquee);

/* ---------- scroll progress ---------- */
const scrollProgress = document.getElementById("scrollProgress");
const updateProgress = () => {
  if (!scrollProgress) return;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ---------- fixed dark mode ---------- */
const body = document.body;
body.dataset.theme = "dark";

/* ---------- mobile navigation ---------- */
const burgerButton = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");
const closeMobileNav = () => {
  mobileNav?.classList.remove("open");
  burgerButton?.setAttribute("aria-expanded", "false");
  if (burgerButton) burgerButton.textContent = "☰";
};
burgerButton?.addEventListener("click", () => {
  const open = mobileNav?.classList.toggle("open") ?? false;
  burgerButton.setAttribute("aria-expanded", String(open));
  burgerButton.textContent = open ? "×" : "☰";
});
mobileNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileNav));

/* ---------- reveal and counters ---------- */
const revealElements = document.querySelectorAll(".reveal");
const journeyItems = document.querySelectorAll(".j-item");
const stats = document.querySelectorAll(".about-stat-v");
const bars = document.querySelectorAll(".bar-fill");
const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 }) : null;
if (revealObserver) revealElements.forEach(element => revealObserver.observe(element));
else revealElements.forEach(element => element.classList.add("in"));

const journeyObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    journeyObserver.unobserve(entry.target);
  });
}, { threshold: 0.25 }) : null;
if (journeyObserver) journeyItems.forEach(element => journeyObserver.observe(element));
else journeyItems.forEach(element => element.classList.add("in"));

const statObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = window.setInterval(() => {
      current = Math.min(target, current + step);
      element.textContent = String(current);
      if (current >= target) window.clearInterval(timer);
    }, 28);
    statObserver.unobserve(element);
  });
}, { threshold: 0.5 }) : null;
if (statObserver) stats.forEach(element => statObserver.observe(element));
else stats.forEach(element => element.textContent = element.dataset.count || "0");

const barObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    element.style.width = `${element.dataset.w || 0}%`;
    barObserver.unobserve(element);
  });
}, { threshold: 0.35 }) : null;
if (barObserver) bars.forEach(element => barObserver.observe(element));
else bars.forEach(element => { element.style.width = `${element.dataset.w || 0}%`; });

/* ---------- project filters ---------- */
const filterRow = document.getElementById("filterRow");
const projectCards = document.querySelectorAll(".proj-card");
const filterEmpty = document.getElementById("filterEmpty");
filterRow?.addEventListener("click", event => {
  const button = event.target.closest(".filter-chip");
  if (!button) return;
  filterRow.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("active"));
  button.classList.add("active");
  const filter = button.dataset.filter;
  let visible = 0;
  projectCards.forEach(card => {
    const show = filter === "ALL" || card.dataset.tag === filter;
    card.classList.toggle("hide", !show);
    if (show) visible += 1;
  });
  if (filterEmpty) filterEmpty.style.display = visible ? "none" : "block";
});

/* ---------- gentle tilt for pointer devices ---------- */
if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 2.5).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

/* ---------- experience details modal ---------- */
const experienceData = {
  oxxo: {
    ref: "B6 / 01",
    period: "AGO/2026 — ATUAL",
    title: "Atendente de Loja",
    company: "OXXO Brasil",
    location: "São José dos Campos / SP",
    responsibilities: [
      "Operação de caixa, atendimento e conferência de valores.",
      "Controle de estoque, inventário, Food e organização de loja.",
      "Execução de checklists e acompanhamento dos processos de abertura e fechamento.",
    ],
    connection: "Essa vivência me dá contato direto com rotinas, divergências, conferências e decisões rápidas. É o contexto que orienta o Fecha Caixa e meu interesse por ferramentas que reduzem retrabalho.",
  },
  mazinni: {
    ref: "B6 / 02",
    period: "JAN/2026 — JUN/2026",
    title: "Operadora de Cartão de Crédito",
    company: "Mazinni Administrações e Empreitadas LTDA",
    location: "Serviços financeiros",
    responsibilities: [
      "Prospecção e atendimento de clientes em serviços financeiros.",
      "Análise de propostas, organização de informações e acompanhamento de solicitações.",
      "Comunicação de condições e orientação durante o processo de contratação.",
    ],
    connection: "A experiência fortaleceu minha leitura de propostas, atenção a detalhes e capacidade de explicar informações financeiras com clareza — habilidades essenciais para transformar dados em decisão.",
  },
  atento: {
    ref: "B6 / 03",
    period: "MAI/2022 — SET/2023",
    title: "Operadora de Telemarketing",
    company: "Atento Brasil S/A",
    location: "Conta EDP",
    responsibilities: [
      "Tratamento de reclamações e atendimento em diferentes contextos.",
      "Registro estruturado de informações e histórico em sistema.",
      "Acompanhamento de metas e apoio à melhoria de fluxo de atendimento.",
    ],
    connection: "Foi onde aprendi a ouvir antes de responder, registrar o problema de forma estruturada e trabalhar com volume e metas. Hoje aplico essa visão ao pensar em produtos e análises mais úteis.",
  },
};
const experienceModal = document.getElementById("experienceModal");
const experienceTriggers = document.querySelectorAll(".experience-trigger");
const modalClose = document.getElementById("modalClose");
const modalRef = document.getElementById("modalRef");
const modalPeriod = document.getElementById("modalPeriod");
const modalTitle = document.getElementById("modalTitle");
const modalCompany = document.getElementById("modalCompany");
const modalList = document.getElementById("modalList");
const modalConnection = document.getElementById("modalConnection");
let lastExperienceFocus = null;
const closeExperienceModal = () => {
  if (!experienceModal) return;
  experienceModal.hidden = true;
  document.body.classList.remove("modal-open");
  lastExperienceFocus?.focus();
};
const openExperienceModal = key => {
  const data = experienceData[key];
  if (!data || !experienceModal) return;
  lastExperienceFocus = document.activeElement;
  modalRef.textContent = data.ref;
  modalPeriod.textContent = data.period;
  modalTitle.textContent = data.title;
  modalCompany.innerHTML = `<b>${data.company}</b> · ${data.location}`;
  modalList.replaceChildren(...data.responsibilities.map(item => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
  modalConnection.textContent = data.connection;
  experienceModal.hidden = false;
  document.body.classList.add("modal-open");
  modalClose?.focus();
};
experienceTriggers.forEach(trigger => {
  trigger.addEventListener("click", () => openExperienceModal(trigger.dataset.experience));
  trigger.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openExperienceModal(trigger.dataset.experience);
    }
  });
});
modalClose?.addEventListener("click", closeExperienceModal);
experienceModal?.querySelector("[data-modal-close]")?.addEventListener("click", closeExperienceModal);

/* ---------- tools carousel: seamless infinite rail ---------- */
const toolsRail = document.getElementById("toolsRail");
const railControls = document.querySelectorAll("[data-rail-direction]");
const originalToolCards = toolsRail ? [...toolsRail.querySelectorAll(".tool-card")] : [];
let railLoopPoint = 0;
let railPaused = prefersReducedMotion;
let railAnimationFrame = null;
let railLastTimestamp = 0;

const measureRailLoop = () => {
  if (!toolsRail || originalToolCards.length === 0) return;
  const firstClone = toolsRail.querySelector(".tool-card[data-clone=\"true\"]");
  if (firstClone) railLoopPoint = Math.max(1, firstClone.offsetLeft - originalToolCards[0].offsetLeft);
};

if (toolsRail && originalToolCards.length) {
  const clones = originalToolCards.map(card => {
    const clone = card.cloneNode(true);
    clone.dataset.clone = "true";
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("tabindex", "-1");
    clone.querySelectorAll("a").forEach(link => link.setAttribute("tabindex", "-1"));
    return clone;
  });
  toolsRail.append(...clones);
  window.requestAnimationFrame(measureRailLoop);
}

const scrollTools = direction => {
  if (!toolsRail) return;
  const amount = Math.max(190, Math.round(toolsRail.clientWidth * 0.72));
  toolsRail.scrollBy({ left: direction * amount, behavior: prefersReducedMotion ? "auto" : "smooth" });
};
railControls.forEach(control => control.addEventListener("click", () => scrollTools(control.dataset.railDirection === "next" ? 1 : -1)));

const stopRail = () => { railPaused = true; };
const startRail = () => { if (!prefersReducedMotion) railPaused = false; };
const animateRail = timestamp => {
  if (!railLastTimestamp) railLastTimestamp = timestamp;
  const delta = Math.min(timestamp - railLastTimestamp, 48);
  railLastTimestamp = timestamp;
  if (toolsRail && !railPaused && railLoopPoint > 0) {
    toolsRail.scrollLeft += delta * 0.045;
    if (toolsRail.scrollLeft >= railLoopPoint) toolsRail.scrollLeft -= railLoopPoint;
    if (toolsRail.scrollLeft < 0) toolsRail.scrollLeft += railLoopPoint;
  }
  railAnimationFrame = window.requestAnimationFrame(animateRail);
};
railAnimationFrame = window.requestAnimationFrame(animateRail);
window.addEventListener("resize", measureRailLoop, { passive: true });
toolsRail?.addEventListener("mouseenter", stopRail);
toolsRail?.addEventListener("mouseleave", startRail);
toolsRail?.addEventListener("focusin", stopRail);
toolsRail?.addEventListener("focusout", event => { if (!toolsRail.contains(event.relatedTarget)) startRail(); });
toolsRail?.addEventListener("touchstart", stopRail, { passive: true });
toolsRail?.addEventListener("touchend", () => window.setTimeout(startRail, 1300), { passive: true });
toolsRail?.addEventListener("wheel", stopRail, { passive: true });
originalToolCards.forEach(card => card.addEventListener("dragstart", event => event.preventDefault()));

/* ---------- capabilities carousel: continuous presentation ---------- */
const capabilityTrack = document.getElementById("capabilityTrack");
const capabilityViewport = document.querySelector(".capability-viewport");
const capabilityControls = document.querySelectorAll("[data-capability-direction]");
const originalCapabilityCards = capabilityTrack ? [...capabilityTrack.querySelectorAll(".capability-card")] : [];
let capabilityLoopWidth = 0;
let capabilityOffset = 0;
let capabilityPaused = prefersReducedMotion;
let capabilityLastTimestamp = 0;

const measureCapabilityLoop = () => {
  if (!capabilityTrack || originalCapabilityCards.length === 0) return;
  const firstClone = capabilityTrack.querySelector(".capability-card[data-clone=\"true\"]");
  if (firstClone) capabilityLoopWidth = Math.max(1, firstClone.offsetLeft - originalCapabilityCards[0].offsetLeft);
};

if (capabilityTrack && originalCapabilityCards.length) {
  const clones = originalCapabilityCards.map(card => {
    const clone = card.cloneNode(true);
    clone.dataset.clone = "true";
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });
  capabilityTrack.append(...clones);
  window.requestAnimationFrame(measureCapabilityLoop);
}

const moveCapabilities = direction => {
  if (!capabilityLoopWidth || !capabilityTrack) return;
  const card = originalCapabilityCards[0];
  const step = card ? card.getBoundingClientRect().width + 12 : 300;
  capabilityOffset += direction * step;
  capabilityOffset = ((capabilityOffset % capabilityLoopWidth) + capabilityLoopWidth) % capabilityLoopWidth;
  capabilityTrack.style.transform = `translate3d(${-capabilityOffset}px, 0, 0)`;
};
capabilityControls.forEach(control => control.addEventListener("click", () => moveCapabilities(control.dataset.capabilityDirection === "next" ? 1 : -1)));
const pauseCapabilities = () => { capabilityPaused = true; };
const resumeCapabilities = () => { if (!prefersReducedMotion) capabilityPaused = false; };
capabilityViewport?.addEventListener("mouseenter", pauseCapabilities);
capabilityViewport?.addEventListener("mouseleave", resumeCapabilities);
capabilityViewport?.addEventListener("focusin", pauseCapabilities);
capabilityViewport?.addEventListener("focusout", event => { if (!capabilityViewport.contains(event.relatedTarget)) resumeCapabilities(); });
capabilityViewport?.addEventListener("touchstart", pauseCapabilities, { passive: true });
capabilityViewport?.addEventListener("touchend", () => window.setTimeout(resumeCapabilities, 1200), { passive: true });
window.addEventListener("resize", measureCapabilityLoop, { passive: true });
const animateCapabilities = timestamp => {
  if (!capabilityLastTimestamp) capabilityLastTimestamp = timestamp;
  const delta = Math.min(timestamp - capabilityLastTimestamp, 48);
  capabilityLastTimestamp = timestamp;
  if (capabilityTrack && !capabilityPaused && capabilityLoopWidth > 0) {
    capabilityOffset += delta * 0.022;
    if (capabilityOffset >= capabilityLoopWidth) capabilityOffset -= capabilityLoopWidth;
    capabilityTrack.style.transform = `translate3d(${-capabilityOffset}px, 0, 0)`;
  }
  window.requestAnimationFrame(animateCapabilities);
};
window.requestAnimationFrame(animateCapabilities);

/* ---------- formula bar and active navigation ---------- */
const sections = document.querySelectorAll("section[data-ref]");
const formulaRef = document.getElementById("fbRef");
const formula = document.getElementById("fbFormula");
const navLinks = document.querySelectorAll(".fb-nav a");
const sectionObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (formulaRef) formulaRef.textContent = entry.target.dataset.ref || "A1";
    if (formula) formula.textContent = entry.target.dataset.formula || "=PORTFOLIO()";
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { threshold: 0.45 }) : null;
if (sectionObserver) sections.forEach(section => sectionObserver.observe(section));

/* ---------- command palette ---------- */
const commandOverlay = document.getElementById("cmdk");
const commandTrigger = document.getElementById("cmdkTrigger");
const commandInput = document.getElementById("cmdkInput");
const commandOutput = document.getElementById("cmdkOutput");
const commands = {
  help: "comandos: sobre, metodo, experiencia, projetos, stack, conhecimentos, trajetoria, contato, whoami, clear",
  whoami: "khaleesi saithe — estudante de ciência de dados, automação e produto digital.",
  sobre: "ver seção #sobre",
  metodo: "ver seção #metodo",
  experiencia: "ver seção #experiencia",
  projetos: "ver seção #projetos",
  stack: "ver seção #stack",
  conhecimentos: "ver seção #conhecimentos",
  trajetoria: "ver seção #trajetoria",
  contato: "ver seção #contato",
};
const openCommandPalette = () => {
  commandOverlay?.classList.add("open");
  if (commandInput) { commandInput.value = ""; commandInput.focus(); }
};
const closeCommandPalette = () => commandOverlay?.classList.remove("open");
commandTrigger?.addEventListener("click", openCommandPalette);
commandOverlay?.addEventListener("click", event => { if (event.target === commandOverlay) closeCommandPalette(); });
document.addEventListener("keydown", event => {
  const activeTag = document.activeElement?.tagName;
  if (event.key === "/" && activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
    event.preventDefault();
    openCommandPalette();
  }
  if (event.key === "Escape") { closeCommandPalette(); closeMobileNav(); closeExperienceModal(); }
});
commandInput?.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  const raw = commandInput.value.trim().toLowerCase();
  if (!raw) return;
  if (raw === "clear") {
    if (commandOutput) commandOutput.textContent = "";
    commandInput.value = "";
    return;
  }
  if (Object.prototype.hasOwnProperty.call(commands, raw) && document.getElementById(raw)) {
    if (commandOutput) commandOutput.textContent = `> ${raw}\n${commands[raw]}`;
    document.getElementById(raw).scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    window.setTimeout(closeCommandPalette, 350);
    commandInput.value = "";
    return;
  }
  if (commandOutput) commandOutput.textContent = `> ${raw}\n${commands[raw] || `comando não encontrado: "${raw}". digite "help".`}`;
  commandInput.value = "";
});


/* ---------- scroll-driven video opening ---------- */
const scrollIntro = document.getElementById("hero");
const scrollIntroVideo = document.getElementById("scrollIntroVideo");
const scrollVideoStatus = document.getElementById("scrollVideoStatus");
const scrollIntroSteps = scrollIntro ? [...scrollIntro.querySelectorAll("[data-scroll-step]")] : [];
let scrollVideoDuration = 10;
let scrollVideoReady = false;
let scrollUpdatePending = false;
const clamp01 = value => Math.min(1, Math.max(0, value));

const updateScrollVideo = () => {
  if (!scrollIntro) return;
  const range = Math.max(1, scrollIntro.offsetHeight - window.innerHeight);
  const progress = clamp01(-scrollIntro.getBoundingClientRect().top / range);
  scrollIntro.style.setProperty("--scroll-progress", progress.toFixed(4));

  if (scrollIntroVideo && scrollVideoReady && !prefersReducedMotion) {
    const targetTime = progress * scrollVideoDuration;
    if (Math.abs(scrollIntroVideo.currentTime - targetTime) > 0.018) scrollIntroVideo.currentTime = targetTime;
    scrollIntroVideo.style.transform = `scale(${1.035 + progress * 0.065}) translate3d(0, ${progress * -1.8}%, 0)`;
    scrollIntroVideo.style.opacity = String(0.92 + progress * 0.08);
  }

  scrollIntroSteps.forEach(step => {
    const threshold = Number(step.dataset.scrollStep || 0);
    const reveal = clamp01((progress - threshold) / 0.16);
    step.style.opacity = String(reveal);
    step.style.transform = `translate3d(0, ${(1 - reveal) * 24}px, 0)`;
  });

  if (scrollVideoStatus) {
    scrollVideoStatus.textContent = progress < 0.2 ? "VIDEO READY" : progress < 0.48 ? "CONNECTING" : progress < 0.78 ? "DATA STREAM" : "SIGNAL LOCKED";
  }
};

const requestScrollVideoUpdate = () => {
  if (scrollUpdatePending) return;
  scrollUpdatePending = true;
  window.requestAnimationFrame(() => {
    scrollUpdatePending = false;
    updateScrollVideo();
  });
};

if (scrollIntroVideo && scrollIntro) {
  const markVideoReady = () => {
    scrollVideoReady = Number.isFinite(scrollIntroVideo.duration) && scrollIntroVideo.duration > 0;
    if (scrollVideoReady) {
      scrollVideoDuration = scrollIntroVideo.duration;
      scrollIntroVideo.pause();
      scrollIntro.classList.add("is-video-ready");
      requestScrollVideoUpdate();
    }
  };
  scrollIntroVideo.addEventListener("loadedmetadata", markVideoReady, { once: true });
  scrollIntroVideo.addEventListener("loadeddata", markVideoReady, { once: true });
  scrollIntroVideo.addEventListener("error", () => {
    scrollIntro.classList.add("is-video-fallback");
    if (scrollVideoStatus) scrollVideoStatus.textContent = "POSTER MODE";
  });
  if (prefersReducedMotion) scrollIntroVideo.pause();
  window.addEventListener("visibilitychange", () => { if (document.hidden) scrollIntroVideo.pause(); });
  window.addEventListener("scroll", requestScrollVideoUpdate, { passive: true });
  window.addEventListener("resize", requestScrollVideoUpdate, { passive: true });
  window.addEventListener("load", requestScrollVideoUpdate, { once: true });
  requestScrollVideoUpdate();
}

/* ---------- GSAP enhancement layer ---------- */
(function initGSAPEnhancements() {
  const gsapApi = window.gsap;
  const ScrollTriggerApi = window.ScrollTrigger;
  if (!gsapApi) return;
  if (ScrollTriggerApi) gsapApi.registerPlugin(ScrollTriggerApi);

  const media = gsapApi.matchMedia();
  const isScrollDrivenHero = Boolean(document.querySelector(".scroll-intro"));
  media.add({
    reduceMotion: "(prefers-reduced-motion: reduce)",
    desktop: "(min-width: 900px)",
    mobile: "(max-width: 899px)"
  }, context => {
    const { reduceMotion, desktop } = context.conditions;
    const heroParts = [
      document.querySelector(".hero-masthead"),
      document.querySelector(".hero-rail"),
      document.querySelector(".hero-copy"),
      document.querySelector(".hero-side"),
      document.querySelector(".hero-bottomline")
    ].filter(Boolean);

    if (reduceMotion) {
      gsapApi.set([...heroParts, ...document.querySelectorAll(".reveal, .j-item")], { autoAlpha: 1, x: 0, y: 0, clearProps: "transform,visibility" });
      return;
    }

    if (!isScrollDrivenHero) {
      const intro = gsapApi.timeline({ defaults: { duration: 0.72, ease: "power3.out" } });
      intro
        .fromTo(".hero-masthead", { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0 })
        .fromTo(".hero-rail", { autoAlpha: 0, x: -26 }, { autoAlpha: 1, x: 0 }, "-=0.42")
        .fromTo(".hero-copy", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0 }, "<0.08")
        .fromTo(".hero-overline", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.48 }, "<0.16")
        .fromTo(".hero-title-line", { autoAlpha: 0, yPercent: 115 }, { autoAlpha: 1, yPercent: 0, duration: 0.78, stagger: 0.1, ease: "power3.out" }, "<0.06")
        .fromTo(".hero-lede", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55 }, "<0.18")
        .fromTo(".hero-cta", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.14")
        .fromTo(".hero-proof-row", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.12")
        .fromTo(".hero-side", { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0 }, "<0.08")
        .fromTo(".hero-bottomline", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0 }, "-=0.32");
    }

    gsapApi.to(".id-badge", { y: -7, rotation: 1.2, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsapApi.to(".tool-svg", { y: -3, rotation: 3, duration: 1.55, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: { each: 0.07, from: "random" } });

    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".hero-cta .btn").forEach(button => {
        const xTo = gsapApi.quickTo(button, "x", { duration: 0.32, ease: "power3.out" });
        const yTo = gsapApi.quickTo(button, "y", { duration: 0.32, ease: "power3.out" });
        button.addEventListener("pointermove", event => {
          const rect = button.getBoundingClientRect();
          xTo((event.clientX - rect.left - rect.width / 2) * 0.08);
          yTo((event.clientY - rect.top - rect.height / 2) * 0.08 - 2);
        });
        button.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
      });
    }

    if (ScrollTriggerApi) {
      const revealTargets = [...document.querySelectorAll(".reveal")];
      gsapApi.set(revealTargets, { autoAlpha: 0, y: 24 });
      ScrollTriggerApi.batch(revealTargets, {
        start: "top 86%",
        once: true,
        interval: 0.08,
        batchMax: 4,
        onEnter: batch => gsapApi.to(batch, { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.08, ease: "power3.out", overwrite: "auto" })
      });

      const journeyTargets = [...document.querySelectorAll(".j-item")];
      gsapApi.set(journeyTargets, { autoAlpha: 0, y: 18 });
      ScrollTriggerApi.batch(journeyTargets, {
        start: "top 88%",
        once: true,
        interval: 0.06,
        onEnter: batch => gsapApi.to(batch, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.07, ease: "power2.out", overwrite: "auto" })
      });

      if (desktop && !isScrollDrivenHero) {
        gsapApi.to(".hero-rail", { y: -18, scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsapApi.to(".hero-side", { y: 18, scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsapApi.to(".hero-copy h1", { y: -10, scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 } });
      }
      ScrollTriggerApi.refresh();
    }
  });
})();
