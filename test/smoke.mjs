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

// pre-seed a save file: affinity 7, horizontal position 50%
store.set('dsh-clove-pet:affinity:v1', '7');
store.set('dsh-clove-pet:pos:v1', '0.5');

await import('../client.js');

const spec = globalThis.__spec;
assert.ok(spec, 'ModuleLoader.load was not called');
assert.equal(spec.id, 'dsh-pet-clove');

const plugin = spec.factory(() => ({}));
assert.deepEqual(plugin.inject, []);
assert.equal(typeof plugin.apply, 'function');

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
const shadow = nodes.find((n) => n.classList.contains('pet-shadow'));
const btn = nodes.find((n) => n.classList.contains('pet-btn'));
const acts = nodes.filter((n) => n.classList.contains('pet-act'));
const fx = nodes.find((n) => n.classList.contains('pet-fx'));
assert.ok(img && bubble && shadow && btn && fx, 'incomplete pet DOM');
assert.equal(img.attrs['src'], '/dsh-clove-pet/pet.png', 'wrong pet image path');
assert.equal(acts.length, 2, 'expected two action buttons');

// position restored from storage, standing on the floor
const petW = 120;
const petH = Math.round(petW * 1.02);
assert.equal(pet.style.getPropertyValue('--pet-y'), String(800 - petH - 14) + 'px', 'pet not on the floor');
assert.equal(pet.style.getPropertyValue('--pet-x'), String(Math.round(0.5 * (1280 - petW))) + 'px', 'saved position not restored');
assert.equal(pet.style.getPropertyValue('--pet-face'), '1');

// petting: bubble, hearts, affinity +1
btn.dispatch('click', { detail: 1 });
assert.ok(bubble.classList.contains('is-visible'), 'no bubble after petting');
assert.ok(bubble.textContent.length > 0, 'empty bubble');
assert.ok(pet.classList.contains('is-happy'), 'no happy animation');
assert.ok(fx.children.filter((n) => n.classList.contains('pet-fx-item')).length >= 5, 'no heart particles');
assert.equal(store.get('dsh-clove-pet:affinity:v1'), '8', 'affinity not persisted');
assert.match(bubble.style.getPropertyValue('--bubble-rot'), /deg$/, 'bubble has no tilt');
assert.ok(bubble.style.getPropertyValue('--bubble-shift').endsWith('px'), 'bubble has no edge offset');

// the line pool should be sizeable
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

// dragging follows the pointer
btn.dispatch('pointerdown', {
  clientX: 640,
  clientY: 400,
  pointerId: 1,
  button: 0,
  preventDefault() {},
});
assert.ok(pet.classList.contains('is-drag'), 'pointerdown did not start dragging');
const before = pet.style.getPropertyValue('--pet-x');
const moveHandlers = windowListeners.get('pointermove') || [];
assert.equal(moveHandlers.length, 1, 'no pointermove listener');
moveHandlers[0]({ clientX: 600, clientY: 260 });
assert.notEqual(pet.style.getPropertyValue('--pet-x'), before, 'drag did not move the pet');
const upHandlers = windowListeners.get('pointerup') || [];
assert.equal(upHandlers.length, 1, 'no pointerup listener');
upHandlers[0]();
assert.ok(!pet.classList.contains('is-drag'), 'still dragging after release');
assert.ok(pet.classList.contains('is-falling'), 'pet did not fall after release');
assert.equal((windowListeners.get('pointermove') || []).length, 0, 'pointermove listener not removed');

// gravity: step requestAnimationFrame until it lands
let stamp = 1000;
for (let i = 0; i < 80; i++) {
  const frames = [...rafs.values()];
  rafs.clear();
  if (frames.length === 0) break;
  stamp += 100;
  frames.forEach((fn) => fn(stamp));
}
assert.ok(!pet.classList.contains('is-falling'), 'fall did not finish');
assert.equal(pet.style.getPropertyValue('--pet-y'), String(800 - petH - 14) + 'px', 'pet did not land');

// unmount leaves nothing behind
disposers.forEach((fn) => fn());
assert.equal(document.querySelector('.dsh-clove-pet'), null, 'pet DOM not removed');
assert.ok(!document.head.children.some((el) => el.id === 'dsh-clove-pet-css'), 'style tag not removed');
assert.equal(timeouts.size, 0, 'timers not cleared');
assert.equal(rafs.size, 0, 'animation frames not cleared');
assert.equal((windowListeners.get('resize') || []).length, 0, 'resize listener not removed');

console.log('smoke ok: mount / restore / petting / spin / sleep / drag+gravity / cleanup');
