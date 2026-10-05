

// Entrada progressiva das seções: mantém o conteúdo visível mesmo sem interação manual.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
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
