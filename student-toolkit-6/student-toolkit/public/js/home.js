// Home page: filter tool cards by search text
const searchEl = document.getElementById('search');
const cards = document.querySelectorAll('.card[data-search]');
const sections = document.querySelectorAll('.cat');
const noneEl = document.getElementById('none');

function filter() {
  const q = searchEl.value.trim().toLowerCase();
  let shown = 0;
  cards.forEach((card) => {
    const match = !q || card.dataset.search.includes(q);
    card.hidden = !match;
    if (match) shown += 1;
  });
  sections.forEach((sec) => {
    sec.hidden = !sec.querySelector('.card:not([hidden])');
  });
  noneEl.hidden = shown > 0;
}
searchEl.addEventListener('input', filter);
