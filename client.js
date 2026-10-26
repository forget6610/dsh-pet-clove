// Browser half of the Clove desktop pet.
//
// Loaded by dsh's web loader via the "./client" export. It's a hand-written
// bundle (not an ES module) that returns { apply, inject }.

window.__ModuleLoader__.load({
  id: 'dsh-pet-clove',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    const PET_SRC = '/dsh-clove-pet/pet.png';
    const STORE_POS = 'dsh-clove-pet:pos:v1';
    const STORE_AFF = 'dsh-clove-pet:affinity:v1';
    const PET_SIZE = 150;
    const GROUND_GAP = 14;
    const WALK_SPEED = 92; // px / s
    const GRAVITY = 2600; // px / s^2
    const BOUNCE = 0.32;

    const LINES = {
      hello: {
        morning: ['早啊，今天也来点恶作剧？', '早上好，昨晚的梦里有蝴蝶吗？'],
        noon: ['中午好，吃饱了才有力气捣乱。', '午休时间，要不要一起偷个懒？'],
        afternoon: ['下午好，蝴蝶有点困了。', '这个点最容易犯困，我给你讲个笑话？'],
        evening: ['晚上好，烟雾里见？', '天黑了，轮到我出场了。'],
        night: ['这么晚还不睡？那正好，陪我玩。', '夜猫子？巧了，我最擅长熬夜。'],
      },
      firstMeet: ['第一次见？我叫暮蝶，记好了。'],
      pet: [
        '再摸一下。',
        '嘻嘻，痒。',
        '喂，别摸乱了。',
        '这只手是谁的？',
        '蝴蝶都要被你摸飞了。',
        '你手上有糖吗？没有还摸。',
        '摸头要收费的，一次一个笑话。',
        '我可不是猫，别以为有耳朵就能随便摸。',
      ],
      petClose: [
        '你比我想的更有趣。',
        '好吧，允许你多摸两下。',
        '交换秘密吗？你先说。',
        '喂，摸归摸，别跟别人说。',
        '再摸下去，我可要赖上你了。',
        '手别抖，我又不会咬人——大概。',
        '这是特等席，别人没有的。',
      ],
      milestone: {
        5: '嗯？你好像比我想的还执着。',
        10: '好吧，你算是半个自己人了。',
        20: '这只手我记住了，下次还找它。',
        50: '你是不是一整天都在等我？……也没说不可以。',
      },
      drag: [
        '放我下来！',
        '要去哪儿？',
        '颠得我头晕。',
        '抓这么稳干嘛，我又不会飞走。',
        '喂，我的蝴蝶耳饰要掉了！',
        '轻点轻点，永生也怕摔。',
      ],
      drop: ['落地稳如猫。', '这里视野不错。', '就这儿吧，我批准了。', '搬来搬去，你当我是行李？'],
      sleep: ['让我睡会儿…', '蝴蝶也要休息的。', '别吵，我在攒力气。', '睡着了就不许偷拍。'],
      wake: ['唔…醒了。', '谁把我叫醒了？', '才睡了一小会儿。', '有点起床气，你最好有正事。'],
      lonely: [
        '他们惨败的样子真滑稽。',
        '死一下而已，又不是第一次。',
        '烟雾里见的，才算朋友。',
        '蝴蝶飞走之前，记得看我一眼。',
        '今天也没人敢跟我正面打。',
        '你说，永生算不算一种加班？',
        '我数了三遍，你还没来找我说话。',
        '窗外的风，有点像爱丁堡。',
        '别担心，我只是在发呆，不是死了。',
        '刚才那局，我死得很有艺术感。',
        '想听个苏格兰冷笑话吗？算了，你不会笑。',
      ],
      spin: ['转一圈！', '蝴蝶都是这样飞的。', '看清楚，这叫入场姿势。'],
      walkAway: ['去那边看看。', '散个步。', '有点无聊，溜达一下。'],
      lateNight: ['这个点还不睡，明天会后悔的。', '熬夜冠军？我陪你就是了。'],
    };

    const CSS = `.dsh-clove-pet {,  position: fixed;,  left: 0;,  top: 0;,  width: var(--clove-pet-size, 150px);,  z-index: 38;,  pointer-events: none;,  user-select: none;,  -webkit-user-select: none;,  transform: translate3d(var(--pet-x, 40vw), var(--pet-y, 60vh), 0);,  will-change: transform;,},.dsh-clove-pet .pet-btn {,  position: relative;,  display: block;,  width: 100%;,  padding: 0;,  margin: 0;,  border: 0;,  background: none;,  pointer-events: auto;,  cursor: grab;,  transform-origin: 50% 100%;,  animation: pet-breathe 4.6s ease-in-out infinite;,  -webkit-tap-highlight-color: transparent;,},.dsh-clove-pet .pet-btn:focus-visible { outline: 2px solid rgba(244, 114, 182, 0.65); outline-offset: 6px; border-radius: 18px; },.dsh-clove-pet.is-drag .pet-btn { cursor: grabbing; },.dsh-clove-pet .pet-face { display: block; transform: scaleX(var(--pet-face, 1)); transition: transform 0.18s ease; },.dsh-clove-pet .pet-img {,  display: block;,  width: 100%;,  height: auto;,  -webkit-user-drag: none;,  transform-origin: 50% 100%;,  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 14px rgba(244, 114, 182, 0.22));,},.dsh-clove-pet .pet-shadow {,  position: absolute;,  left: 50%;,  bottom: -6px;,  width: 62%;,  height: 12px;,  transform: translateX(-50%);,  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));,  filter: blur(3px);,  opacity: 0.55;,},.dsh-clove-pet.is-walking .pet-img { animation: pet-walk 0.44s ease-in-out infinite; },.dsh-clove-pet.is-happy .pet-img { animation: pet-happy 0.7s ease; },.dsh-clove-pet.is-spin .pet-img { animation: pet-spin 0.8s cubic-bezier(0.3, 0.7, 0.4, 1); },.dsh-clove-pet.is-drag .pet-img { transform: rotate(7deg) scale(1.03); },.dsh-clove-pet.is-falling .pet-img { transform: rotate(-4deg); },.dsh-clove-pet.is-sleep .pet-btn { animation: pet-sleep 6.4s ease-in-out infinite; },.dsh-clove-pet.is-sleep .pet-img { filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5)) brightness(0.78) saturate(0.75); },.dsh-clove-pet.is-sleep .pet-shadow { opacity: 0.4; },.dsh-clove-pet .pet-bubble {,  position: absolute;,  left: 50%;,  bottom: calc(100% - 2px);,  transform: translate(calc(-50% + var(--bubble-shift, 0px)), 6px) rotate(var(--bubble-rot, -1.2deg)) scale(0.92);,  transform-origin: 50% 100%;,  max-width: 232px;,  width: max-content;,  padding: 9px 14px 10px;,  border-radius: 16px 22px 18px 14px;,  background: linear-gradient(135deg, rgba(52, 20, 72, 0.97), rgba(26, 10, 42, 0.98));,  border: 1.5px solid rgba(244, 114, 182, 0.55);,  box-shadow: 0 0 0 2px rgba(10, 5, 18, 0.92), 0 12px 28px rgba(0, 0, 0, 0.55), 0 0 20px rgba(192, 132, 252, 0.22);,  color: #FDF2F8;,  font-size: 12.5px;,  line-height: 1.6;,  letter-spacing: 0.03em;,  text-align: left;,  opacity: 0;,  pointer-events: none;,  transition: opacity 0.16s ease, transform 0.2s ease;,},.dsh-clove-pet .pet-bubble::after {,  content: "";,  position: absolute;,  left: 22px;,  bottom: -7px;,  width: 14px;,  height: 14px;,  background: linear-gradient(135deg, rgba(42, 16, 60, 0.97), rgba(26, 10, 42, 0.98));,  border-right: 1.5px solid rgba(244, 114, 182, 0.55);,  border-bottom: 1.5px solid rgba(244, 114, 182, 0.55);,  border-radius: 0 0 4px 0;,  transform: rotate(45deg);,},.dsh-clove-pet .pet-bubble::before {,  content: "";,  position: absolute;,  right: -11px;,  top: -12px;,  width: 26px;,  height: 20px;,  background: linear-gradient(135deg, #F9A8D4, #C084FC);,  clip-path: polygon(0 50%, 40% 6%, 50% 50%, 60% 6%, 100% 50%, 60% 94%, 50% 50%, 40% 94%);,  filter: drop-shadow(0 0 4px rgba(244, 114, 182, 0.6));,  opacity: 0.92;,  pointer-events: none;,},.dsh-clove-pet .pet-bubble.is-visible {,  opacity: 1;,  transform: translate(calc(-50% + var(--bubble-shift, 0px)), 0) rotate(var(--bubble-rot, -1.2deg)) scale(1);,  animation: pet-bubble-pop 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);,},.dsh-clove-pet .pet-actions {,  position: absolute;,  left: 50%;,  bottom: calc(100% + 6px);,  transform: translateX(-50%) translateY(6px);,  display: flex;,  gap: 6px;,  opacity: 0;,  pointer-events: none;,  transition: opacity 0.16s ease, transform 0.16s ease;,},.dsh-clove-pet.is-hover .pet-actions { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; },.dsh-clove-pet .pet-act {,  width: 28px;,  height: 28px;,  border-radius: 50%;,  display: flex;,  align-items: center;,  justify-content: center;,  padding: 0;,  font-size: 13px;,  line-height: 1;,  color: #FDF2F8;,  background: rgba(28, 16, 48, 0.94);,  border: 1px solid rgba(244, 114, 182, 0.42);,  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);,  cursor: pointer;,  pointer-events: auto;,},.dsh-clove-pet .pet-act:hover { background: rgba(244, 114, 182, 0.32); },.dsh-clove-pet .pet-fx { position: absolute; inset: 0; pointer-events: none; overflow: visible; },.dsh-clove-pet .pet-fx-item {,  position: absolute;,  left: 50%;,  top: 34%;,  font-size: 14px;,  line-height: 1;,  color: #FDF2F8;,  opacity: 0;,  animation: pet-fx 1s ease-out forwards;,},@keyframes pet-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.012); } },@keyframes pet-sleep { 0%, 100% { transform: scale(1) translateY(0); } 50% { transform: scale(0.992) translateY(2px); } },@keyframes pet-walk {,  0%, 100% { transform: translateY(0) rotate(-1.5deg); },  50% { transform: translateY(-5px) rotate(1.5deg); },},@keyframes pet-happy {,  0% { transform: scale(1); },  28% { transform: translateY(-12px) scale(1.05, 0.95); },  60% { transform: translateY(0) scale(0.96, 1.04); },  80% { transform: translateY(-4px) scale(1.01); },  100% { transform: scale(1); },},@keyframes pet-spin {,  0% { transform: rotate(0deg) scale(1); },  50% { transform: rotate(180deg) scale(1.06); },  100% { transform: rotate(360deg) scale(1); },},@keyframes pet-fx {,  0% { opacity: 0; transform: translate(0, 0) scale(0.6); },  18% { opacity: 1; },  100% { opacity: 0; transform: translate(var(--fx-x, 0px), var(--fx-y, -60px)) scale(1.15); },},@keyframes pet-bubble-pop {,  0% { opacity: 0; transform: translate(calc(-50% + var(--bubble-shift, 0px)), 8px) rotate(var(--bubble-rot, -1.2deg)) scale(0.82); },  65% { opacity: 1; transform: translate(calc(-50% + var(--bubble-shift, 0px)), -2px) rotate(var(--bubble-rot, -1.2deg)) scale(1.03); },  100% { opacity: 1; transform: translate(calc(-50% + var(--bubble-shift, 0px)), 0) rotate(var(--bubble-rot, -1.2deg)) scale(1); },},@media (max-width: 900px) { .dsh-clove-pet { display: none; } },@media (prefers-reduced-motion: reduce) {,  .dsh-clove-pet .pet-btn,,  .dsh-clove-pet.is-walking .pet-img,,  .dsh-clove-pet.is-happy .pet-img,,  .dsh-clove-pet.is-spin .pet-img,,  .dsh-clove-pet.is-sleep .pet-btn { animation: none !important; },}`;

    const now = () => (window.performance && window.performance.now ? window.performance.now() : Date.now());
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const rand = (lo, hi) => lo + Math.random() * (hi - lo);
    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    // avoid saying the same thing twice in a row
    let lastLine = '';
    const pickLine = (pool) => {
      if (!pool || pool.length === 0) return '';
      let next = pick(pool);
      if (pool.length > 1 && next === lastLine) next = pool[(pool.indexOf(next) + 1) % pool.length];
      lastLine = next;
      return next;
    };

    const safeStorage = {
      get(key) {
        try {
          return window.localStorage.getItem(key);
        } catch (err) {
          return null;
        }
      },
      set(key, value) {
        try {
          window.localStorage.setItem(key, value);
        } catch (err) {
          // storage can be unavailable in private mode
        }
      },
    };

    const mountPet = () => {
      if (document.querySelector('.dsh-clove-pet')) return () => {};

      const host = document.createElement('div');
      host.className = 'dsh-clove-pet';
      host.setAttribute('data-plugin', 'dsh-pet-clove');

      const shadow = document.createElement('div');
      shadow.className = 'pet-shadow';

      const bubble = document.createElement('div');
      bubble.className = 'pet-bubble';
      bubble.setAttribute('role', 'status');
      bubble.setAttribute('aria-live', 'polite');

      const fx = document.createElement('div');
      fx.className = 'pet-fx';

      const btn = document.createElement('button');
      btn.className = 'pet-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('title', '暮蝶桌宠（拖动 / 点击 / 双击 / 右键）');
      btn.setAttribute('aria-label', '暮蝶桌宠，点我摸摸，拖动可以搬走');

      const face = document.createElement('div');
      face.className = 'pet-face';

      const img = document.createElement('img');
      img.className = 'pet-img';
      img.setAttribute('src', PET_SRC);
      img.setAttribute('alt', '暮蝶桌宠');
      img.setAttribute('draggable', 'false');

      const actions = document.createElement('div');
      actions.className = 'pet-actions';

      const heartBtn = document.createElement('button');
      heartBtn.className = 'pet-act pet-act-heart';
      heartBtn.setAttribute('type', 'button');
      heartBtn.setAttribute('title', '摸一摸');
      heartBtn.textContent = '♥';

      const sleepBtn = document.createElement('button');
      sleepBtn.className = 'pet-act pet-act-sleep';
      sleepBtn.setAttribute('type', 'button');
      sleepBtn.setAttribute('title', '睡觉 / 唤醒');
      sleepBtn.textContent = '☾';

      face.appendChild(img);
      btn.appendChild(face);
      actions.appendChild(heartBtn);
      actions.appendChild(sleepBtn);
      host.appendChild(shadow);
      host.appendChild(bubble);
      host.appendChild(fx);
      host.appendChild(btn);
      host.appendChild(actions);
      (document.body || document.documentElement).appendChild(host);

      const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

      const state = {
        x: 0,
        y: 0,
        facing: 1,
        dragging: false,
        falling: false,
        walking: false,
        sleeping: false,
        affinity: 0,
        silentTicks: 0,
      };

      let petW = host.offsetWidth || PET_SIZE;
      let petH = Math.round(petW * 1.02);
      const timers = [];
      const rafs = new Map();
      let rafSeq = 1;
      let walkRaf = null;
      let fallRaf = null;
      let idleTimer = null;
      let zzzTimer = null;
      let bubbleTimer = null;
      let greetTimer = null;
      let hoverTimer = null;
      let drag = null;
      let justDragged = false;
      const lineIndex = 0;

      const viewportW = () => window.innerWidth || 1280;
      const viewportH = () => window.innerHeight || 800;
      const groundY = () => viewportH() - petH - GROUND_GAP;
      const maxX = () => Math.max(0, viewportW() - petW);

      const later = (fn, ms) => {
        var id = window.setTimeout(fn, ms);
        timers.push(id);
        return id;
      };

      const requestFrame = (fn) => {
        var id = rafSeq++;
        rafs.set(id, fn);
        window.requestAnimationFrame((t) => {
          rafs.delete(id);
          fn(t);
        });
        return id;
      };

      const cancelFrame = (id) => {
        if (id === null || id === undefined) return;
        rafs.delete(id);
        window.cancelAnimationFrame(id);
      };

      const applyPos = () => {
        host.style.setProperty('--pet-x', Math.round(state.x) + 'px');
        host.style.setProperty('--pet-y', Math.round(state.y) + 'px');
        const lift = Math.max(0, groundY() - state.y);
        const s = Math.max(0.45, 1 - lift / 420);
        shadow.style.setProperty('transform', 'translateX(-50%) scale(' + s.toFixed(3) + ')');
        shadow.style.setProperty('opacity', String(Math.max(0.18, 0.55 - lift / 700)));
      };

      const applyFacing = () => {
        host.style.setProperty('--pet-face', state.facing >= 0 ? '1' : '-1');
      };

      const persistPos = () => {
        if (maxX() <= 0) return;
        safeStorage.set(STORE_POS, String(clamp(state.x / maxX(), 0, 1).toFixed(4)));
      };

      const persistAffinity = () => {
        safeStorage.set(STORE_AFF, String(state.affinity));
      };

      const showBubble = (text, ms) => {
        if (!text) return;
        bubble.textContent = text;
        // keep the bubble inside the viewport near screen edges
        const bw = bubble.offsetWidth || 180;
        const center = state.x + petW / 2;
        const half = bw / 2 + 10;
        let shift = 0;
        if (center - half < 8) shift = 8 - (center - half);
        else if (center + half > viewportW() - 8) shift = viewportW() - 8 - (center + half);
        bubble.style.setProperty('--bubble-shift', Math.round(shift) + 'px');
        bubble.style.setProperty('--bubble-rot', rand(-1.6, 1.6).toFixed(2) + 'deg');
        bubble.classList.remove('is-visible');
        void bubble.offsetWidth; // 重放弹出动画
        bubble.classList.add('is-visible');
        if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
        bubbleTimer = later(() => bubble.classList.remove('is-visible'), ms || 3600);
      };

      const restartClass = (name, ms) => {
        host.classList.remove(name);
        void host.offsetWidth;
        host.classList.add(name);
        later(() => host.classList.remove(name), ms);
      };

      const spawnFx = (glyph, count, color) => {
        for (var i = 0; i < count; i++) {
          const item = document.createElement('span');
          item.className = 'pet-fx-item';
          item.textContent = glyph;
          if (color) item.style.setProperty('color', color);
          item.style.setProperty('--fx-x', Math.round(rand(-46, 46)) + 'px');
          item.style.setProperty('--fx-y', Math.round(rand(-92, -46)) + 'px');
          item.style.setProperty('animation-delay', Math.round(rand(0, 160)) + 'ms');
          item.style.setProperty('font-size', Math.round(rand(12, 18)) + 'px');
          fx.appendChild(item);
          later(
            (function (node) {
              return function () {
                if (node && node.parentNode) node.parentNode.removeChild(node);
              };
            })(item),
            1250,
          );
        }
      };

      const bumpAffinity = () => {
        state.affinity += 1;
        persistAffinity();
        return state.affinity;
      };

      const petMe = () => {
        if (state.sleeping) wakeUp();
        state.silentTicks = 0;
        restartClass('is-happy', 760);
        spawnFx('♥', 5, '#FB7185');
        spawnFx('✨', 2, '#FDE68A');
        const pool = state.affinity >= 10 ? LINES.pet.concat(LINES.petClose) : LINES.pet;
        showBubble(pickLine(pool));
        const nextAffinity = bumpAffinity();
        const milestoneLine = LINES.milestone[String(nextAffinity)];
        if (milestoneLine) {
          later(() => {
            if (!state.sleeping) {
              showBubble(milestoneLine, 4400);
              spawnFx('✧', 3, '#FDE68A');
            }
          }, 900);
        }
      };

      const spin = () => {
        if (state.sleeping || state.dragging) return;
        restartClass('is-spin', 840);
        spawnFx('✦', 3, '#C084FC');
        showBubble(pickLine(LINES.spin));
      };

      const startZzz = () => {
        if (zzzTimer !== null) return;
        const tick = () => {
          if (!state.sleeping) {
            zzzTimer = null;
            return;
          }
          spawnFx('Z', 1, '#E9D5FF');
          zzzTimer = window.setTimeout(tick, 1100);
          timers.push(zzzTimer);
        };
        zzzTimer = window.setTimeout(tick, 500);
        timers.push(zzzTimer);
      };

      const sleep = () => {
        if (state.sleeping) return;
        state.sleeping = true;
        stopWalk();
        host.classList.add('is-sleep');
        showBubble(pick(LINES.sleep), 2600);
        startZzz();
      };

      const wakeUp = () => {
        if (!state.sleeping) return;
        state.sleeping = false;
        host.classList.remove('is-sleep');
        if (zzzTimer !== null) {
          window.clearTimeout(zzzTimer);
          zzzTimer = null;
        }
        showBubble(pick(LINES.wake));
        state.silentTicks = 0;
      };

      const toggleSleep = () => {
        if (state.sleeping) wakeUp();
        else sleep();
      };

      const stopWalk = () => {
        state.walking = false;
        host.classList.remove('is-walking');
        cancelFrame(walkRaf);
        walkRaf = null;
      };

      const stopFall = () => {
        state.falling = false;
        host.classList.remove('is-falling');
        cancelFrame(fallRaf);
        fallRaf = null;
      };

      const startWalk = (targetX, onDone) => {
        if (state.dragging || state.sleeping) return;
        stopWalk();
        const startX = state.x;
        const from = now();
        const duration = clamp((Math.abs(targetX - startX) / WALK_SPEED) * 1000, 420, 2800);
        state.facing = targetX >= startX ? 1 : -1;
        applyFacing();
        state.walking = true;
        host.classList.add('is-walking');
        if (Math.random() < 0.28) showBubble(pickLine(LINES.walkAway), 2000);
        var step = (t) => {
          if (!state.walking) return;
          const k = clamp((t - from) / duration, 0, 1);
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          state.x = startX + (targetX - startX) * e;
          applyPos();
          if (k < 1) {
            walkRaf = requestFrame(step);
          } else {
            state.walking = false;
            host.classList.remove('is-walking');
            walkRaf = null;
            persistPos();
            if (onDone) onDone();
          }
        };
        walkRaf = requestFrame(step);
      };

      const startFall = () => {
        if (state.dragging || state.sleeping) return;
        stopFall();
        state.falling = true;
        host.classList.add('is-falling');
        let vy = 0;
        let last = now();
        var step = (t) => {
          if (!state.falling) return;
          const dt = Math.min(0.05, (t - last) / 1000);
          last = t;
          vy += GRAVITY * dt;
          state.y += vy * dt;
          const ground = groundY();
          if (state.y >= ground) {
            state.y = ground;
            if (Math.abs(vy) > 280) {
              vy = -vy * BOUNCE;
              spawnFx('·', 2, '#B8A5D0');
            } else {
              state.y = ground;
              state.falling = false;
              host.classList.remove('is-falling');
              fallRaf = null;
              applyPos();
              persistPos();
              return;
            }
          }
          applyPos();
          fallRaf = requestFrame(step);
        };
        fallRaf = requestFrame(step);
      };

      const wander = () => {
        if (state.dragging || state.sleeping || state.walking) return;
        const target = clamp(rand(0.06, 0.94) * maxX(), 0, maxX());
        startWalk(target);
      };

      const showHover = () => {
        host.classList.add('is-hover');
        if (hoverTimer !== null) window.clearTimeout(hoverTimer);
      };

      const hideHover = () => {
        if (hoverTimer !== null) window.clearTimeout(hoverTimer);
        hoverTimer = later(() => host.classList.remove('is-hover'), 320);
      };

      const greetingPool = () => {
        var hour = new Date().getHours();
        if (hour < 6) return LINES.hello.night;
        if (hour < 11) return LINES.hello.morning;
        if (hour < 14) return LINES.hello.noon;
        if (hour < 18) return LINES.hello.afternoon;
        if (hour < 22) return LINES.hello.evening;
        return LINES.hello.night;
      };

      // restore the saved x ratio, falling back to the bottom-right corner
      const savedPos = safeStorage.get(STORE_POS);
      const savedAff = parseInt(safeStorage.get(STORE_AFF) || '0', 10);
      state.affinity = Number.isFinite(savedAff) && savedAff > 0 ? savedAff : 0;
      state.x = savedPos === null ? maxX() - 24 : clamp(parseFloat(savedPos) || 0, 0, 1) * maxX();
      state.y = groundY();
      applyPos();
      applyFacing();

      /* ── 交互 ─────────────────────────────────────────── */

      const onPointerDown = (event) => {
        if (event.target && event.target.closest && event.target.closest('.pet-act')) return;
        if (event.button !== undefined && event.button !== 0) return;
        if (event.preventDefault) event.preventDefault();
        if (state.sleeping) wakeUp();
        stopWalk();
        stopFall();
        drag = {
          id: event.pointerId,
          startX: event.clientX || 0,
          startY: event.clientY || 0,
          origX: state.x,
          origY: state.y,
          moved: false,
          t0: now(),
        };
        state.dragging = true;
        host.classList.add('is-drag');
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      };

      const onPointerMove = (event) => {
        if (!drag) return;
        const dx = (event.clientX || 0) - drag.startX;
        const dy = (event.clientY || 0) - drag.startY;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) {
          drag.moved = true;
          if (Math.random() < 0.38) {
            later(() => showBubble(pickLine(LINES.drag), 2000), 240);
          }
        }
        state.x = clamp(drag.origX + dx, 0, maxX());
        state.y = clamp(drag.origY + dy, 0, groundY());
        applyPos();
      };

      const onPointerUp = () => {
        if (!drag) return;
        const wasDrag = drag.moved;
        drag = null;
        state.dragging = false;
        host.classList.remove('is-drag');
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        if (wasDrag) {
          justDragged = true;
          later(() => {
            justDragged = false;
          }, 80);
          startFall();
          if (Math.random() < 0.5) {
            later(() => showBubble(pickLine(LINES.drop), 2400), 420);
          }
        } else {
          startFall();
        }
        persistPos();
      };

      const onClick = (event) => {
        if (justDragged) return;
        if (event && event.detail > 1) return;
        petMe();
      };

      const onDoubleClick = (event) => {
        if (event && event.preventDefault) event.preventDefault();
        spin();
      };

      const onContextMenu = (event) => {
        if (event && event.preventDefault) event.preventDefault();
        toggleSleep();
      };

      const onResize = () => {
        petW = host.offsetWidth || petW;
        petH = Math.round(petW * 1.02);
        state.x = clamp(state.x, 0, maxX());
        state.y = clamp(state.y, 0, groundY());
        applyPos();
        persistPos();
      };

      btn.addEventListener('pointerdown', onPointerDown);
      btn.addEventListener('click', onClick);
      btn.addEventListener('dblclick', onDoubleClick);
      btn.addEventListener('contextmenu', onContextMenu);
      btn.addEventListener('pointerenter', showHover);
      btn.addEventListener('pointerleave', hideHover);
      heartBtn.addEventListener('pointerenter', showHover);
      heartBtn.addEventListener('pointerleave', hideHover);
      sleepBtn.addEventListener('pointerenter', showHover);
      sleepBtn.addEventListener('pointerleave', hideHover);
      heartBtn.addEventListener('click', (event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        petMe();
      });
      sleepBtn.addEventListener('click', (event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        toggleSleep();
      });
      window.addEventListener('resize', onResize);

      /* ── 空闲行为 ─────────────────────────────────────── */
      const idleTick = () => {
        idleTimer = null;
        if (state.dragging || state.sleeping || state.walking || state.falling) {
          scheduleIdle();
          return;
        }
        state.silentTicks += 1;
        if (state.silentTicks >= 8) {
          sleep();
          scheduleIdle();
          return;
        }
        var hour = new Date().getHours();
        if (hour >= 0 && hour < 5 && Math.random() < 0.18) {
          showBubble(pickLine(LINES.lateNight), 3000);
          scheduleIdle();
          return;
        }
        const r = Math.random();
        if (r < 0.42) wander();
        else if (r < 0.6) restartClass('is-happy', 760);
        else if (r < 0.74) spin();
        else if (r < 0.88) showBubble(pickLine(LINES.lonely), 3200);
        scheduleIdle();
      };

      const scheduleIdle = () => {
        if (idleTimer !== null) window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(idleTick, rand(5000, 9000));
        timers.push(idleTimer);
      };

      if (!reduced) {
        greetTimer = later(() => {
          if (state.affinity === 0) showBubble(LINES.firstMeet[0], 4200);
          else showBubble(pickLine(greetingPool()), 4200);
        }, 1400);
        scheduleIdle();
      }

      return () => {
        if (drag) {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);
        }
        btn.removeEventListener('pointerdown', onPointerDown);
        btn.removeEventListener('click', onClick);
        btn.removeEventListener('dblclick', onDoubleClick);
        btn.removeEventListener('contextmenu', onContextMenu);
        btn.removeEventListener('pointerenter', showHover);
        btn.removeEventListener('pointerleave', hideHover);
        window.removeEventListener('resize', onResize);
        if (idleTimer !== null) window.clearTimeout(idleTimer);
        if (zzzTimer !== null) window.clearTimeout(zzzTimer);
        if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
        if (hoverTimer !== null) window.clearTimeout(hoverTimer);
        if (greetTimer !== null) window.clearTimeout(greetTimer);
        timers.forEach((id) => window.clearTimeout(id));
        timers.length = 0;
        rafs.forEach((_fn, id) => window.cancelAnimationFrame(id));
        rafs.clear();
        host.remove();
      };
    };

    const apply = (ctx) => {
      const styleEl = document.createElement('style');
      styleEl.id = 'dsh-clove-pet-css';
      styleEl.setAttribute('data-plugin', 'dsh-pet-clove');
      styleEl.textContent = CSS;
      (document.head || document.documentElement).appendChild(styleEl);
      ctx.effect(() => () => styleEl.remove());

      ctx.effect(() => mountPet());

      console.log('[clove-pet] browser half active');
    };

    exports.inject = [];
    exports.apply = apply;
    exports._debug = { lines: LINES };
    return module.exports;
  },
});
