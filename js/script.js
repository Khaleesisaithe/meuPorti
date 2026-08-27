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
      float field = noise(p * 2.2 + vec2(time, -time * 0.6));
      float wave = sin(length(p + pointer * 0.2) * 15.0 - time * 4.0 + field * 3.0);
      float pulse = smoothstep(0.75, 0.08, abs(wave) * 0.34 + length(p) * 0.3);
      float glow = smoothstep(0.58, 0.05, length(p - vec2(0.2, -0.24))) * 0.45;
      vec3 green = vec3(0.77, 0.95, 0.24);
      vec3 coral = vec3(1.0, 0.28, 0.19);
      vec3 violet = vec3(0.32, 0.23, 0.70);
      vec3 color = mix(violet, green, clamp(field + pulse * 0.4, 0.0, 1.0));
      color = mix(color, coral, glow);
      float vignette = smoothstep(1.2, 0.15, length(p));
      gl_FragColor = vec4(color * vignette * 0.20, vignette * 0.62);
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
  const pointer = { x: 0.5, y: 0.5 };

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
  resize();

  const render = timestamp => {
    gl.uniform1f(timeLocation, timestamp * 0.001);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(pointerLocation, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!prefersReducedMotion) window.requestAnimationFrame(render);
  };
  window.requestAnimationFrame(render);
}
startShader();

/* ---------- animated signal window ---------- */
function startSignalCanvas() {
  const canvas = document.getElementById("signalCanvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  let frame = 0;
  const points = Array.from({ length: 28 }, (_, index) => ({
    x: index,
    value: 0.48 + Math.sin(index * 0.8) * 0.15 + Math.random() * 0.14,
  }));

  const draw = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = canvas.clientWidth || 560;
    const height = canvas.clientHeight || 260;
    if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(197, 242, 62, .10)";
    context.lineWidth = 1;
    for (let x = 16; x < width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 30; y < height; y += 38) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const baseline = height * 0.66;
    const step = (width - 34) / (points.length - 1);
    const drawLine = (offset, color, amplitude) => {
      context.beginPath();
      points.forEach((point, index) => {
        const x = 17 + index * step;
        const y = baseline - (point.value - 0.45) * amplitude - offset;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.stroke();
    };
    drawLine(0, "#c5f23e", 160);
    drawLine(20, "rgba(169, 140, 255, .68)", 110);
    drawLine(-17, "rgba(255, 118, 94, .65)", 80);

    const last = points[points.length - 1];
    const lastX = 17 + (points.length - 1) * step;
    const lastY = baseline - (last.value - 0.45) * 160;
    context.fillStyle = "#c5f23e";
    context.beginPath();
    context.arc(lastX, lastY, 3.5 + Math.sin(frame * 0.08) * 1.2, 0, Math.PI * 2);
    context.fill();
    context.font = "10px DM Mono, monospace";
    context.fillStyle = "rgba(245, 239, 227, .5)";
    context.fillText("signal / 76", 17, 22);
    context.fillStyle = "#c5f23e";
    context.fillText("BUY", width - 45, 22);

    if (!prefersReducedMotion) {
      points.shift();
      points.push({ x: frame, value: 0.48 + Math.sin(frame * 0.06) * 0.16 + Math.random() * 0.12 });
      frame += 1;
      window.requestAnimationFrame(draw);
    }
  };
  draw();
}
startSignalCanvas();

/* ---------- scroll progress ---------- */
const scrollProgress = document.getElementById("scrollProgress");
const updateProgress = () => {
  if (!scrollProgress) return;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ---------- theme toggle ---------- */
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const savedTheme = window.localStorage.getItem("khaleesi-theme");
if (savedTheme === "light" || savedTheme === "dark") body.dataset.theme = savedTheme;
const syncThemeLabel = () => {
  if (!themeToggle) return;
  const isDark = body.dataset.theme !== "light";
  themeToggle.textContent = isDark ? "◑" : "◐";
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
};
syncThemeLabel();
themeToggle?.addEventListener("click", () => {
  body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
  window.localStorage.setItem("khaleesi-theme", body.dataset.theme);
  syncThemeLabel();
});

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
  help: "comandos: sobre, metodo, experiencia, projetos, stack, conhecimentos, trajetoria, contato, whoami, theme, clear",
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
  if (event.key === "Escape") { closeCommandPalette(); closeMobileNav(); }
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
  if (raw === "theme") {
    themeToggle?.click();
    if (commandOutput) commandOutput.textContent = `> ${raw}\ntema alternado.`;
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
