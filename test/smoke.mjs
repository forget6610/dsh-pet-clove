// Zero-dependency smoke test for the pet browser half.
// Run with: node test/smoke.mjs
import assert from 'node:assert/strict';

class ClassList {
  constructor() {
    this.set = new Set();
  }
  add(...names) {
    names.forEach((n) => this.set.add(n));
  }
  remove(...names) {
    names.forEach((n) => this.set.delete(n));
  }
  contains(name) {
    return this.set.has(name);
  }
}

class Style {
  constructor() {
    this.props = {};
  }
  setProperty(key, value) {
    this.props[key] = String(value);
  }
  getPropertyValue(key) {
    return this.props[key] ?? '';
  }
}

class El {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.parentNode = null;
    this.classList = new ClassList();
    this.attrs = {};
    this.listeners = new Map();
    this.textContent = '';
    this.style = new Style();
    this._className = '';
  }
  set className(value) {
    this._className = String(value);
    this.classList = new ClassList();
    this._className.split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c));
  }
  get className() {
    return this._className;
  }
  setAttribute(key, value) {
    this.attrs[key] = String(value);
  }
  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }
  removeChild(node) {
    this.children = this.children.filter((c) => c !== node);
    node.parentNode = null;
    return node;
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter((f) => f !== fn));
  }
  dispatch(type, event = {}) {
    (this.listeners.get(type) || []).slice().forEach((fn) => fn(event));
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  get offsetWidth() {
    return 120;
  }
}

const walk = (node, fn) => {
  fn(node);
  node.children.forEach((child) => walk(child, fn));
};

const allNodes = (root) => {
  const out = [];
  walk(root, (n) => out.push(n));
  return out;
};

const rowNamed = (root, name) => {
  const rows = [];
  walk(root, (n) => {
    if (n.classList.contains('pet-row')) rows.push(n);
  });
  return rows.find((row) => allNodes(row).some((n) => n.classList.contains('pet-row-name') && n.textContent === name));
};

const buttonIn = (root, label) => allNodes(root).find((n) => n.classList.contains('pet-btn-small') && n.textContent === label);

let nextTimer = 1;
const timeouts = new Map();
let rafSeq = 1;
const rafs = new Map();
const windowListeners = new Map();
const store = new Map();

globalThis.window = {
  innerWidth: 1280,
  innerHeight: 800,
  performance: { now: () => 1000 },
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  },
  __ModuleLoader__: {
    load(spec) {
      globalThis.__spec = spec;
    },
  },
  setTimeout(fn) {
    const id = nextTimer++;
    timeouts.set(id, fn);
    return id;
  },
  clearTimeout(id) {
    timeouts.delete(id);
  },
  requestAnimationFrame(fn) {
    const id = rafSeq++;
    rafs.set(id, fn);
    return id;
  },
  cancelAnimationFrame(id) {
    rafs.delete(id);
  },
  matchMedia() {
    return { matches: false };
  },
  addEventListener(type, fn) {
    if (!windowListeners.has(type)) windowListeners.set(type, []);
    windowListeners.get(type).push(fn);
  },
  removeEventListener(type, fn) {
    windowListeners.set(type, (windowListeners.get(type) || []).filter((f) => f !== fn));
  },
};

class Doc {
  constructor() {
    this.head = new El('head');
    this.body = new El('body');
    this.documentElement = new El('html');
    this.hidden = false;
  }
  createElement(tag) {
    return new El(tag);
  }
  querySelector(selector) {
    if (!selector.startsWith('.')) return null;
    const cls = selector.slice(1);
    let found = null;
    walk(this.body, (node) => {
      if (!found && node.classList.contains(cls)) found = node;
    });
    return found;
  }
}

const document = new Doc();
globalThis.document = document;

// pre-seed a save file: affinity 7, middle of the viewport
store.set('dsh-clove-pet:affinity:v1', '7');
store.set('dsh-clove-pet:pos:v2', '0.5,0.5');
// pre-seed 20 minutes of neglect so the first tick has to decay stats
store.set('dsh-clove-pet:care:v1', JSON.stringify({
  coins: 1000,
  xp: 0,
  hunger: 40,
  thirst: 40,
  happiness: 50,
  lastTick: Date.now() - 20 * 60 * 1000,
  lastLogin: '',
  todayEarn: 0,
  todayKey: '',
  lastTaskPay: Date.now(),
  inventory: {},
  toys: [],
  toyCooldown: {},
  feedCount: 0,
  playCount: 0,
  buyCount: 0,
}));

await import('../client.js');

const spec = globalThis.__spec;
assert.ok(spec, 'ModuleLoader.load was not called');
assert.equal(spec.id, 'dsh-pet-clove');

const plugin = spec.factory(() => ({}));
assert.deepEqual(plugin.inject, []);
assert.equal(typeof plugin.apply, 'function');

// the generated CSS must stay valid — braces glued together were a real bug
assert.ok(plugin._debug.css.includes('.dsh-clove-pet {'), 'pet CSS block missing');
assert.ok(plugin._debug.css.includes('position: fixed;'), 'pet CSS is not fixed-positioned');
assert.ok(!plugin._debug.css.includes(',  position'), 'pet CSS collapsed into a comma list');

const disposers = [];
plugin.apply({
  effect(fn) {
    const dispose = fn();
    if (typeof dispose === 'function') disposers.push(dispose);
  },
});

assert.ok(document.head.children.some((el) => el.id === 'dsh-clove-pet-css'), 'missing style tag');
const pet = document.querySelector('.dsh-clove-pet');
assert.ok(pet, 'pet was not mounted');

const nodes = [];
walk(pet, (n) => nodes.push(n));
const img = nodes.find((n) => n.classList.contains('pet-img'));
const bubble = nodes.find((n) => n.classList.contains('pet-bubble'));
const glow = nodes.find((n) => n.classList.contains('pet-glow'));
const btn = nodes.find((n) => n.classList.contains('pet-btn'));
const acts = nodes.filter((n) => n.classList.contains('pet-act'));
const fx = nodes.find((n) => n.classList.contains('pet-fx'));
assert.ok(img && bubble && glow && btn && fx, 'incomplete pet DOM');
assert.equal(img.attrs['src'], '/dsh-clove-pet/pet.png', 'wrong pet image path');
assert.equal(acts.length, 5, 'expected five hover buttons');

// position restored from storage, inside the viewport
const petW = 120;
const petH = Math.round(petW * 1.02);
const margin = 8;
const maxX = 1280 - petW - margin;
const maxY = 800 - petH - margin;
assert.equal(pet.style.getPropertyValue('--pet-x'), String(margin + 0.5 * (maxX - margin)) + 'px', 'saved x not restored');
assert.equal(pet.style.getPropertyValue('--pet-y'), String(margin + 0.5 * (maxY - margin)) + 'px', 'saved y not restored');
assert.ok(timeouts.size > 0, 'intro/idle timers not scheduled');

// petting: bubble, hearts, affinity +1
btn.dispatch('click', { detail: 1 });
assert.ok(bubble.classList.contains('is-visible'), 'no bubble after petting');
assert.ok(bubble.textContent.length > 0, 'empty bubble');
assert.ok(pet.classList.contains('is-happy'), 'no happy animation');
assert.ok(fx.children.filter((n) => n.classList.contains('pet-fx-item')).length >= 3, 'no heart particles');
assert.equal(store.get('dsh-clove-pet:affinity:v1'), '8', 'affinity not persisted');
assert.match(bubble.style.getPropertyValue('--bubble-rot'), /deg$/, 'bubble has no tilt');

// line pool
const L = plugin._debug.lines;
const lineCount =
  Object.values(L.hello).reduce((sum, pool) => sum + pool.length, 0) +
  L.firstMeet.length + L.pet.length + L.petClose.length + Object.keys(L.milestone).length +
  L.drag.length + L.drop.length + L.sleep.length + L.wake.length + L.lonely.length +
  L.spin.length + L.walkAway.length + L.lateNight.length;
assert.ok(lineCount >= 60, 'line pool too small: ' + lineCount);

// keep petting past the affinity-10 milestone
for (let i = 0; i < 4; i++) btn.dispatch('click', { detail: 1 });
assert.equal(store.get('dsh-clove-pet:affinity:v1'), '12', 'affinity did not accumulate');

// double click spins
btn.dispatch('dblclick', { preventDefault() {} });
assert.ok(pet.classList.contains('is-spin'), 'double click did not spin');

// right click sleeps and wakes
btn.dispatch('contextmenu', { preventDefault() {} });
assert.ok(pet.classList.contains('is-sleep'), 'right click did not sleep');
btn.dispatch('contextmenu', { preventDefault() {} });
assert.ok(!pet.classList.contains('is-sleep'), 'second right click did not wake up');

// the fly button starts a flight (rAF driven), frames finish it
const flyBtn = acts.find((n) => n.classList.contains('pet-act-fly'));
assert.ok(flyBtn, 'missing fly button');
flyBtn.dispatch('click', { stopPropagation() {} });
assert.ok(pet.classList.contains('is-flying'), 'fly button did not start a flight');
assert.ok(rafs.size > 0, 'flight did not schedule a frame');
let stamp = 1000;
for (let i = 0; i < 200 && rafs.size > 0; i++) {
  const frames = [...rafs.values()];
  rafs.clear();
  stamp += 100;
  frames.forEach((fn) => fn(stamp));
}
assert.ok(!pet.classList.contains('is-flying'), 'flight did not finish');

// pin: freezes the wander behaviour and remembers the choice
const pinBtn = acts.find((n) => n.classList.contains('pet-act-pin'));
assert.ok(pinBtn, 'missing pin button');
assert.ok(plugin._debug.css.includes('.pet-act.is-active'), 'pin active style missing');
pinBtn.dispatch('click', { stopPropagation() {} });
assert.equal(store.get('dsh-clove-pet:pinned:v1'), '1', 'pin state not persisted');
assert.ok(pinBtn.classList.contains('is-active'), 'pin button not highlighted');
assert.equal(pinBtn.attrs['aria-pressed'], 'true', 'aria-pressed not set');
assert.ok(pinBtn.attrs['title'].includes('固定'), 'pin title not updated');
flyBtn.dispatch('click', { stopPropagation() {} });
assert.ok(!pet.classList.contains('is-flying'), 'pinned pet still flew away');
pinBtn.dispatch('click', { stopPropagation() {} });
assert.equal(store.get('dsh-clove-pet:pinned:v1'), '0', 'unpin state not persisted');
assert.ok(!pinBtn.classList.contains('is-active'), 'pin highlight not removed');

// economy: daily sign-in and stat decay happen on load
const d = new Date();
const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
let careSave = JSON.parse(store.get('dsh-clove-pet:care:v1'));
assert.equal(careSave.coins, 1080, 'daily sign-in reward missing');
assert.ok(Math.abs(careSave.hunger - 39.2) < 0.2, 'hunger did not decay: ' + careSave.hunger);
assert.ok(Math.abs(careSave.thirst - 39) < 0.2, 'thirst did not decay: ' + careSave.thirst);
assert.equal(careSave.xp, 20, 'sign-in xp missing');
assert.equal(careSave.lastLogin, today, 'lastLogin not recorded');

// panel opens, renders bars and the coin balance
const panelBtn = acts.find((n) => n.classList.contains('pet-act-panel'));
assert.ok(panelBtn, 'missing panel button');
assert.ok(plugin._debug.css.includes('.dsh-clove-panel'), 'panel CSS missing');
const panel = document.querySelector('.dsh-clove-panel');
assert.ok(panel, 'panel was not built');
assert.equal(panel.style.display, 'none', 'panel should start hidden');
panelBtn.dispatch('click', { stopPropagation() {} });
assert.equal(panel.style.display, 'flex', 'panel did not open');
let panelNodes = allNodes(panel);
const coinsEl = panelNodes.find((n) => n.classList.contains('pet-panel-coins'));
assert.ok(coinsEl && coinsEl.textContent.includes('1080'), 'coins not rendered');
assert.equal(panelNodes.filter((n) => n.classList.contains('pet-bar-fill')).length, 4, 'stat bars missing');
assert.deepEqual(
  panelNodes.filter((n) => n.classList.contains('pet-bar-value')).map((n) => n.textContent),
  ['39 / 100', '39 / 100', '49 / 100'],
  'stat values wrong',
);
assert.ok(panelNodes.some((n) => n.textContent === '今日已签到'), 'sign-in state not rendered');

// shop: buying spends coins and fills the bag
allNodes(panel).find((n) => n.classList.contains('pet-panel-tab') && n.textContent === '商店').dispatch('click', { stopPropagation() {} });
const buyButtons = allNodes(panel).filter((n) => n.classList.contains('pet-btn-small') && n.textContent === '购买');
assert.ok(buyButtons.length > 0, 'no buy buttons in shop');
buyButtons[0].dispatch('click', { stopPropagation() {} });
careSave = JSON.parse(store.get('dsh-clove-pet:care:v1'));
assert.equal(careSave.coins, 1072, 'buying did not spend coins');
assert.equal(careSave.inventory.candy, 1, 'bought food not in bag');

// feeding raises hunger and xp
allNodes(panel).find((n) => n.classList.contains('pet-panel-tab') && n.textContent === '状态').dispatch('click', { stopPropagation() {} });
const eatBtn = buttonIn(panel, '吃掉');
assert.ok(eatBtn, 'feed button missing');
eatBtn.dispatch('click', { stopPropagation() {} });
careSave = JSON.parse(store.get('dsh-clove-pet:care:v1'));
assert.equal(careSave.inventory.candy, undefined, 'eaten food not removed');
assert.ok(Math.abs(careSave.hunger - 49.2) < 0.2, 'hunger not restored: ' + careSave.hunger);
assert.equal(careSave.xp, 29, 'buy/feed xp missing: ' + careSave.xp);

// toys: buy a handheld and play with it, cooldown blocks the second play
allNodes(panel).find((n) => n.classList.contains('pet-panel-tab') && n.textContent === '商店').dispatch('click', { stopPropagation() {} });
const handheldRow = rowNamed(panel, '星光掌机');
assert.ok(handheldRow, 'toy row missing');
buttonIn(handheldRow, '购买').dispatch('click', { stopPropagation() {} });
careSave = JSON.parse(store.get('dsh-clove-pet:care:v1'));
assert.equal(careSave.coins, 812, 'toy price not charged');
assert.ok(careSave.toys.indexOf('handheld') >= 0, 'toy not owned');
assert.ok(careSave.happiness > 48, 'toy happiness bonus missing');

allNodes(panel).find((n) => n.classList.contains('pet-panel-tab') && n.textContent === '玩具').dispatch('click', { stopPropagation() {} });
const playRow = rowNamed(panel, '星光掌机');
assert.ok(playRow, 'owned toy row missing');
buttonIn(playRow, '陪玩').dispatch('click', { stopPropagation() {} });
careSave = JSON.parse(store.get('dsh-clove-pet:care:v1'));
assert.ok(careSave.toyCooldown.handheld > Date.now(), 'toy cooldown not set');
assert.ok(careSave.playCount >= 1, 'play count missing');
const cooledRow = rowNamed(panel, '星光掌机');
assert.equal(buttonIn(cooledRow, '陪玩').attrs['disabled'], 'disabled', 'cooldown button not disabled');

// closing the panel
panelNodes = allNodes(panel);
panelNodes.find((n) => n.classList.contains('pet-panel-close')).dispatch('click', {});
assert.equal(panel.style.display, 'none', 'panel did not close');

// dragging follows the pointer, release glides with inertia
btn.dispatch('pointerdown', {
  clientX: 640,
  clientY: 400,
  pointerId: 1,
  button: 0,
  preventDefault() {},
});
assert.ok(pet.classList.contains('is-drag'), 'pointerdown did not start dragging');
const beforeX = pet.style.getPropertyValue('--pet-x');
const moveHandlers = windowListeners.get('pointermove') || [];
assert.equal(moveHandlers.length, 1, 'no pointermove listener');
moveHandlers[0]({ clientX: 720, clientY: 460 });
assert.notEqual(pet.style.getPropertyValue('--pet-x'), beforeX, 'drag did not move the pet');
const upHandlers = windowListeners.get('pointerup') || [];
assert.equal(upHandlers.length, 1, 'no pointerup listener');
upHandlers[0]();
assert.ok(!pet.classList.contains('is-drag'), 'still dragging after release');
assert.ok(pet.classList.contains('is-gliding'), 'release did not start inertia glide');
assert.equal((windowListeners.get('pointermove') || []).length, 0, 'pointermove listener not removed');
for (let i = 0; i < 400 && rafs.size > 0; i++) {
  const frames = [...rafs.values()];
  rafs.clear();
  stamp += 80;
  frames.forEach((fn) => fn(stamp));
}
assert.ok(!pet.classList.contains('is-gliding'), 'glide did not settle');
const finalX = parseFloat(pet.style.getPropertyValue('--pet-x'));
const finalY = parseFloat(pet.style.getPropertyValue('--pet-y'));
assert.ok(finalX >= margin && finalX <= maxX, 'pet drifted outside the viewport horizontally');
assert.ok(finalY >= margin && finalY <= maxY, 'pet drifted outside the viewport vertically');

// unmount leaves nothing behind
disposers.forEach((fn) => fn());
assert.equal(document.querySelector('.dsh-clove-pet'), null, 'pet DOM not removed');
assert.equal(document.querySelector('.dsh-clove-panel'), null, 'panel DOM not removed');
assert.ok(!document.head.children.some((el) => el.id === 'dsh-clove-pet-css'), 'style tag not removed');
assert.equal(timeouts.size, 0, 'timers not cleared');
assert.equal(rafs.size, 0, 'animation frames not cleared');
assert.equal((windowListeners.get('resize') || []).length, 0, 'resize listener not removed');
assert.equal((windowListeners.get('pointermove') || []).length, 0, 'pointermove listener leaked');

console.log('smoke ok: mount / restore / petting / spin / sleep / fly / pin / economy+shop / drag+inertia / cleanup');
