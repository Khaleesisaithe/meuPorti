

// Entrada progressiva das seções: mantém o conteúdo visível mesmo sem interação manual.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.toggle('in', entry.isIntersecting);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in'));
}

// Filtros de projetos: cards principais e arquivo usam a mesma categoria.
const projectFilters = document.querySelectorAll('.project-filter .filter');
const projectCards = document.querySelectorAll('#projectCarousel .project-card');
const archivedProjects = document.querySelectorAll('.project-archive article[data-type]');
const projectArchive = document.querySelector('.project-archive');
const applyProjectFilter = filter => {
  projectCards.forEach(card => card.classList.toggle('hide', filter !== 'all' && card.dataset.type !== filter));
  archivedProjects.forEach(card => card.classList.toggle('filter-hidden', filter !== 'all' && card.dataset.type !== filter));
  if (projectArchive) projectArchive.classList.toggle('archive-empty', filter !== 'all' && ![...archivedProjects].some(card => !card.classList.contains('filter-hidden')));
  projectFilters.forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
};
projectFilters.forEach(button => button.addEventListener('click', () => applyProjectFilter(button.dataset.filter)));

// Pop-up de contato: email, GitHub e LinkedIn ficam acessíveis enquanto o WhatsApp aguarda o número.
const contactFloat = document.getElementById('contactFloat');
const contactPopover = document.getElementById('contactPopover');
contactFloat?.addEventListener('click', () => {
  const isOpen = contactPopover?.hasAttribute('hidden');
  if (!contactPopover) return;
  contactPopover.toggleAttribute('hidden');
  contactFloat.setAttribute('aria-expanded', String(isOpen));
});
document.addEventListener('click', event => {
  if (contactPopover && !contactPopover.hasAttribute('hidden') && !event.target.closest('.contact-float-wrap')) {
    contactPopover.setAttribute('hidden', '');
    contactFloat?.setAttribute('aria-expanded', 'false');
  }
});

// Currículo expandido: cada experiência abre o contexto completo do trabalho.
const experienceData = {
  oxxo: {
    ref: 'B6 / 01', period: 'AGO/2026 — ATUAL', title: 'Atendente de Loja', company: 'OXXO Brasil',
    responsibilities: ['Atendimento ao cliente e operação de caixa', 'Conferência de valores, fechamento e organização de rotina', 'Reposição, estoque, inventário e acompanhamento de validade', 'Food, checklists e cumprimento de processos de loja'],
    connection: 'Foi na operação que desenvolvi atenção a detalhes, comunicação, resolução de problemas e visão de processo — repertório que hoje levo para dados, automação e produto digital.'
  },
  mazinni: {
    ref: 'B6 / 02', period: 'JAN/2026 — JUN/2026', title: 'Operadora de Cartão de Crédito', company: 'Mazinni Administrações e Empreitadas LTDA',
    responsibilities: ['Prospecção e atendimento de clientes', 'Apresentação de serviços financeiros e análise de propostas', 'Registro de informações em sistema', 'Acompanhamento de metas e organização de contatos'],
    connection: 'A experiência reforçou meu interesse por organizar informações, entender perfis e transformar conversas em processos mais claros.'
  },
  atento: {
    ref: 'B6 / 03', period: 'MAI/2022 — SET/2023', title: 'Operadora de Telemarketing', company: 'Atento Brasil S/A · conta EDP',
    responsibilities: ['Tratamento de reclamações e solicitações', 'Registro e consulta de dados em sistema', 'Atendimento seguindo scripts, metas e indicadores', 'Apoio à melhoria do fluxo de atendimento'],
    connection: 'Aprendi a ouvir antes de responder, registrar com precisão e perceber padrões em grande volume de atendimentos — base importante para análise e melhoria contínua.'
  }
};
const experienceModal = document.getElementById('experienceModal');
const modalClose = document.getElementById('modalClose');
const openExperience = key => {
  const data = experienceData[key];
  if (!data || !experienceModal) return;
  document.getElementById('modalRef').textContent = data.ref;
  document.getElementById('modalPeriod').textContent = data.period;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalCompany').textContent = data.company;
  document.getElementById('modalConnection').textContent = data.connection;
  document.getElementById('modalList').innerHTML = data.responsibilities.map(item => `<li>${item}</li>`).join('');
  experienceModal.removeAttribute('hidden');
  document.body.classList.add('modal-open');
  modalClose?.focus();
};
const closeExperience = () => {
  if (!experienceModal) return;
  experienceModal.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');
};
document.querySelectorAll('.experience-trigger').forEach(item => {
  item.addEventListener('click', () => openExperience(item.dataset.experience));
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openExperience(item.dataset.experience); }
  });
});
modalClose?.addEventListener('click', closeExperience);
experienceModal?.addEventListener('click', event => { if (event.target.matches('[data-modal-close]')) closeExperience(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeExperience(); });
