// Browser half of the Clove desktop pet.
//
// Loaded by dsh's web loader through the "./client" export. The pet flies
// around the viewport, can be dragged with inertia, reacts to clicks and falls
// asleep when ignored. Position and affinity are kept in localStorage.

window.__ModuleLoader__.load({
  id: 'dsh-pet-clove',
  factory: () => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    var PET_SRC = '/dsh-clove-pet/pet.png';
    var STORE_POS = 'dsh-clove-pet:pos:v2';
    var STORE_AFF = 'dsh-clove-pet:affinity:v1';
    var DEFAULT_SIZE = 150;
    var MARGIN = 8;
    var FRICTION = 2.6;
    var BOUNCE = 0.55;

    var LINES = {
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
      drop: ['飞累了。', '这里视野不错。', '就这儿吧，我批准了。', '搬来搬去，你当我是行李？'],
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

    var CSS = `
.dsh-clove-pet {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--clove-pet-size, 150px);
  z-index: 999;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  transform: translate3d(var(--pet-x, 60vw), var(--pet-y, 50vh), 0);
  will-change: transform;
}

.dsh-clove-pet .pet-glow {
  position: absolute;
  left: 50%;
  top: 54%;
  width: 165%;
  height: 140%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(192, 132, 252, 0.36), rgba(244, 114, 182, 0.16) 46%, rgba(244, 114, 182, 0) 74%);
  filter: blur(14px);
  animation: pet-glow 4.6s ease-in-out infinite;
  pointer-events: none;
}

.dsh-clove-pet .pet-btn {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  pointer-events: auto;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
}
.dsh-clove-pet .pet-btn:focus-visible { outline: 2px solid rgba(244, 114, 182, 0.65); outline-offset: 6px; border-radius: 20px; }
.dsh-clove-pet.is-drag .pet-btn { cursor: grabbing; }
.dsh-clove-pet.is-hover .pet-btn { cursor: grab; }

.dsh-clove-pet .pet-body {
  transform: scaleX(var(--pet-face, 1));
  transform-origin: 50% 60%;
  transition: transform 0.2s ease;
  animation: pet-bob 3.6s ease-in-out infinite;
}
.dsh-clove-pet.is-flying .pet-body { animation-duration: 0.9s; }
.dsh-clove-pet.is-drag .pet-body { animation: none; transform: scaleX(var(--pet-face, 1)) scale(1.04); }

.dsh-clove-pet .pet-img {
  display: block;
  width: 100%;
  height: auto;
  -webkit-user-drag: none;
  transform: rotate(var(--pet-tilt, 0deg));
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.48)) drop-shadow(0 0 16px rgba(244, 114, 182, 0.24));
  transition: filter 0.25s ease;
}
.dsh-clove-pet.is-happy .pet-img { animation: pet-happy 0.72s ease; }
.dsh-clove-pet.is-spin .pet-img { animation: pet-spin 0.85s cubic-bezier(0.3, 0.7, 0.4, 1); }
.dsh-clove-pet.is-sleep .pet-img { filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.48)) brightness(0.78) saturate(0.7); }
.dsh-clove-pet.is-sleep .pet-glow { opacity: 0.45; animation-duration: 7s; }

.dsh-clove-pet .pet-bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 4px);
  transform: translate(calc(-50% + var(--bubble-shift, 0px)), 6px) rotate(var(--bubble-rot, -1.2deg)) scale(0.92);
  transform-origin: 50% 100%;
  max-width: 220px;
  width: max-content;
  padding: 8px 12px;
  border-radius: 14px 18px 16px 12px;
  background: linear-gradient(135deg, rgba(52, 20, 72, 0.97), rgba(26, 10, 42, 0.98));
  border: 1.5px solid rgba(244, 114, 182, 0.55);
  box-shadow: 0 0 0 2px rgba(10, 5, 18, 0.9), 0 12px 26px rgba(0, 0, 0, 0.5);
  color: #FDF2F8;
  font-size: 12.5px;
  line-height: 1.55;
  letter-spacing: 0.02em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.2s ease;
}
.dsh-clove-pet .pet-bubble::after {
  content: "";
  position: absolute;
  left: 22px;
  bottom: -7px;
  width: 12px;
  height: 12px;
  background: rgba(32, 13, 50, 0.97);
  border-right: 1.5px solid rgba(244, 114, 182, 0.55);
  border-bottom: 1.5px solid rgba(244, 114, 182, 0.55);
  transform: rotate(45deg);
}
.dsh-clove-pet .pet-bubble.is-visible { opacity: 1; transform: translate(calc(-50% + var(--bubble-shift, 0px)), 0) rotate(var(--bubble-rot, -1.2deg)) scale(1); }

.dsh-clove-pet .pet-actions {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%) translateY(6px);
  display: flex;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.dsh-clove-pet.is-hover .pet-actions { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
.dsh-clove-pet .pet-act {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: #FDF2F8;
  background: rgba(28, 16, 48, 0.94);
  border: 1px solid rgba(244, 114, 182, 0.42);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}
.dsh-clove-pet .pet-act:hover { background: rgba(244, 114, 182, 0.32); }

.dsh-clove-pet .pet-fx { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.dsh-clove-pet .pet-fx-item {
  position: absolute;
  left: 50%;
  top: 40%;
  font-size: 14px;
  line-height: 1;
  color: #FDF2F8;
  opacity: 0;
  animation: pet-fx 1.2s ease-out forwards;
}

@keyframes pet-bob {
  0%, 100% { transform: scaleX(var(--pet-face, 1)) translateY(0) rotate(-1deg); }
  50% { transform: scaleX(var(--pet-face, 1)) translateY(-7px) rotate(1deg); }
}
@keyframes pet-glow { 0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.96); } 50% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.05); } }
@keyframes pet-happy {
  0% { transform: translateY(0) scale(1); }
  28% { transform: translateY(-14px) scale(1.06, 0.94); }
  60% { transform: translateY(0) scale(0.95, 1.05); }
  80% { transform: translateY(-5px) scale(1.01); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes pet-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.06); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes pet-fx {
  0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--fx-x, 0px), var(--fx-y, -60px)) scale(1.15); }
}

@media (max-width: 900px) {
  .dsh-clove-pet { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-clove-pet .pet-body,
  .dsh-clove-pet .pet-glow,
  .dsh-clove-pet.is-happy .pet-img,
  .dsh-clove-pet.is-spin .pet-img { animation: none !important; }
}
`;

    var now = () => (window.performance && window.performance.now ? window.performance.now() : Date.now());
    var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    var rand = (lo, hi) => lo + Math.random() * (hi - lo);
    var easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    var pick = (list) => list[Math.floor(Math.random() * list.length)];

    var lastLine = '';
    function pickLine(pool) {
      if (!pool || pool.length === 0) return '';
      var text = pick(pool);
      if (pool.length > 1 && text === lastLine) text = pool[(pool.indexOf(text) + 1) % pool.length];
      lastLine = text;
      return text;
    }

    var storage = {
      get: function (key) {
        try {
          return window.localStorage.getItem(key);
        } catch (err) {
          return null;
        }
      },
      set: function (key, value) {
        try {
          window.localStorage.setItem(key, value);
        } catch (err) {
          // storage can be unavailable in private mode
        }
      },
    };

    function mountPet() {
      if (document.querySelector('.dsh-clove-pet')) return function () {};

      var host = document.createElement('div');
      host.className = 'dsh-clove-pet';
      host.setAttribute('data-plugin', 'dsh-pet-clove');

      var glow = document.createElement('div');
      glow.className = 'pet-glow';

      var fx = document.createElement('div');
      fx.className = 'pet-fx';

      var bubble = document.createElement('div');
      bubble.className = 'pet-bubble';
      bubble.setAttribute('role', 'status');
      bubble.setAttribute('aria-live', 'polite');

      var actions = document.createElement('div');
      actions.className = 'pet-actions';

      var heartBtn = document.createElement('button');
      heartBtn.className = 'pet-act pet-act-heart';
      heartBtn.setAttribute('type', 'button');
      heartBtn.setAttribute('title', '摸一摸');
      heartBtn.textContent = '♥';

      var flyBtn = document.createElement('button');
      flyBtn.className = 'pet-act pet-act-fly';
      flyBtn.setAttribute('type', 'button');
      flyBtn.setAttribute('title', '飞一下');
      flyBtn.textContent = '✦';

      var sleepBtn = document.createElement('button');
      sleepBtn.className = 'pet-act pet-act-sleep';
      sleepBtn.setAttribute('type', 'button');
      sleepBtn.setAttribute('title', '睡觉 / 唤醒');
      sleepBtn.textContent = '☾';

      var button = document.createElement('button');
      button.className = 'pet-btn';
      button.setAttribute('type', 'button');
      button.setAttribute('title', '暮蝶桌宠：拖我、点我、双击我');
      button.setAttribute('aria-label', '暮蝶桌宠，拖我或者点我');

      var body = document.createElement('div');
      body.className = 'pet-body';

      var img = document.createElement('img');
      img.className = 'pet-img';
      img.setAttribute('src', PET_SRC);
      img.setAttribute('alt', '暮蝶桌宠');
      img.setAttribute('draggable', 'false');

      body.appendChild(img);
      button.appendChild(body);
      actions.appendChild(heartBtn);
      actions.appendChild(flyBtn);
      actions.appendChild(sleepBtn);
      host.appendChild(glow);
      host.appendChild(fx);
      host.appendChild(bubble);
      host.appendChild(actions);
      host.appendChild(button);
      (document.body || document.documentElement).appendChild(host);

      var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      var timers = [];
      var frames = [];
      var petW = host.offsetWidth || DEFAULT_SIZE;
      var petH = Math.round(petW * 1.02);
      var maxX = function () { return Math.max(MARGIN, window.innerWidth - petW - MARGIN); };
      var maxY = function () { return Math.max(MARGIN, window.innerHeight - petH - MARGIN); };

      var state = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        facing: 1,
        mode: 'idle',
        sleeping: false,
        affinity: 0,
        silent: 0,
      };

      var drag = null;
      var justDragged = false;
      var idleTimer = null;
      var bubbleTimer = null;
      var zzzTimer = null;
      var introTimer = null;
      var rafId = null;
      var trailAt = 0;

      function later(fn, ms) {
        var id = window.setTimeout(fn, ms);
        timers.push(id);
        return id;
      }

      function stopMotion() {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }

      function applyPos() {
        host.style.setProperty('--pet-x', Math.round(state.x) + 'px');
        host.style.setProperty('--pet-y', Math.round(state.y) + 'px');
      }

      function applyFacing() {
        host.style.setProperty('--pet-face', state.facing >= 0 ? '1' : '-1');
      }

      function persistPos() {
        var rx = maxX() > MARGIN ? clamp((state.x - MARGIN) / (maxX() - MARGIN), 0, 1) : 0.5;
        var ry = maxY() > MARGIN ? clamp((state.y - MARGIN) / (maxY() - MARGIN), 0, 1) : 0.5;
        storage.set(STORE_POS, rx.toFixed(4) + ',' + ry.toFixed(4));
      }

      function persistAffinity() {
        storage.set(STORE_AFF, String(state.affinity));
      }

      function showBubble(text, ms) {
        if (!text) return;
        bubble.textContent = text;
        var width = bubble.offsetWidth || 180;
        var center = state.x + petW / 2;
        var shift = 0;
        if (center - width / 2 < MARGIN) shift = MARGIN - (center - width / 2);
        else if (center + width / 2 > window.innerWidth - MARGIN) shift = window.innerWidth - MARGIN - (center + width / 2);
        bubble.style.setProperty('--bubble-shift', Math.round(shift) + 'px');
        bubble.style.setProperty('--bubble-rot', rand(-1.6, 1.6).toFixed(2) + 'deg');
        bubble.classList.remove('is-visible');
        void bubble.offsetWidth;
        bubble.classList.add('is-visible');
        if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
        bubbleTimer = later(function () { bubble.classList.remove('is-visible'); }, ms || 3600);
      }

      function replay(name, ms) {
        host.classList.remove(name);
        void host.offsetWidth;
        host.classList.add(name);
        later(function () { host.classList.remove(name); }, ms);
      }

      function spawnFx(glyph, color) {
        var item = document.createElement('span');
        item.className = 'pet-fx-item';
        item.textContent = glyph;
        if (color) item.style.setProperty('color', color);
        item.style.setProperty('--fx-x', Math.round(rand(-50, 50)) + 'px');
        item.style.setProperty('--fx-y', Math.round(rand(-90, -45)) + 'px');
        item.style.setProperty('font-size', Math.round(rand(12, 19)) + 'px');
        fx.appendChild(item);
        later(function () {
          if (item.parentNode) item.parentNode.removeChild(item);
        }, 1300);
      }

      function scheduleIdle(delay) {
        if (idleTimer !== null) window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(idleTick, delay !== undefined ? delay : rand(2200, 5200));
        timers.push(idleTimer);
      }

      function flyTo(tx, ty, duration) {
        if (state.sleeping) return;
        stopMotion();
        state.mode = 'fly';
        host.classList.add('is-flying');
        var sx = state.x;
        var sy = state.y;
        var t0 = now();
        var dist = Math.hypot(tx - sx, ty - sy);
        var ms = duration !== undefined ? duration : clamp(320 + dist * 5, 420, 2200);
        if (reduced) ms *= 1.4;
        state.facing = tx >= sx ? 1 : -1;
        applyFacing();
        trailAt = 0;
        function step(t) {
          var k = clamp((t - t0) / ms, 0, 1);
          var e = easeInOut(k);
          state.x = sx + (tx - sx) * e;
          state.y = sy + (ty - sy) * e;
          host.style.setProperty('--pet-tilt', (Math.sin(Math.PI * k) * state.facing * 6).toFixed(1) + 'deg');
          applyPos();
          if (t - trailAt > 420 && k < 0.9) {
            trailAt = t;
            spawnFx('✦', '#E9D5FF');
          }
          if (k < 1 && state.mode === 'fly') {
            rafId = window.requestAnimationFrame(step);
          } else if (state.mode === 'fly') {
            state.mode = 'idle';
            host.classList.remove('is-flying');
            host.style.setProperty('--pet-tilt', '0deg');
            spawnFx('✧', '#F9A8D4');
            persistPos();
            scheduleIdle();
          }
        }
        rafId = window.requestAnimationFrame(step);
      }

      function glide(vx, vy) {
        stopMotion();
        state.mode = 'glide';
        host.classList.add('is-gliding');
        var last = now();
        function step(t) {
          var dt = Math.min(0.05, (t - last) / 1000);
          last = t;
          var decay = Math.exp(-FRICTION * dt);
          vx *= decay;
          vy *= decay;
          state.x += vx * dt;
          state.y += vy * dt;
          if (state.x < MARGIN) { state.x = MARGIN; vx = -vx * BOUNCE; }
          if (state.x > maxX()) { state.x = maxX(); vx = -vx * BOUNCE; }
          if (state.y < MARGIN) { state.y = MARGIN; vy = -vy * BOUNCE; }
          if (state.y > maxY()) { state.y = maxY(); vy = -vy * BOUNCE; }
          applyPos();
          if (Math.hypot(vx, vy) > 24 && state.mode === 'glide') {
            rafId = window.requestAnimationFrame(step);
          } else {
            state.mode = 'idle';
            host.classList.remove('is-gliding');
            persistPos();
            scheduleIdle();
          }
        }
        rafId = window.requestAnimationFrame(step);
      }

      function idleTick() {
        idleTimer = null;
        if (state.sleeping) {
          scheduleIdle(rand(3200, 5200));
          return;
        }
        if (state.mode !== 'idle') {
          scheduleIdle(900);
          return;
        }
        state.silent += 1;
        if (state.silent >= 9) {
          sleep();
          scheduleIdle(rand(4000, 7000));
          return;
        }
        var roll = Math.random();
        if (roll < 0.5) {
          flyTo(rand(MARGIN, maxX()), rand(MARGIN, maxY()));
        } else if (roll < 0.62) {
          spin();
        } else if (roll < 0.74) {
          replay('is-happy', 760);
        } else if (roll < 0.86) {
          showBubble(pickLine(LINES.lonely), 3200);
        } else {
          flyTo(rand(MARGIN, maxX()), rand(MARGIN, Math.max(MARGIN, maxY() * 0.45)));
        }
        scheduleIdle();
      }

      function bumpAffinity() {
        state.affinity += 1;
        persistAffinity();
        return state.affinity;
      }

      function petMe() {
        if (state.sleeping) wakeUp();
        state.silent = 0;
        replay('is-happy', 780);
        spawnFx('♥', '#FB7185');
        spawnFx('♥', '#FB7185');
        spawnFx('♥', '#FB7185');
        spawnFx('✨', '#FDE68A');
        var pool = state.affinity >= 10 ? LINES.pet.concat(LINES.petClose) : LINES.pet;
        showBubble(pickLine(pool));
        var next = bumpAffinity();
        var milestone = LINES.milestone[String(next)];
        if (milestone) {
          later(function () {
            if (!state.sleeping) {
              showBubble(milestone, 4400);
              spawnFx('✦', '#FDE68A');
            }
          }, 900);
        }
        scheduleIdle();
      }

      function spin() {
        if (state.sleeping) return;
        replay('is-spin', 880);
        spawnFx('✦', '#C084FC');
        showBubble(pickLine(LINES.spin));
      }

      function startZzz() {
        if (zzzTimer !== null) return;
        var tick = function () {
          if (!state.sleeping) {
            zzzTimer = null;
            return;
          }
          spawnFx('Z', '#E9D5FF');
          zzzTimer = window.setTimeout(tick, 1200);
          timers.push(zzzTimer);
        };
        zzzTimer = window.setTimeout(tick, 500);
        timers.push(zzzTimer);
      }

      function sleep() {
        if (state.sleeping) return;
        state.sleeping = true;
        state.mode = 'idle';
        stopMotion();
        host.classList.remove('is-flying');
        host.classList.add('is-sleep');
        showBubble(pickLine(LINES.sleep), 2600);
        startZzz();
      }

      function wakeUp() {
        if (!state.sleeping) return;
        state.sleeping = false;
        host.classList.remove('is-sleep');
        if (zzzTimer !== null) {
          window.clearTimeout(zzzTimer);
          zzzTimer = null;
        }
        showBubble(pickLine(LINES.wake));
        state.silent = 0;
      }

      function toggleSleep() {
        if (state.sleeping) wakeUp();
        else sleep();
      }

      function greetingPool() {
        var hour = new Date().getHours();
        if (hour < 6) return LINES.hello.night;
        if (hour < 11) return LINES.hello.morning;
        if (hour < 14) return LINES.hello.noon;
        if (hour < 18) return LINES.hello.afternoon;
        if (hour < 22) return LINES.hello.evening;
        return LINES.hello.night;
      }

      // restore saved position / affinity
      var saved = storage.get(STORE_POS);
      var savedAffinity = parseInt(storage.get(STORE_AFF) || '0', 10);
      var startX = maxX() - 20;
      var startY = clamp(window.innerHeight * 0.58, MARGIN, maxY());
      if (saved) {
        var parts = saved.split(',');
        var rx = parseFloat(parts[0]);
        var ry = parseFloat(parts[1]);
        if (isFinite(rx)) startX = MARGIN + clamp(rx, 0, 1) * (maxX() - MARGIN);
        if (isFinite(ry)) startY = MARGIN + clamp(ry, 0, 1) * (maxY() - MARGIN);
      }
      state.x = startX;
      state.y = startY;
      state.affinity = Number.isFinite(savedAffinity) && savedAffinity > 0 ? savedAffinity : 0;
      applyPos();
      applyFacing();

      function pointerOffset(event) {
        return { dx: (event.clientX || 0) - state.x, dy: (event.clientY || 0) - state.y };
      }

      function onPointerDown(event) {
        if (event.target && event.target.closest && event.target.closest('.pet-act')) return;
        if (event.button !== undefined && event.button !== 0) return;
        if (event.preventDefault) event.preventDefault();
        if (state.sleeping) wakeUp();
        state.mode = 'drag';
        state.silent = 0;
        stopMotion();
        host.classList.add('is-drag');
        var offset = pointerOffset(event);
        drag = {
          offsetX: offset.dx,
          offsetY: offset.dy,
          lastX: event.clientX || 0,
          lastY: event.clientY || 0,
          lastT: now(),
          vx: 0,
          vy: 0,
          moved: false,
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      }

      function onPointerMove(event) {
        if (!drag) return;
        var x = clamp((event.clientX || 0) - drag.offsetX, MARGIN, maxX());
        var y = clamp((event.clientY || 0) - drag.offsetY, MARGIN, maxY());
        var t = now();
        var dt = Math.max(1, t - drag.lastT);
        drag.vx = (x - state.x) / dt;
        drag.vy = (y - state.y) / dt;
        drag.lastT = t;
        drag.lastX = x;
        drag.lastY = y;
        if (Math.abs(x - state.x) + Math.abs(y - state.y) > 2) drag.moved = true;
        state.x = x;
        state.y = y;
        applyPos();
        if (drag.moved && Math.random() < 0.06) spawnFx('·', '#B8A5D0');
      }

      function onPointerUp() {
        if (!drag) return;
        var moved = drag.moved;
        var vx = drag.vx * 1000 * 0.55;
        var vy = drag.vy * 1000 * 0.55;
        drag = null;
        state.mode = 'idle';
        host.classList.remove('is-drag');
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        if (moved) {
          justDragged = true;
          later(function () { justDragged = false; }, 90);
          glide(vx, vy);
          if (Math.random() < 0.5) later(function () { showBubble(pickLine(LINES.drop), 2200); }, 420);
        } else {
          persistPos();
        }
        scheduleIdle();
      }

      function onClick(event) {
        if (justDragged) return;
        if (event && event.detail > 1) return;
        petMe();
      }

      function onDoubleClick(event) {
        if (event && event.preventDefault) event.preventDefault();
        spin();
      }

      function onContextMenu(event) {
        if (event && event.preventDefault) event.preventDefault();
        toggleSleep();
      }

      function showHover() {
        host.classList.add('is-hover');
      }

      function hideHover() {
        later(function () { host.classList.remove('is-hover'); }, 260);
      }

      function onResize() {
        petW = host.offsetWidth || petW;
        petH = Math.round(petW * 1.02);
        state.x = clamp(state.x, MARGIN, maxX());
        state.y = clamp(state.y, MARGIN, maxY());
        applyPos();
        persistPos();
      }

      button.addEventListener('pointerdown', onPointerDown);
      button.addEventListener('click', onClick);
      button.addEventListener('dblclick', onDoubleClick);
      button.addEventListener('contextmenu', onContextMenu);
      button.addEventListener('pointerenter', showHover);
      button.addEventListener('pointerleave', hideHover);
      heartBtn.addEventListener('pointerenter', showHover);
      flyBtn.addEventListener('pointerenter', showHover);
      sleepBtn.addEventListener('pointerenter', showHover);
      heartBtn.addEventListener('pointerleave', hideHover);
      flyBtn.addEventListener('pointerleave', hideHover);
      sleepBtn.addEventListener('pointerleave', hideHover);
      heartBtn.addEventListener('click', function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        petMe();
      });
      flyBtn.addEventListener('click', function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        if (state.sleeping) wakeUp();
        flyTo(rand(MARGIN, maxX()), rand(MARGIN, maxY()));
        showBubble(pickLine(LINES.walkAway), 1800);
      });
      sleepBtn.addEventListener('click', function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        toggleSleep();
      });
      window.addEventListener('resize', onResize);

      // fly in from the right edge, then say hi
      introTimer = later(function () {
        if (state.sleeping) return;
        flyTo(clamp(window.innerWidth * 0.62, MARGIN, maxX()), clamp(window.innerHeight * 0.46, MARGIN, maxY()), 1600);
        later(function () {
          if (state.affinity === 0) showBubble(LINES.firstMeet[0], 4200);
          else showBubble(pickLine(greetingPool()), 4200);
        }, 1500);
      }, 500);
      scheduleIdle(rand(3000, 5000));

      return function () {
        var i;
        for (i = 0; i < timers.length; i++) window.clearTimeout(timers[i]);
        timers.length = 0;
        if (idleTimer !== null) window.clearTimeout(idleTimer);
        if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
        if (zzzTimer !== null) window.clearTimeout(zzzTimer);
        if (introTimer !== null) window.clearTimeout(introTimer);
        stopMotion();
        button.removeEventListener('pointerdown', onPointerDown);
        button.removeEventListener('click', onClick);
        button.removeEventListener('dblclick', onDoubleClick);
        button.removeEventListener('contextmenu', onContextMenu);
        button.removeEventListener('pointerenter', showHover);
        button.removeEventListener('pointerleave', hideHover);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        host.remove();
      };
    }

    function apply(ctx) {
      var style = document.createElement('style');
      style.id = 'dsh-clove-pet-css';
      style.setAttribute('data-plugin', 'dsh-pet-clove');
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
      ctx.effect(function () { return function () { style.remove(); }; });

      ctx.effect(function () { return mountPet(); });
      console.log('[clove-pet] browser half active');
    }

    exports.inject = [];
    exports.apply = apply;
    exports._debug = { lines: LINES, css: CSS };
    return module.exports;
  },
});
