/* ---------- boot screen ---------- */
const bootLines = [
  "abrindo planilha_khaleesi.xlsx ...",
  "carregando linhas A1:F32 ...",
  "conferindo dados ... OK ✓",
  "iniciando portfólio.",
];
const bootLog = document.getElementById("bootLog");
const bootScreen = document.getElementById("bootScreen");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  bootScreen.classList.add("done");
} else {
  let delay = 150;
  bootLines.forEach((line, i) => {
    const div = document.createElement("div");
    div.className = "line";
    div.textContent = line;
    if (i === bootLines.length - 1) {
      const cursor = document.createElement("span");
      cursor.className = "boot-cursor";
      div.appendChild(cursor);
    }
    bootLog.appendChild(div);
    setTimeout(() => div.classList.add("show"), delay);
    delay += 380;
  });
  setTimeout(() => bootScreen.classList.add("done"), delay + 500);
}

/* ---------- scroll progress ---------- */
const scrollProgress = document.getElementById("scrollProgress");
function updateProgress() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  scrollProgress.style.width = scrolled + "%";
}
document.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ---------- theme toggle ---------- */
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
themeToggle.addEventListener("click", () => {
  const next = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", next);
  themeToggle.textContent = next === "dark" ? "◑" : "◐";
});

/* ---------- mobile nav ---------- */
const burgerBtn = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");
burgerBtn.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  burgerBtn.setAttribute("aria-expanded", open);
  burgerBtn.textContent = open ? "✕" : "☰";
});
mobileNav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    burgerBtn.textContent = "☰";
  }),
);

/* ---------- reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
revealEls.forEach((el) => io.observe(el));

/* ---------- journey items stagger ---------- */
const jItems = document.querySelectorAll(".j-item");
const jio = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        jio.unobserve(e.target);
      }
    });
  },
  { threshold: 0.35 },
);
jItems.forEach((el) => jio.observe(el));

/* ---------- animated stat counters ---------- */
const statEls = document.querySelectorAll(".about-stat-v");
const statIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        let cur = 0;
        const step = Math.max(1, Math.round(target / 40));
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) {
            cur = target;
            clearInterval(t);
          }
          el.textContent = cur;
        }, 25);
        statIo.unobserve(el);
      }
    });
  },
  { threshold: 0.5 },
);
statEls.forEach((el) => statIo.observe(el));

/* ---------- animated stack bars ---------- */
const barEls = document.querySelectorAll(".bar-fill");
const barIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + "%";
        barIo.unobserve(e.target);
      }
    });
  },
  { threshold: 0.4 },
);
barEls.forEach((el) => barIo.observe(el));

/* ---------- project filters ---------- */
const filterRow = document.getElementById("filterRow");
const projCards = document.querySelectorAll(".proj-card");
const filterEmpty = document.getElementById("filterEmpty");
filterRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if (!btn) return;
  filterRow
    .querySelectorAll(".filter-chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  const f = btn.dataset.filter;
  let visible = 0;
  projCards.forEach((card) => {
    const show = f === "ALL" || card.dataset.tag === f;
    card.classList.toggle("hide", !show);
    if (show) visible++;
  });
  filterEmpty.style.display = visible === 0 ? "block" : "none";
});

/* ---------- tilt effect on project cards ---------- */
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-2px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* ---------- formula bar updates + active nav link ---------- */
const sections = document.querySelectorAll("section[data-ref]");
const fbRef = document.getElementById("fbRef");
const fbFormula = document.getElementById("fbFormula");
const navLinks = document.querySelectorAll(".fb-nav a");
const fbObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fbRef.textContent = entry.target.dataset.ref;
        fbFormula.textContent = entry.target.dataset.formula;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      }
    });
  },
  { threshold: 0.5 },
);
sections.forEach((s) => fbObserver.observe(s));

/* ---------- command palette ---------- */
const cmdk = document.getElementById("cmdk");
const cmdkTrigger = document.getElementById("cmdkTrigger");
const cmdkInput = document.getElementById("cmdkInput");
const cmdkOutput = document.getElementById("cmdkOutput");

function openCmdk() {
  cmdk.classList.add("open");
  cmdkInput.value = "";
  cmdkInput.focus();
}
function closeCmdk() {
  cmdk.classList.remove("open");
}
cmdkTrigger.addEventListener("click", openCmdk);
cmdk.addEventListener("click", (e) => {
  if (e.target === cmdk) closeCmdk();
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement.tagName !== "INPUT" &&
    document.activeElement.tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
    openCmdk();
  }
  if (e.key === "Escape") closeCmdk();
});

const commands = {
  help: "comandos: sobre, experiencia, projetos, stack, conhecimentos, trajetoria, contato, whoami, theme, clear",
  whoami:
    "khaleesi saithe — operadora de cartão de crédito em transição para ciência de dados.",
  sobre: "ver seção #sobre",
  experiencia: "ver seção #experiencia",
  projetos: "ver seção #projetos",
  stack: "ver seção #stack",
  conhecimentos: "ver seção #conhecimentos",
  trajetoria: "ver seção #trajetoria",
  contato: "ver seção #contato",
};
cmdkInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const raw = cmdkInput.value.trim().toLowerCase();
  if (!raw) return;
  if (raw === "clear") {
    cmdkOutput.textContent = "";
    cmdkInput.value = "";
    return;
  }
  if (raw === "theme") {
    themeToggle.click();
    cmdkOutput.textContent = "> " + raw + "\ntema alternado.";
    cmdkInput.value = "";
    return;
  }
  if (
    [
      "sobre",
      "projetos",
      "stack",
      "conhecimentos",
      "trajetoria",
      "contato",
    ].includes(raw)
  ) {
    cmdkOutput.textContent = "> " + raw + "\n" + commands[raw];
    document.getElementById(raw).scrollIntoView({ behavior: "smooth" });
    setTimeout(closeCmdk, 400);
    cmdkInput.value = "";
    return;
  }
  const out =
    commands[raw] || `comando não encontrado: "${raw}". digite "help".`;
  cmdkOutput.textContent = "> " + raw + "\n" + out;
  cmdkInput.value = "";
});

/* ---------- typewriter for hero name (once) ---------- */
const typeEl = document.getElementById("typeName");
const fullName = typeEl.textContent;
typeEl.textContent = "";
let ci = 0;
function typeStep() {
  if (ci <= fullName.length) {
    typeEl.textContent = fullName.slice(0, ci);
    ci++;
    setTimeout(typeStep, 55);
  } else {
    typeEl.style.borderRight = "none";
  }
}
setTimeout(typeStep, 1900);
