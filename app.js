const spriteEl  = document.getElementById('sprite');
const spinnerEl = document.getElementById('spinner');
const nameEl    = document.getElementById('name');
const nameJaEl  = document.getElementById('name-ja');
const typesEl   = document.getElementById('types');
const statsEl   = document.getElementById('stats');
const counterEl = document.getElementById('counter');
const heightEl  = document.getElementById('height');
const weightEl  = document.getElementById('weight');
const abilityEl = document.getElementById('ability');
const cardBgEl  = document.getElementById('card-bg');
const rollBtn   = document.getElementById('roll-btn');

const TOTAL = 1025;

const STAT_LABELS = {
  hp: 'HP', attack: '攻撃', defense: '防御',
  'special-attack': '特攻', 'special-defense': '特防', speed: 'すばやさ'
};

const TYPE_COLORS = {
  normal:'#9da0aa', fire:'#f77c3e', water:'#5b9cf6', electric:'#f9d44b',
  grass:'#56c97e', ice:'#7ed9f0', fighting:'#e85656', poison:'#b366e0',
  ground:'#d4a843', flying:'#89aae8', psychic:'#f7609e', bug:'#98c234',
  rock:'#c4b57a', ghost:'#7273b5', dragon:'#6b5ff6', dark:'#705848',
  steel:'#b8c0c8', fairy:'#f4aec8'
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function loadPokemon() {
  rollBtn.disabled = true;
  spinnerEl.classList.add('active');
  spriteEl.classList.add('loading');

  const id = Math.floor(Math.random() * TOTAL) + 1;

  const [poke, species] = await Promise.all([
    fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  ]);

  // Name
  const jaName = species.names.find(n => n.language.name === 'ja-Hrkt')?.name
               || species.names.find(n => n.language.name === 'ja')?.name
               || '';

  // Sprite (official artwork → fallback to default)
  const artwork = poke.sprites.other?.['official-artwork']?.front_default
                || poke.sprites.front_default;

  // Types
  const types = poke.types.map(t => t.type.name);

  // Primary type colour for card bg
  const primaryColor = TYPE_COLORS[types[0]] || '#5b9cf6';

  // Stats
  const stats = poke.stats.map(s => ({
    name: s.stat.name,
    val: s.base_stat
  }));

  // Ability (non-hidden, first)
  const ability = poke.abilities.find(a => !a.is_hidden)?.ability.name
                || poke.abilities[0]?.ability.name || '—';

  // --- Render ---
  counterEl.textContent = `#${String(id).padStart(3, '0')}`;
  nameEl.textContent    = poke.name;
  nameJaEl.textContent  = jaName;
  heightEl.textContent  = `${(poke.height / 10).toFixed(1)} m`;
  weightEl.textContent  = `${(poke.weight / 10).toFixed(1)} kg`;
  abilityEl.textContent = ability.replace(/-/g, ' ');
  cardBgEl.style.background = `radial-gradient(circle at 60% 30%, ${primaryColor}, transparent 70%)`;

  // Types
  typesEl.innerHTML = types.map(t =>
    `<span class="type-badge type-${t}">${t}</span>`
  ).join('');

  // Stats
  statsEl.innerHTML = stats.map(s => {
    const pct = Math.min(100, Math.round(s.val / 255 * 100));
    const color = TYPE_COLORS[types[0]] || '#5b9cf6';
    return `
      <div class="stat-row">
        <span class="stat-label">${STAT_LABELS[s.name] || s.name}</span>
        <span class="stat-val">${s.val}</span>
        <div class="stat-bar-bg">
          <div class="stat-bar" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
  }).join('');

  // Sprite with load transition
  const img = new Image();
  img.onload = () => {
    spriteEl.src = artwork;
    spriteEl.classList.remove('loading');
    spinnerEl.classList.remove('active');
    rollBtn.disabled = false;
  };
  img.onerror = () => {
    spriteEl.classList.remove('loading');
    spinnerEl.classList.remove('active');
    rollBtn.disabled = false;
  };
  img.src = artwork;
}

rollBtn.addEventListener('click', loadPokemon);
loadPokemon();
