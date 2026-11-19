// ====== СОСТОЯНИЕ ИГРЫ ======
const state = {
  coins: 0,
  perClick: 1,
  perSec: 0,
  upgrades: {}, // { id: count }
  theme: 'classic',
};

// ====== КАТАЛОГ ======
const UPGRADES = [
  // Улучшения клика
  { id: 'cursor',  type: 'click', name: '👆 Курсор',   desc: '+1 к клику',      base: 15,     power: 1,   growth: 1.15 },
  { id: 'gloves',  type: 'click', name: '🧤 Перчатки', desc: '+5 к клику',      base: 200,    power: 5,   growth: 1.15 },
  { id: 'hammer',  type: 'click', name: '🔨 Молоток',  desc: '+25 к клику',     base: 2500,   power: 25,  growth: 1.15 },
  { id: 'drill',   type: 'click', name: '🔧 Бур',      desc: '+150 к клику',    base: 25000,  power: 150, growth: 1.15 },
  // Автокликеры
  { id: 'miner',   type: 'auto',  name: '⛏ Шахтёр',   desc: '+1 монета/сек',   base: 50,     power: 1,   growth: 1.15 },
  { id: 'forge',   type: 'auto',  name: '🔥 Кузница',  desc: '+8 монет/сек',    base: 600,    power: 8,   growth: 1.15 },
  { id: 'factory', type: 'auto',  name: '🏭 Фабрика',  desc: '+50 монет/сек',   base: 7000,   power: 50,  growth: 1.15 },
  { id: 'bank',    type: 'auto',  name: '🏦 Банк',     desc: '+300 монет/сек',  base: 80000,  power: 300, growth: 1.15 },
];

const THEMES = [
  { id: 'classic', name: '🌙 Классика',   price: 0,      desc: 'Стандартная тема' },
  { id: 'gold',    name: '👑 Золото',     price: 5000,   desc: 'Роскошная золотая тема' },
  { id: 'space',   name: '🌌 Космос',     price: 25000,  desc: 'Звёздное небо' },
  { id: 'lava',    name: '🌋 Лава',       price: 100000, desc: 'Огненное пламя' },
  { id: 'cyber',   name: '🤖 Киберпанк',  price: 500000, desc: 'Неоновые огни' },
];

// ====== DOM ======
const $ = (id) => document.getElementById(id);
const coinBtn    = $('coin');
const coinsEl    = $('coins');
const perClickEl = $('per-click');
const perSecEl   = $('per-sec');
const upgradesEl = $('upgrades');
const themesEl   = $('themes');

// ====== УТИЛИТЫ ======
function formatNum(n) {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6)  return (n / 1e3).toFixed(2) + 'K';
  if (n < 1e9)  return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  return (n / 1e12).toFixed(2) + 'T';
}

function getPrice(upg) {
  const count = state.upgrades[upg.id] || 0;
  return Math.ceil(upg.base * Math.pow(upg.growth, count));
}

// ====== РЕНДЕР ======
function updateStats() {
  coinsEl.textContent    = formatNum(state.coins);
  perClickEl.textContent = formatNum(state.perClick);
  perSecEl.textContent   = formatNum(state.perSec);
  document.title = `💰 ${formatNum(state.coins)} монет`;
}

function renderUpgrades() {
  upgradesEl.innerHTML = '';
  UPGRADES.forEach(upg => {
    const count = state.upgrades[upg.id] || 0;
    const price = getPrice(upg);
    const canBuy = state.coins >= price;
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${upg.name} ×${count}</div>
        <div class="item-desc">${upg.desc}</div>
      </div>
      <button class="buy-btn" ${canBuy ? '' : 'disabled'}>
        Купить — ${formatNum(price)} 🪙
      </button>
    `;
    div.querySelector('.buy-btn').onclick = () => buyUpgrade(upg);
    upgradesEl.appendChild(div);
  });
}

function renderThemes() {
  themesEl.innerHTML = '';
  THEMES.forEach(theme => {
    const owned  = theme.price === 0 || state.upgrades['theme_' + theme.id];
    const active = state.theme === theme.id;
    const canBuy = state.coins >= theme.price;
    const div = document.createElement('div');
    div.className = 'item' + (owned ? ' owned' : '');
    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${theme.name} ${active ? '✓ активна' : ''}</div>
        <div class="item-desc">${theme.desc}</div>
      </div>
      <button class="buy-btn" ${(!owned && !canBuy) ? 'disabled' : ''}>
        ${active ? 'Текущая тема' : owned ? 'Надеть' : 'Купить — ' + formatNum(theme.price) + ' 🪙'}
      </button>
    `;
    div.querySelector('.buy-btn').onclick = () => {
      if (owned) applyTheme(theme.id);
      else buyTheme(theme);
    };
    themesEl.appendChild(div);
  });
}

// ====== ДЕЙСТВИЯ ======
function clickCoin(e) {
  state.coins += state.perClick;
  coinBtn.classList.remove('pulse');
  void coinBtn.offsetWidth; // перезапуск анимации
  coinBtn.classList.add('pulse');

  // Всплывающий текст
  const float = document.createElement('div');
  float.className = 'float-text';
  float.textContent = '+' + formatNum(state.perClick);
  float.style.left = e.clientX + 'px';
  float.style.top  = e.clientY + 'px';
  document.body.appendChild(float);
  setTimeout(() => float.remove(), 1000);

  updateStats();
  renderUpgrades();
  renderThemes();
}

function buyUpgrade(upg) {
  const price = getPrice(upg);
  if (state.coins < price) return;
  state.coins -= price;
  state.upgrades[upg.id] = (state.upgrades[upg.id] || 0) + 1;
  if (upg.type === 'click') state.perClick += upg.power;
  else if (upg.type === 'auto') state.perSec += upg.power;
  updateStats();
  renderUpgrades();
  renderThemes();
}

function buyTheme(theme) {
  if (state.coins < theme.price) return;
  state.coins -= theme.price;
  state.upgrades['theme_' + theme.id] = true;
  applyTheme(theme.id);
  updateStats();
  renderUpgrades();
  renderThemes();
}

function applyTheme(id) {
  state.theme = id;
  document.body.setAttribute('data-theme', id);
  renderThemes();
}

// ====== ВКЛАДКИ ======
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    upgradesEl.classList.toggle('hidden', target !== 'upgrades');
    themesEl.classList.toggle('hidden',   target !== 'themes');
  };
});

// ====== СОХРАНЕНИЕ ======
function save() {
  localStorage.setItem('clicker_save', JSON.stringify(state));
  coinBtn.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.1)' },
    { transform: 'scale(1)' }
  ], { duration: 300 });
}

function load() {
  const raw = localStorage.getItem('clicker_save');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    document.body.setAttribute('data-theme', state.theme);
  } catch (e) {
    console.error('Ошибка загрузки:', e);
  }
}

function reset() {
  if (!confirm('Точно сбросить весь прогресс?')) return;
  localStorage.removeItem('clicker_save');
  location.reload();
}

// ====== АВТОДОХОД ======
setInterval(() => {
  if (state.perSec > 0) {
    state.coins += state.perSec / 10; // 10 тиков в секунду для плавности
    updateStats();
    renderUpgrades();
