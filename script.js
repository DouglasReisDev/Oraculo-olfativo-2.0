// ═══════════════════════════════════════════════
//  DADOS DOS PERFUMES
//  Para adicionar mais, copie o padrão abaixo:
//  {
//    id: 3,
//    name: "Nome do Perfume",
//    brand: "Marca",
//    notes: "Notas olfativas aqui",
//    icon: "🧴",       ← emoji representativo
//    tags: ["verao", "dia"]   ← use: primavera | verao | outono | inverno | dia | noite
//  },
// ═══════════════════════════════════════════════
const perfumes = [
  {
    id: 1,
    name: "Satin Body Oud",
    brand: "ABDUL SAMAD AL QURASH",
    notes: "Baunilha,Floral branco, Ambar, lavanda, cítrico, Doce, Aromático ,especiado,rosa,alalcado",
    icon: "🌼🌷🍂",
    tags: ["outono", "inverno", "noite", "primavera"]
  },
  {
    id: 2,
    name: "Daisy",
    brand: "Marc Jacobs",
    notes: "Morango silvestre, violeta, jasmim, sândalo",
    icon: "🌼",
    tags: ["primavera", "verao", "dia"]
  },
  
  // ── ADICIONE SEUS PERFUMES AQUI ──────────────
  // Exemplo comentado:
  // {
  //   id: 3,
  //   name: "La Vie Est Belle",
  //   brand: "Lancôme",
  //   notes: "Íris, pralinê, baunilha, patchouli",
  //   icon: "💜",
  //   tags: ["outono", "inverno", "dia", "noite"]
  // },
];

// ─── estado ───────────────────────────────────
const activeFilters = new Set();
let visibleIds = [];

// ─── build cards ──────────────────────────────
const grid = document.getElementById('grid');
const emptyState = document.getElementById('emptyState');

function buildCards() {
  perfumes.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = p.id;
    card.dataset.tags = p.tags.join(',');

    card.innerHTML = `
      <span class="card-number">${String(i + 1).padStart(2, '0')}</span>
      <span class="card-icon">${p.icon}</span>
      <h2 class="card-name">${p.name}</h2>
      <p class="card-brand">${p.brand}</p>
      <p class="card-notes">${p.notes}</p>
      <div class="card-tags">
        ${p.tags.map(t => `<span class="tag tag-${t}">${tagLabel(t)}</span>`).join('')}
      </div>
    `;

    grid.insertBefore(card, emptyState);
  });
}

function tagLabel(t) {
  const map = { primavera: 'Primavera', verao: 'Verão', outono: 'Outono',
                inverno: 'Inverno', dia: 'Dia', noite: 'Noite' };
  return map[t] || t;
}

// ─── filter logic ─────────────────────────────
function applyFilters() {
  const cards = grid.querySelectorAll('.card[data-id]');
  visibleIds = [];

  cards.forEach(card => {
    const tags = card.dataset.tags.split(',');
    const show = activeFilters.size === 0 ||
                 [...activeFilters].every(f => tags.includes(f));
    card.classList.toggle('hidden', !show);
    card.classList.remove('winner');
    const badge = card.querySelector('.winner-badge');
    if (badge) badge.remove();
    if (show) visibleIds.push(parseInt(card.dataset.id));
  });

  const count = visibleIds.length;
  document.getElementById('visibleCount').textContent = count;
  emptyState.classList.toggle('visible', count === 0);

  const btn = document.getElementById('btnSortear');
  btn.disabled = count === 0;
  document.getElementById('sortearHint').textContent =
    count === 0 ? 'Nenhum perfume visível'
    : count === 1 ? 'Apenas 1 perfume visível'
    : `Sorteie entre ${count} perfumes visíveis`;
}

// ─── filter buttons ───────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    if (activeFilters.has(cat)) {
      activeFilters.delete(cat);
      btn.classList.remove('active');
    } else {
      activeFilters.add(cat);
      btn.classList.add('active');
    }
    applyFilters();
  });
});

// ─── sortear ──────────────────────────────────
let spinInterval = null;
let currentWinnerId = null;

function sortear() {
  if (visibleIds.length === 0) return;

  // Remove winner visual anterior
  document.querySelectorAll('.card.winner').forEach(c => {
    c.classList.remove('winner');
    const b = c.querySelector('.winner-badge');
    if (b) b.remove();
  });

  const visibleCards = [...document.querySelectorAll('.card[data-id]:not(.hidden)')];
  if (visibleCards.length === 0) return;

  // Animação de roleta
  let flips = 0;
  const total = 16 + Math.floor(Math.random() * 10);

  spinInterval = setInterval(() => {
    visibleCards.forEach(c => c.classList.remove('spinning'));
    const random = visibleCards[Math.floor(Math.random() * visibleCards.length)];
    random.classList.add('spinning');
    flips++;

    if (flips >= total) {
      clearInterval(spinInterval);
      visibleCards.forEach(c => c.classList.remove('spinning'));

      const winnerId = visibleIds[Math.floor(Math.random() * visibleIds.length)];
      currentWinnerId = winnerId;
      const winnerCard = grid.querySelector(`.card[data-id="${winnerId}"]`);

      winnerCard.classList.add('winner');
      const badge = document.createElement('div');
      badge.className = 'winner-badge';
      badge.textContent = '✦ Sorteado';
      winnerCard.insertBefore(badge, winnerCard.firstChild);

      winnerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => openModal(winnerId), 600);
    }
  }, 80);
}

document.getElementById('btnSortear').addEventListener('click', sortear);

// ─── modal ────────────────────────────────────
function openModal(id) {
  const p = perfumes.find(p => p.id === id);
  if (!p) return;

  document.getElementById('modalIcon').textContent = p.icon;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalBrand').textContent = p.brand;
  document.getElementById('modalNotes').textContent = p.notes;
  document.getElementById('modalTags').innerHTML =
    p.tags.map(t => `<span class="tag tag-${t}">${tagLabel(t)}</span>`).join('');

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('btnFechar').addEventListener('click', closeModal);
document.getElementById('btnSortearNovamente').addEventListener('click', () => {
  closeModal();
  setTimeout(sortear, 300);
});
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ─── init ─────────────────────────────────────
buildCards();
applyFilters();