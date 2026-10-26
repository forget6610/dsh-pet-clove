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
    var STORE_PIN = 'dsh-clove-pet:pinned:v1';
    var STORE_CARE = 'dsh-clove-pet:care:v1';
    var STORE_PANEL = 'dsh-clove-pet:panel:v1';
    var STORE_HIDDEN = 'dsh-clove-pet:hidden:v1';
    var STORE_WORKER = 'dsh-clove-pet:worker:v1';
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

    var SHOP_ITEMS = [
      { id: 'candy', name: '蝴蝶糖', kind: 'food', price: 8, hunger: 10, happy: 2, xp: 4, desc: '甜得发腻的小糖，暮蝶说勉强能吃。' },
      { id: 'chips', name: '海盐薯片', kind: 'food', price: 14, hunger: 16, thirst: -3, happy: 6, xp: 6, desc: '咔嚓咔嚓，越吃越渴。' },
      { id: 'popcorn', name: '焦糖爆米花', kind: 'food', price: 16, hunger: 12, happy: 8, xp: 6, desc: '看戏的时候来一桶，虽然她不爱看戏。' },
      { id: 'pudding', name: '蝴蝶布丁', kind: 'food', price: 18, hunger: 14, happy: 6, xp: 8, desc: '晃一晃会抖，她说这个手感像烟雾。' },
      { id: 'croissant', name: '双倍奶油可颂', kind: 'food', price: 22, hunger: 20, happy: 5, xp: 9, desc: '咬一口掉一桌渣，苏格兰人诚不我欺。' },
      { id: 'biscuit', name: '苏格兰小饼干', kind: 'food', price: 24, hunger: 26, happy: 4, xp: 12, desc: '她说这和老家下午茶一个味。' },
      { id: 'scotch_egg', name: '苏格兰蛋', kind: 'food', price: 32, minLevel: 2, hunger: 30, happy: 6, xp: 15, desc: '外面一圈酥皮，里面是完整的蛋黄。' },
      { id: 'salmon', name: '烟熏三文鱼', kind: 'food', price: 46, minLevel: 3, hunger: 34, happy: 12, xp: 20, desc: '配着面包吃，她说这叫体面。' },
      { id: 'berry', name: '永生浆果', kind: 'food', price: 60, minLevel: 2, hunger: 40, happy: 10, xp: 25, desc: '稀有货，吃完感觉自己也能永生。' },
      { id: 'cake', name: '永生小蛋糕', kind: 'food', price: 70, minLevel: 3, hunger: 45, happy: 16, xp: 30, desc: '奶油足量，插着的蜡烛永远不会灭。' },
      { id: 'soda', name: '气泡水', kind: 'drink', price: 10, thirst: 20, xp: 4, desc: '最朴素的解渴办法。' },
      { id: 'americano', name: '冰美式', kind: 'drink', price: 18, thirst: 22, happy: 3, xp: 7, desc: '清醒一点，才能继续放烟。' },
      { id: 'blue', name: '蓝莓苏打', kind: 'drink', price: 20, thirst: 28, happy: 4, xp: 8, desc: '蓝色，和她的头发很配。' },
      { id: 'honey_tea', name: '蜂蜜柚子茶', kind: 'drink', price: 24, thirst: 26, happy: 8, xp: 10, desc: '天冷的时候她会主动要这个。' },
      { id: 'cocoa', name: '热可可', kind: 'drink', price: 26, thirst: 24, hunger: 6, happy: 10, xp: 12, desc: '加了棉花糖，她说这是小孩子喝的。' },
      { id: 'tea', name: '蝴蝶花茶', kind: 'drink', price: 28, thirst: 32, happy: 8, xp: 12, desc: '据说泡开时像一群蝴蝶在飞。' },
      { id: 'butterfly_soda', name: '蝶豆花气泡', kind: 'drink', price: 30, thirst: 34, happy: 6, xp: 14, desc: '倒进杯子里会变色，很花哨。' },
      { id: 'latte', name: '烟雾玛奇朵', kind: 'drink', price: 30, thirst: 26, hunger: 4, happy: 6, xp: 14, desc: '奶泡打得像她放的烟。' },
      { id: 'oolong', name: '冰雾乌龙', kind: 'drink', price: 36, thirst: 40, happy: 4, xp: 16, desc: '一口下去，脑子里的雾散了。' },
      { id: 'puzzle', name: '烟雾拼图', kind: 'toy', price: 90, happy: 12, xp: 8, playHappy: 5, playXp: 5, cooldownMin: 8, desc: '拼到最后一块总是找不到。' },
      { id: 'plush', name: '毛绒蝴蝶', kind: 'toy', price: 120, happy: 18, xp: 10, playHappy: 6, playXp: 4, cooldownMin: 6, desc: '抱着睡觉刚刚好。' },
      { id: 'kitten', name: '猫咪玩偶', kind: 'toy', price: 130, happy: 20, xp: 12, playHappy: 6, playXp: 4, cooldownMin: 6, desc: '她说玩偶比真的猫好打理。' },
      { id: 'kite', name: '蝴蝶风筝', kind: 'toy', price: 150, happy: 20, xp: 16, playHappy: 8, playXp: 6, cooldownMin: 7, desc: '起风的时候可以假装自己在飞。' },
      { id: 'lamp', name: '星云投影灯', kind: 'toy', price: 180, happy: 24, xp: 18, playHappy: 7, playXp: 5, cooldownMin: 7, desc: '关灯以后，房间像宇宙。' },
      { id: 'handheld', name: '星光掌机', kind: 'toy', price: 260, happy: 30, xp: 40, playHappy: 10, playXp: 8, cooldownMin: 10, desc: '便携的快乐，火车上也能玩。' },
      { id: 'console', name: '客厅主机', kind: 'toy', price: 420, minLevel: 4, happy: 45, xp: 70, playHappy: 12, playXp: 10, cooldownMin: 12, desc: '要接电视的那种，她说放烟雾里刚好。' },
      { id: 'arcade', name: '迷你街机', kind: 'toy', price: 320, minLevel: 3, happy: 36, xp: 52, playHappy: 11, playXp: 9, cooldownMin: 11, desc: '摇杆咔咔响，她说这声音很解压。' },
      { id: 'bow', name: '蝴蝶结', kind: 'accessory', price: 140, happy: 6, xp: 18, desc: '随手别在头上，意外的合适。' },
      { id: 'halo', name: '蝶翼光环', kind: 'accessory', price: 160, happy: 8, xp: 20, desc: '一圈会转的淡紫色光。' },
      { id: 'crown', name: '小皇冠', kind: 'accessory', price: 220, minLevel: 2, happy: 10, xp: 25, desc: '永生者也想要个体面。' },
    ];

    var CARE_LINES = {
      eat: ['谢谢，还凑合。', '就这？……好吧，谢谢。', '味道不错，再买一份。', '你居然记得我喜欢什么。', '蝴蝶也得吃饭的。'],
      drink: ['解渴了。', '这杯还行。', '再来一杯也不介意。', '你是不是在讨好我？'],
      hungry: ['肚子在叫了，给我买点吃的吧。', '有点渴，想喝东西。', '饿着肚子的蝴蝶飞不动。', '再不理我，我就要饿死了……大概。'],
      play: ['这个我能玩一整天。', '陪我再玩一局。', '你买这个干嘛？……谢了。', '别抢，是我的。'],
      broke: ['金币不够，再去跑几个任务吧。', '穷成这样还想养我？'],
      sign: ['上线打卡，钱到账了。', '今天也没白来。'],
      level: ['升级了？看来没白吃你的东西。', '又长大了一点，虽然我不承认。'],
    };

    function xpForLevel(n) {
      if (n <= 1) return 0;
      return Math.round(80 * Math.pow(n - 1, 1.45));
    }

    function levelFromXp(xp) {
      var level = 1;
      while (level < 30 && xp >= xpForLevel(level + 1)) level += 1;
      return level;
    }

    var TITLES = ['初来乍到', '烟雾新人', '蝴蝶常客', '永生之友', '爱丁堡晚风', '暮色主人', '蝴蝶女王'];

    function titleFor(level) {
      return TITLES[Math.min(TITLES.length - 1, Math.max(0, level - 1))];
    }

    var DAILY_TASKS = [
      { id: 'sign', name: '上线签到', target: 1, coins: 20, xp: 10 },
      { id: 'feed', name: '喂食 2 次', target: 2, coins: 20, xp: 10 },
      { id: 'play', name: '陪玩 1 次', target: 1, coins: 25, xp: 15 },
      { id: 'pet', name: '摸摸 5 下', target: 5, coins: 20, xp: 10 },
    ];

    var ACHIEVEMENTS = [
      { id: 'first_pet', name: '第一次摸头', coins: 20, xp: 10, check: function (s) { return s.pet >= 1; } },
      { id: 'pet_10', name: '手痒', coins: 40, xp: 20, check: function (s) { return s.pet >= 10; } },
      { id: 'feed_5', name: '投喂熟练工', coins: 40, xp: 20, check: function (s) { return s.feed >= 5; } },
      { id: 'play_3', name: '玩伴', coins: 40, xp: 20, check: function (s) { return s.play >= 3; } },
      { id: 'toys_3', name: '收藏家', coins: 60, xp: 30, check: function (s) { return s.toys >= 3; } },
      { id: 'level_3', name: '蝴蝶常客', coins: 80, xp: 0, check: function (s) { return s.level >= 3; } },
      { id: 'buy_10', name: '花钱如流水', coins: 60, xp: 30, check: function (s) { return s.buy >= 10; } },
      { id: 'task_240', name: '今日劳模', coins: 60, xp: 30, check: function (s) { return s.task >= 240; } },
    ];

    var LEVEL_LINES = {
      3: ['混熟了，我就不装凶了。', '你现在算半个自己人了。'],
      5: ['你陪我挺久了，我记着。', '烟雾散之前，别走太远。'],
      8: ['永生很无聊，还好有你。', '下次也记得来看我。'],
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
  background: radial-gradient(closest-side, rgba(192, 132, 252, 0.26), rgba(244, 114, 182, 0.11) 46%, rgba(244, 114, 182, 0) 74%);
  filter: blur(16px);
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

.dsh-clove-pet .pet-bubble.is-below {
  bottom: auto;
  top: calc(100% - 2px);
  transform: translate(calc(-50% + var(--bubble-shift, 0px)), -6px) rotate(var(--bubble-rot, -1.2deg)) scale(0.92);
  transform-origin: 50% 0;
}
.dsh-clove-pet .pet-bubble.is-below.is-visible { transform: translate(calc(-50% + var(--bubble-shift, 0px)), 0) rotate(var(--bubble-rot, -1.2deg)) scale(1); }
.dsh-clove-pet .pet-bubble.is-below::after {
  top: -7px;
  bottom: auto;
  border-right: 0;
  border-bottom: 0;
  border-left: 1.5px solid rgba(244, 114, 182, 0.55);
  border-top: 1.5px solid rgba(244, 114, 182, 0.55);
}

.dsh-clove-pet .pet-actions {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 10px);
  padding: 0 0 18px;
  transform: translateX(-50%) translateY(6px);
  display: flex;
  gap: 7px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.dsh-clove-pet.is-hover .pet-actions { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
.dsh-clove-pet .pet-act {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 15px;
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
.dsh-clove-pet .pet-act.is-active { background: rgba(244, 114, 182, 0.42); border-color: rgba(249, 168, 212, 0.85); box-shadow: 0 0 0 2px rgba(244, 114, 182, 0.22), 0 4px 14px rgba(0, 0, 0, 0.4); }

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
@keyframes pet-glow { 0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.96); } 50% { opacity: 0.72; transform: translate(-50%, -50%) scale(1.05); } }
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

    var PANEL_CSS = `
.dsh-clove-panel {
  position: fixed;
  top: 72px;
  right: 24px;
  width: 300px;
  max-height: calc(100vh - 96px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(160deg, #24103a 0%, #140a22 100%);
  border: 1.5px solid rgba(244, 114, 182, 0.42);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(10, 5, 18, 0.9);
  color: #FDF2F8;
  font-size: 12.5px;
  pointer-events: auto;
}

.dsh-clove-panel .pet-panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(244, 114, 182, 0.10);
  border-bottom: 1px solid rgba(244, 114, 182, 0.18);
}
.dsh-clove-panel .pet-panel-title { flex: 1; font-weight: 600; letter-spacing: 0.02em; }
.dsh-clove-panel .pet-panel-coins { color: #FDE68A; font-variant-numeric: tabular-nums; }
.dsh-clove-panel .pet-panel-close {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #FDF2F8;
  cursor: pointer;
  line-height: 1;
}
.dsh-clove-panel .pet-panel-close:hover { background: rgba(244, 114, 182, 0.35); }

.dsh-clove-panel .pet-panel-tabs { display: flex; gap: 6px; padding: 10px 12px 6px; }
.dsh-clove-panel .pet-panel-tab {
  flex: 1;
  padding: 6px 0;
  border-radius: 10px;
  border: 1px solid rgba(244, 114, 182, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: #E9D5FF;
  font-size: 12px;
  cursor: pointer;
}
.dsh-clove-panel .pet-panel-tab.is-active {
  background: rgba(244, 114, 182, 0.28);
  border-color: rgba(249, 168, 212, 0.7);
  color: #FDF2F8;
}

.dsh-clove-panel .pet-panel-body { padding: 4px 12px 12px; overflow-y: auto; }
.dsh-clove-panel .pet-panel-section { margin-top: 10px; }
.dsh-clove-panel .pet-panel-hint { color: #B8A5D0; font-size: 11px; line-height: 1.6; margin-top: 6px; }
.dsh-clove-panel .pet-panel-note { color: #F9A8D4; font-size: 11.5px; margin-top: 8px; }
.dsh-clove-panel .pet-quick-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }

.dsh-clove-panel .pet-level-line { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; }
.dsh-clove-panel .pet-level { font-weight: 700; color: #FDE68A; }
.dsh-clove-panel .pet-xp-text { color: #B8A5D0; font-size: 11px; margin-left: auto; font-variant-numeric: tabular-nums; }

.dsh-clove-panel .pet-bar-row { margin-top: 8px; }
.dsh-clove-panel .pet-bar-label { display: flex; justify-content: space-between; color: #E9D5FF; font-size: 11.5px; margin-bottom: 4px; }
.dsh-clove-panel .pet-bar-label .pet-bar-value { color: #FDF2F8; font-variant-numeric: tabular-nums; }
.dsh-clove-panel .pet-bar {
  height: 8px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.10);
  overflow: hidden;
}
.dsh-clove-panel .pet-bar-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #F472B6, #8B5CF6); }
.dsh-clove-panel .pet-bar-fill.is-hunger { background: linear-gradient(90deg, #FBBF24, #F472B6); }
.dsh-clove-panel .pet-bar-fill.is-thirst { background: linear-gradient(90deg, #38BDF8, #818CF8); }
.dsh-clove-panel .pet-bar-fill.is-happy { background: linear-gradient(90deg, #FB7185, #F9A8D4); }
.dsh-clove-panel .pet-bar-fill.is-xp { background: linear-gradient(90deg, #FDE68A, #F472B6); }

.dsh-clove-panel .pet-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  margin-top: 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(244, 114, 182, 0.12);
}
.dsh-clove-panel .pet-row-main { flex: 1; min-width: 0; }
.dsh-clove-panel .pet-row-name { color: #FDF2F8; }
.dsh-clove-panel .pet-row-desc { color: #B8A5D0; font-size: 10.5px; line-height: 1.5; margin-top: 2px; }
.dsh-clove-panel .pet-row-meta { color: #FDE68A; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dsh-clove-panel .pet-btn-small {
  padding: 4px 10px;
  border-radius: 9px;
  border: 1px solid rgba(244, 114, 182, 0.45);
  background: rgba(244, 114, 182, 0.22);
  color: #FDF2F8;
  font-size: 11.5px;
  cursor: pointer;
  white-space: nowrap;
}
.dsh-clove-panel .pet-btn-small:hover { background: rgba(244, 114, 182, 0.4); }
.dsh-clove-panel .pet-btn-small[disabled] { opacity: 0.4; cursor: default; }

@media (max-width: 900px) {
  .dsh-clove-panel { display: none; }
}

.dsh-clove-pet .pet-title { color: #F9A8D4; font-size: 11px; border: 1px solid rgba(244, 114, 182, 0.35); border-radius: 7px; padding: 1px 6px; }
.dsh-clove-panel .pet-panel-title { cursor: grab; user-select: none; -webkit-user-select: none; }
.dsh-clove-panel .pet-panel-title:active { cursor: grabbing; }

.dsh-clove-pet .pet-deco { position: absolute; pointer-events: none; z-index: 2; }
.dsh-clove-pet .pet-deco-crown { left: 50%; top: -14px; transform: translateX(-50%) rotate(-8deg); font-size: 26px; line-height: 1; }
.dsh-clove-pet .pet-deco-bow { right: 12%; top: 6%; transform: rotate(14deg); font-size: 22px; line-height: 1; }
.dsh-clove-pet .pet-deco-halo {
  left: 50%;
  top: 52%;
  width: 118%;
  height: 118%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px dashed rgba(216, 180, 254, 0.75);
  box-shadow: 0 0 18px rgba(192, 132, 252, 0.5);
  animation: pet-halo 9s linear infinite;
}
@keyframes pet-halo { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

.dsh-clove-show {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1001;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid rgba(244, 114, 182, 0.4);
  background: rgba(24, 12, 40, 0.92);
  color: #FDF2F8;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.4);
}
.dsh-clove-show:hover { background: rgba(244, 114, 182, 0.3); }

.dsh-clove-game {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 26px 24px 24px;
  color: #FDF2F8;
  background: radial-gradient(circle at 50% 38%, rgba(44, 20, 66, 0.9), rgba(10, 5, 18, 0.94));
}
.dsh-clove-game .pet-game-head { display: flex; align-items: center; gap: 16px; }
.dsh-clove-game .pet-game-score { font-weight: 700; color: #FDE68A; font-size: 16px; font-variant-numeric: tabular-nums; }
.dsh-clove-game .pet-game-tip { color: #E9D5FF; font-size: 12px; margin-top: 8px; }
.dsh-clove-game .pet-game-field { position: relative; flex: 1; width: 100%; margin-top: 14px; }
.dsh-clove-game .pet-game-butterfly {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 0;
  background: none;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  animation: pet-bf 2.6s ease-in-out infinite;
  -webkit-tap-highlight-color: transparent;
}
@keyframes pet-bf {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-14px) rotate(6deg); }
}
`;

    var ALL_CSS = CSS + PANEL_CSS;

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

      var pinBtn = document.createElement('button');
      pinBtn.className = 'pet-act pet-act-pin';
      pinBtn.setAttribute('type', 'button');
      pinBtn.setAttribute('title', '固定在这个位置');
      pinBtn.textContent = '📌';

      var panelBtn = document.createElement('button');
      panelBtn.className = 'pet-act pet-act-panel';
      panelBtn.setAttribute('type', 'button');
      panelBtn.setAttribute('title', '小暮蝶的日常面板');
      panelBtn.textContent = '📋';

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
      actions.appendChild(pinBtn);
      actions.appendChild(panelBtn);
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
        pinned: false,
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
        var id = window.setTimeout(function () {
          var index = timers.indexOf(id);
          if (index >= 0) timers.splice(index, 1);
          fn();
        }, ms);
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
        // bubble above the head normally, but flip below when the pet is near
        // the top edge so the text never gets clipped off-screen
        var bubbleHeight = bubble.offsetHeight || 60;
        if (state.y - MARGIN < bubbleHeight + 14) bubble.classList.add('is-below');
        else bubble.classList.remove('is-below');
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

      // ---------------- 养成：饥饿 / 口渴 / 心情 / 经验 / 金币 / 商店 ----------------

      var care = defaultCare();
      var careTimer = null;
      var panel = null;
      var panelOpen = false;
      var panelTab = 'status';
      var panelCoins = null;
      var panelBody = null;
      var panelTabButtons = [];
      var panelDrag = null;
      var showChip = null;
      var game = null;
      var decoNodes = [];
      var windowId = 'w' + Math.random().toString(36).slice(2, 9);

      function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
      }

      function defaultCare() {
        return {
          coins: 120,
          xp: 0,
          hunger: 85,
          thirst: 85,
          happiness: 70,
          lastTick: Date.now(),
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
          petCount: 0,
          loginStreak: 0,
          gameBest: 0,
          gamePlays: 0,
          startedAt: Date.now(),
          daily: { day: '', counters: { sign: 0, feed: 0, play: 0, pet: 0 }, done: {} },
          achievements: [],
          accessories: [],
          activeAccessory: '',
        };
      }

      function mergeCare(target, source) {
        if (!source || typeof source !== 'object') return target;
        for (var key in target) {
          if (!Object.prototype.hasOwnProperty.call(target, key)) continue;
          if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
          var value = source[key];
          if (value === null || value === undefined) continue;
          if (key === 'daily') {
            if (typeof value === 'object') {
              var counters = value.counters && typeof value.counters === 'object' ? value.counters : {};
              target.daily = {
                day: typeof value.day === 'string' ? value.day : '',
                counters: {
                  sign: Number(counters.sign) || 0,
                  feed: Number(counters.feed) || 0,
                  play: Number(counters.play) || 0,
                  pet: Number(counters.pet) || 0,
                },
                done: value.done && typeof value.done === 'object' ? value.done : {},
              };
            }
          } else if (key === 'inventory' || key === 'toyCooldown') {
            if (typeof value === 'object' && !isArray(value)) target[key] = value;
          } else if (key === 'toys' || key === 'achievements' || key === 'accessories') {
            if (isArray(value)) target[key] = value.slice(0, 64);
          } else if (typeof value === 'number' && isFinite(value)) {
            target[key] = value;
          } else if (typeof value === 'string') {
            target[key] = value;
          }
        }
        return target;
      }

      function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      }

      function saveCare() {
        storage.set(STORE_CARE, JSON.stringify(care));
      }

      function loadCare() {
        var raw = storage.get(STORE_CARE);
        if (!raw) return;
        var saved = null;
        try {
          saved = JSON.parse(raw);
        } catch (err) {
          saved = null;
        }
        mergeCare(care, saved);
      }

      function clampCare(value) {
        return clamp(Number(value) || 0, 0, 100);
      }

      function applyDecay() {
        var nowMs = Date.now();
        var minutes = (nowMs - care.lastTick) / 60000;
        if (!isFinite(minutes) || minutes <= 0) {
          care.lastTick = nowMs;
          return;
        }
        if (minutes > 720) minutes = 720;
        care.hunger = clampCare(care.hunger - minutes / 25);
        care.thirst = clampCare(care.thirst - minutes / 20);
        care.happiness = clampCare(care.happiness - minutes / 40);
        care.lastTick = nowMs;
        saveCare();
      }

      function itemById(id) {
        for (var i = 0; i < SHOP_ITEMS.length; i++) {
          if (SHOP_ITEMS[i].id === id) return SHOP_ITEMS[i];
        }
        return null;
      }

      function gainXp(amount) {
        var before = levelFromXp(care.xp);
        care.xp = Math.max(0, Math.round(care.xp + Math.max(0, Number(amount) || 0)));
        var after = levelFromXp(care.xp);
        if (after > before) {
          care.hunger = clampCare(care.hunger + 10);
          care.thirst = clampCare(care.thirst + 10);
          state.silent = 0;
          replay('is-happy', 900);
          spawnFx('✦', '#FDE68A');
          showBubble(pickLine(CARE_LINES.level) + '（Lv.' + after + ' · ' + titleFor(after) + '）', 4400);
        }
        saveCare();
        checkAchievements();
      }

      function addCoins(amount) {
        care.coins = Math.max(0, Math.round(care.coins + (Number(amount) || 0)));
        saveCare();
      }

      function signInReward() {
        var streakBonus = Math.min(30, Math.max(0, (Number(care.loginStreak) || 0) - 1) * 5);
        return 80 + 10 * (levelFromXp(care.xp) - 1) + streakBonus;
      }

      function yesterdayKey() {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      }

      function signInPending() {
        return care.lastLogin !== todayKey();
      }

      function doSignIn() {
        if (!signInPending()) return 0;
        care.loginStreak = care.lastLogin === yesterdayKey() ? (Number(care.loginStreak) || 0) + 1 : 1;
        var reward = signInReward();
        addCoins(reward);
        care.xp += 20;
        care.lastLogin = todayKey();
        saveCare();
        bumpDaily('sign');
        later(function () {
          showBubble(pickLine(CARE_LINES.sign) + ' +' + reward + ' 金币（连续 ' + care.loginStreak + ' 天）', 3800);
          spawnFx('🪙', '#FDE68A');
        }, 2200);
        return reward;
      }

      function maybeTaskPay() {
        var key = todayKey();
        if (care.todayKey !== key) {
          care.todayKey = key;
          care.todayEarn = 0;
          care.lastTaskPay = Date.now();
          saveCare();
        }
        if (care.todayEarn >= 240) return;
        var minutes = (Date.now() - care.lastTaskPay) / 60000;
        if (!isFinite(minutes) || minutes < 10) return;
        var batches = Math.min(Math.floor(minutes / 10), Math.floor((240 - care.todayEarn) / 12));
        if (batches <= 0) return;
        care.coins += batches * 12;
        care.todayEarn += batches * 12;
        care.lastTaskPay = Date.now();
        saveCare();
        gainXp(batches * 6);
        showBubble('跑任务津贴 +' + batches * 12 + ' 金币 +' + batches * 6 + ' 经验', 2800);
        checkAchievements();
        if (panelOpen) renderPanel();
      }

      function buyItem(id) {
        var item = itemById(id);
        if (!item) return;
        if (item.minLevel && levelFromXp(care.xp) < item.minLevel) {
          showBubble('这个要 Lv.' + item.minLevel + ' 才卖给你。');
          return;
        }
        if (care.coins < item.price) {
          showBubble(pickLine(CARE_LINES.broke));
          return;
        }
        care.coins -= item.price;
        care.buyCount += 1;
        if (item.kind === 'toy') {
          if (care.toys.indexOf(id) < 0) care.toys.push(id);
        } else if (item.kind === 'accessory') {
          if (care.accessories.indexOf(id) < 0) care.accessories.push(id);
        } else {
          care.inventory[id] = (care.inventory[id] || 0) + 1;
        }
        state.silent = 0;
        showBubble('买好了：' + item.name);
        spawnFx('🪙', '#FDE68A');
        gainXp(5);
        saveCare();
        checkAchievements();
        renderPanel();
      }

      function useItem(id) {
        var item = itemById(id);
        if (!item || !care.inventory[id]) return;
        care.inventory[id] -= 1;
        if (care.inventory[id] <= 0) delete care.inventory[id];
        care.hunger = clampCare(care.hunger + (item.hunger || 0));
        care.thirst = clampCare(care.thirst + (item.thirst || 0));
        care.happiness = clampCare(care.happiness + (item.happy || 0));
        care.feedCount += 1;
        state.silent = 0;
        replay('is-happy', 780);
        spawnFx(item.kind === 'drink' ? '💧' : '♥', item.kind === 'drink' ? '#38BDF8' : '#FB7185');
        showBubble(pickLine(item.kind === 'drink' ? CARE_LINES.drink : CARE_LINES.eat));
        gainXp(item.xp || 2);
        saveCare();
        bumpDaily('feed');
        checkAchievements();
        renderPanel();
      }

      function playToy(id) {
        var item = itemById(id);
        if (!item || care.toys.indexOf(id) < 0) return;
        var nowMs = Date.now();
        var until = care.toyCooldown[id] || 0;
        if (nowMs < until) {
          showBubble('刚玩过，等会儿再玩。');
          return;
        }
        care.toyCooldown[id] = nowMs + (item.cooldownMin || 8) * 60000;
        care.happiness = clampCare(care.happiness + (item.playHappy || 6));
        care.playCount += 1;
        state.silent = 0;
        spin();
        spawnFx('✦', '#C084FC');
        showBubble(pickLine(CARE_LINES.play));
        gainXp(item.playXp || 4);
        saveCare();
        bumpDaily('play');
        checkAchievements();
        renderPanel();
      }

      // ---------------- 面板 UI ----------------

      function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
      }

      function clearNode(node) {
        while (node.children.length > 0) node.removeChild(node.children[0]);
      }

      function makeBar(className, value) {
        var track = el('div', 'pet-bar');
        var fill = el('div', 'pet-bar-fill ' + className);
        fill.style.width = Math.round(clampCare(value)) + '%';
        track.appendChild(fill);
        return track;
      }

      function makeRow(name, desc, metaText, buttonText, onButton, disabled) {
        var row = el('div', 'pet-row');
        var main = el('div', 'pet-row-main');
        main.appendChild(el('div', 'pet-row-name', name));
        if (desc) main.appendChild(el('div', 'pet-row-desc', desc));
        row.appendChild(main);
        if (metaText) row.appendChild(el('div', 'pet-row-meta', metaText));
        if (buttonText) {
          var btn = el('button', 'pet-btn-small', buttonText);
          btn.setAttribute('type', 'button');
          if (disabled) btn.setAttribute('disabled', 'disabled');
          btn.addEventListener('click', function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            onButton();
          });
          row.appendChild(btn);
        }
        return row;
      }

      function quickAction(label, handler) {
        var btn = el('button', 'pet-btn-small', label);
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', function (event) {
          if (event && event.stopPropagation) event.stopPropagation();
          handler();
        });
        return btn;
      }

      function renderStatus(body) {
        var level = levelFromXp(care.xp);
        var curXp = care.xp - xpForLevel(level);
        var nextXp = xpForLevel(level + 1) - xpForLevel(level);

        var levelLine = el('div', 'pet-level-line');
        levelLine.appendChild(el('span', 'pet-level', 'Lv.' + level));
        levelLine.appendChild(el('span', 'pet-title', titleFor(level)));
        levelLine.appendChild(el('span', 'pet-xp-text', curXp + ' / ' + nextXp + ' XP'));
        body.appendChild(levelLine);
        body.appendChild(makeBar('is-xp', nextXp > 0 ? (curXp / nextXp) * 100 : 100));
        body.appendChild(el('div', 'pet-panel-hint', '相识第 ' + daysTogether() + ' 天 · 连续签到 ' + (care.loginStreak || 0) + ' 天'));

        var stats = [
          { label: '饥饿度', value: care.hunger, cls: 'is-hunger' },
          { label: '口渴度', value: care.thirst, cls: 'is-thirst' },
          { label: '心情', value: care.happiness, cls: 'is-happy' },
        ];
        for (var i = 0; i < stats.length; i++) {
          var stat = stats[i];
          var row = el('div', 'pet-bar-row');
          var label = el('div', 'pet-bar-label');
          label.appendChild(el('span', '', stat.label));
          label.appendChild(el('span', 'pet-bar-value', Math.round(stat.value) + ' / 100'));
          row.appendChild(label);
          row.appendChild(makeBar(stat.cls, stat.value));
          body.appendChild(row);
        }

        body.appendChild(el('div', 'pet-panel-section', '快捷操作'));
        var quick = el('div', 'pet-quick-row');
        quick.appendChild(quickAction('摸摸', function () {
          petMe();
          renderPanel();
        }));
        quick.appendChild(quickAction('飞一下', function () {
          if (state.pinned) showBubble('被钉住了，飞不动。');
          else {
            flyTo(rand(MARGIN, maxX()), rand(MARGIN, maxY()));
            showBubble(pickLine(LINES.walkAway), 1800);
          }
          renderPanel();
        }));
        quick.appendChild(quickAction(state.pinned ? '恢复自由' : '固定', function () {
          togglePin();
          renderPanel();
        }));
        quick.appendChild(quickAction(state.sleeping ? '叫醒' : '睡觉', function () {
          toggleSleep();
          renderPanel();
        }));
        var hiddenNow = Date.now() < hiddenUntil();
        if (!hiddenNow) {
          quick.appendChild(quickAction('隐藏1小时', hideForHour));
          quick.appendChild(quickAction('明天见', hideForToday));
        }
        body.appendChild(quick);

        body.appendChild(el('div', 'pet-panel-section', '背包'));
        var usedBag = false;
        for (var id in care.inventory) {
          if (!Object.prototype.hasOwnProperty.call(care.inventory, id)) continue;
          var item = itemById(id);
          if (!item || !care.inventory[id]) continue;
          usedBag = true;
          (function (itemId, itemRef, count) {
            var effects = [];
            if (itemRef.hunger) effects.push('饱腹 +' + itemRef.hunger);
            if (itemRef.thirst) effects.push('解渴 +' + itemRef.thirst);
            if (itemRef.happy) effects.push('心情 +' + itemRef.happy);
            body.appendChild(makeRow(
              itemRef.name + ' ×' + count,
              effects.join(' · '),
              '',
              itemRef.kind === 'drink' ? '喝掉' : '吃掉',
              function () { useItem(itemId); }
            ));
          })(id, item, care.inventory[id]);
        }
        if (!usedBag) body.appendChild(el('div', 'pet-panel-hint', '背包是空的，去商店买点吃的。'));

        body.appendChild(el('div', 'pet-panel-section', '每日任务'));
        if (signInPending()) {
          body.appendChild(makeRow('上线打卡', '今天还没签到', '+' + signInReward() + ' 金币', '签到', function () {
            doSignIn();
            renderPanel();
          }));
        } else {
          body.appendChild(makeRow('上线打卡', '今日已签到 · 连续 ' + (care.loginStreak || 0) + ' 天', '', '已完成', null, false));
        }
        for (var t = 0; t < DAILY_TASKS.length; t++) {
          var task = DAILY_TASKS[t];
          var progress = Math.min(dailyCount(task.id), task.target);
          var taskDone = !!(care.daily && care.daily.done && care.daily.done[task.id]);
          body.appendChild(makeRow(
            task.name,
            '奖励 +' + task.coins + ' 金币 +' + task.xp + ' 经验',
            progress + ' / ' + task.target,
            taskDone ? '已完成' : '进行中',
            null,
            taskDone
          ));
        }
        body.appendChild(el('div', 'pet-panel-hint', '在线跑任务：每 10 分钟 +12 金币 +6 经验（今日金币已赚 ' + care.todayEarn + ' / 240）。'));

        body.appendChild(el('div', 'pet-panel-section', '成就 (' + care.achievements.length + ' / ' + ACHIEVEMENTS.length + ')'));
        for (var a = 0; a < ACHIEVEMENTS.length; a++) {
          var achievement = ACHIEVEMENTS[a];
          var unlocked = care.achievements.indexOf(achievement.id) >= 0;
          body.appendChild(makeRow(achievement.name, unlocked ? '已解锁 · +' + achievement.coins + ' 金币' : '未解锁', '', '', null, false));
        }

        body.appendChild(el('div', 'pet-panel-section', '存档'));
        var saveRow = el('div', 'pet-quick-row');
        saveRow.appendChild(quickAction('导出存档', exportSave));
        saveRow.appendChild(quickAction('导入存档', importSave));
        body.appendChild(saveRow);
        body.appendChild(el('div', 'pet-panel-hint', '存档在本机浏览器里，换机器或清缓存前记得导出一份。'));
      }

      function renderShop(body) {
        var kinds = ['food', 'drink', 'toy', 'accessory'];
        var titles = { food: '食物', drink: '饮品', toy: '玩具', accessory: '装饰' };
        var level = levelFromXp(care.xp);
        for (var k = 0; k < kinds.length; k++) {
          var kind = kinds[k];
          body.appendChild(el('div', 'pet-panel-section', titles[kind]));
          for (var i = 0; i < SHOP_ITEMS.length; i++) {
            var item = SHOP_ITEMS[i];
            if (item.kind !== kind) continue;
            var locked = !!(item.minLevel && level < item.minLevel);
            var owned = item.kind === 'toy' ? care.toys.indexOf(item.id) >= 0
              : item.kind === 'accessory' ? care.accessories.indexOf(item.id) >= 0
              : (care.inventory[item.id] || 0) > 0;
            (function (itemRef, ownedFlag, lockedFlag) {
              var meta = lockedFlag ? 'Lv.' + itemRef.minLevel + ' 解锁' : itemRef.price + ' 金币';
              var label = lockedFlag ? '未解锁' : ownedFlag ? '已拥有' : '购买';
              body.appendChild(makeRow(itemRef.name, itemRef.desc, meta, label, function () {
                buyItem(itemRef.id);
              }, lockedFlag || care.coins < itemRef.price));
            })(item, owned, locked);
          }
        }
      }

      function renderToys(body) {
        body.appendChild(el('div', 'pet-panel-section', '我的玩具'));
        if (care.toys.length === 0) {
          body.appendChild(el('div', 'pet-panel-hint', '还没有玩具，去商店看看（有掌机、主机和毛绒玩偶）。'));
        }
        for (var i = 0; i < care.toys.length; i++) {
          var item = itemById(care.toys[i]);
          if (!item) continue;
          (function (itemRef) {
            var remain = ((care.toyCooldown[itemRef.id] || 0) - Date.now()) / 60000;
            var ready = remain > 0 ? Math.ceil(remain) + ' 分钟后可玩' : '可以玩';
            body.appendChild(makeRow(itemRef.name, itemRef.desc, ready, '陪玩', function () {
              playToy(itemRef.id);
            }, remain > 0));
          })(item);
        }

        body.appendChild(el('div', 'pet-panel-section', '我的装饰'));
        if (care.accessories.length === 0) {
          body.appendChild(el('div', 'pet-panel-hint', '还没买装饰，去商店看看（蝴蝶结、光环、小皇冠）。'));
        }
        for (var a = 0; a < care.accessories.length; a++) {
          var accessory = itemById(care.accessories[a]);
          if (!accessory) continue;
          (function (itemRef) {
            var active = care.activeAccessory === itemRef.id;
            body.appendChild(makeRow(itemRef.name, itemRef.desc, active ? '使用中' : '', active ? '卸下' : '使用', function () {
              useAccessory(itemRef.id);
            }, false));
          })(accessory);
        }
      }

      function renderGame(body) {
        body.appendChild(el('div', 'pet-panel-section', '抓蝴蝶'));
        body.appendChild(el('div', 'pet-panel-hint', '30 秒内点掉飘过的蝴蝶，每只 3 金币 + 2 经验。'));
        var row = el('div', 'pet-quick-row');
        row.appendChild(quickAction('开始游戏', function () {
          startGame();
          renderPanel();
        }));
        body.appendChild(row);
        body.appendChild(el('div', 'pet-panel-section', '小游戏记录'));
        body.appendChild(el('div', 'pet-panel-hint', '最高分 ' + (care.gameBest || 0) + ' 只 · 玩过 ' + (care.gamePlays || 0) + ' 次'));
      }

      function renderPanel() {
        if (!panel || !panelBody) return;
        if (panelCoins) panelCoins.textContent = '🪙 ' + care.coins;
        for (var i = 0; i < panelTabButtons.length; i++) {
          var info = panelTabButtons[i];
          if (info.tab === panelTab) info.button.classList.add('is-active');
          else info.button.classList.remove('is-active');
        }
        clearNode(panelBody);
        if (panelTab === 'status') renderStatus(panelBody);
        else if (panelTab === 'shop') renderShop(panelBody);
        else if (panelTab === 'toys') renderToys(panelBody);
        else renderGame(panelBody);
      }

      function switchTab(tab) {
        panelTab = tab;
        renderPanel();
      }

      function buildPanel() {
        panel = el('div', 'dsh-clove-panel');
        panel.setAttribute('data-plugin', 'dsh-pet-clove');
        panel.style.display = 'none';

        var head = el('div', 'pet-panel-head');
        var titleEl = el('span', 'pet-panel-title', '小暮蝶 · 日常');
        titleEl.setAttribute('title', '拖动这里可以移动面板');
        titleEl.addEventListener('pointerdown', onPanelPointerDown);
        head.appendChild(titleEl);
        panelCoins = el('span', 'pet-panel-coins', '🪙 ' + care.coins);
        head.appendChild(panelCoins);
        var closeBtn = el('button', 'pet-panel-close', '✕');
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('title', '关闭面板');
        closeBtn.addEventListener('click', function () { togglePanel(false); });
        head.appendChild(closeBtn);
        panel.appendChild(head);

        var tabs = el('div', 'pet-panel-tabs');
        var tabDefs = [['status', '状态'], ['shop', '商店'], ['toys', '玩具'], ['game', '游戏']];
        panelTabButtons = [];
        for (var i = 0; i < tabDefs.length; i++) {
          (function (tab, label) {
            var btn = el('button', 'pet-panel-tab', label);
            btn.setAttribute('type', 'button');
            btn.addEventListener('click', function (event) {
              if (event && event.stopPropagation) event.stopPropagation();
              switchTab(tab);
            });
            tabs.appendChild(btn);
            panelTabButtons.push({ tab: tab, button: btn });
          })(tabDefs[i][0], tabDefs[i][1]);
        }
        panel.appendChild(tabs);

        panelBody = el('div', 'pet-panel-body');
        panel.appendChild(panelBody);

        (document.body || document.documentElement).appendChild(panel);
        restorePanelPos();
        renderPanel();
      }

      function togglePanel(force) {
        if (!panel) return;
        panelOpen = force !== undefined ? !!force : !panelOpen;
        panel.style.display = panelOpen ? 'flex' : 'none';
        if (panelOpen) renderPanel();
      }

      function careTick() {
        if (document.visibilityState === 'hidden') {
          releaseWorker();
        } else if (workerTick()) {
          applyDecay();
          maybeTaskPay();
        }
        if (panelOpen) renderPanel();
        careTimer = later(careTick, 60000);
      }

      // ---------------- 每日任务 / 成就 / 存档 / 隐藏 / 多窗口 / 装饰 / 小游戏 ----------------

      var checkingAchievements = false;

      function daysTogether() {
        var started = Number(care.startedAt) || Date.now();
        var days = Math.floor((Date.now() - started) / 86400000) + 1;
        return days > 0 ? days : 1;
      }

      function ensureDaily() {
        var key = todayKey();
        if (!care.daily || care.daily.day !== key) {
          care.daily = { day: key, counters: { sign: 0, feed: 0, play: 0, pet: 0 }, done: {} };
          saveCare();
        }
      }

      function dailyCount(id) {
        if (!care.daily || !care.daily.counters) return 0;
        return Number(care.daily.counters[id]) || 0;
      }

      function bumpDaily(id, amount) {
        ensureDaily();
        care.daily.counters[id] = dailyCount(id) + (amount || 1);
        saveCare();
        checkDaily(id);
      }

      function checkDaily(changedId) {
        ensureDaily();
        var earned = false;
        for (var i = 0; i < DAILY_TASKS.length; i++) {
          var task = DAILY_TASKS[i];
          if (care.daily.done[task.id]) continue;
          if (changedId && changedId !== task.id) continue;
          if (dailyCount(task.id) < task.target) continue;
          care.daily.done[task.id] = true;
          care.coins += task.coins;
          saveCare();
          gainXp(task.xp);
          earned = true;
          showBubble('每日任务完成：' + task.name + ' +' + task.coins + ' 金币', 3400);
          spawnFx('🪙', '#FDE68A');
        }
        if (earned) {
          saveCare();
          checkAchievements();
          if (panelOpen) renderPanel();
        }
      }

      function checkAchievements() {
        if (checkingAchievements) return;
        checkingAchievements = true;
        try {
          var level = levelFromXp(care.xp);
          var stats = {
            pet: care.petCount || 0,
            feed: care.feedCount || 0,
            play: care.playCount || 0,
            toys: (care.toys || []).length,
            buy: care.buyCount || 0,
            level: level,
            task: care.todayEarn || 0,
          };
          for (var i = 0; i < ACHIEVEMENTS.length; i++) {
            var achievement = ACHIEVEMENTS[i];
            if (care.achievements.indexOf(achievement.id) >= 0) continue;
            if (!achievement.check(stats)) continue;
            care.achievements.push(achievement.id);
            care.coins += achievement.coins;
            saveCare();
            gainXp(achievement.xp || 0);
            showBubble('成就解锁：' + achievement.name + ' +' + achievement.coins + ' 金币', 4400);
            spawnFx('🏆', '#FDE68A');
          }
          saveCare();
        } finally {
          checkingAchievements = false;
        }
      }

      function linesForLevel(base) {
        var level = levelFromXp(care.xp);
        var extra = [];
        for (var lv in LEVEL_LINES) {
          if (!Object.prototype.hasOwnProperty.call(LEVEL_LINES, lv)) continue;
          if (level >= Number(lv)) extra = extra.concat(LEVEL_LINES[lv]);
        }
        return extra.length ? base.concat(extra) : base;
      }

      function exportSave() {
        var payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          care: care,
          affinity: state.affinity,
          pinned: state.pinned,
        };
        var text = JSON.stringify(payload);
        if (!window.Blob || !window.URL || !window.URL.createObjectURL) {
          showBubble('当前环境不支持导出。');
          return text;
        }
        try {
          var blob = new window.Blob([text], { type: 'application/json' });
          var url = window.URL.createObjectURL(blob);
          var anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'clove-pet-save-' + todayKey() + '.json';
          (document.body || document.documentElement).appendChild(anchor);
          anchor.click();
          anchor.remove();
          window.URL.revokeObjectURL(url);
          showBubble('存档已导出。');
        } catch (err) {
          showBubble('导出失败，浏览器不支持下载。');
        }
        return text;
      }

      function importSave() {
        if (!window.FileReader) {
          showBubble('当前环境不支持导入。');
          return;
        }
        try {
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'application/json,.json');
          input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (!file) return;
            var reader = new window.FileReader();
            reader.onload = function () {
              try {
                var payload = JSON.parse(String(reader.result));
                if (!payload || !payload.care) throw new Error('bad save');
                care = mergeCare(defaultCare(), payload.care);
                saveCare();
                if (typeof payload.affinity === 'number') state.affinity = payload.affinity;
                persistAffinity();
                if (typeof payload.pinned === 'boolean') {
                  state.pinned = payload.pinned;
                  storage.set(STORE_PIN, state.pinned ? '1' : '0');
                  syncPinButton();
                }
                applyAccessories();
                checkAchievements();
                showBubble('存档已导入。', 3000);
                if (panelOpen) renderPanel();
              } catch (err) {
                showBubble('导入失败：文件格式不对。');
              }
            };
            reader.readAsText(file);
          });
          input.click();
        } catch (err) {
          showBubble('导入失败。');
        }
      }

      function hiddenUntil() {
        var ts = parseInt(storage.get(STORE_HIDDEN) || '0', 10);
        return isFinite(ts) ? ts : 0;
      }

      function setHidden(untilTs, message) {
        storage.set(STORE_HIDDEN, String(untilTs || 0));
        syncHidden();
        if (message) showBubble(message, 3000);
        if (panelOpen) renderPanel();
      }

      function syncHidden() {
        var hidden = Date.now() < hiddenUntil();
        host.style.display = hidden ? 'none' : '';
        if (hidden) ensureShowChip();
        else removeShowChip();
      }

      function ensureShowChip() {
        if (showChip) return;
        showChip = el('button', 'dsh-clove-show', '👁 显示暮蝶');
        showChip.setAttribute('type', 'button');
        showChip.addEventListener('click', function (event) {
          if (event && event.stopPropagation) event.stopPropagation();
          setHidden(0, '我回来了。');
        });
        (document.body || document.documentElement).appendChild(showChip);
      }

      function removeShowChip() {
        if (showChip) {
          showChip.remove();
          showChip = null;
        }
      }

      function hideForHour() {
        setHidden(Date.now() + 3600 * 1000, '那我先躲一小时。');
      }

      function hideForToday() {
        var tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        setHidden(tomorrow.getTime(), '明天见。');
      }

      function readWorker() {
        try {
          var raw = storage.get(STORE_WORKER);
          return raw ? JSON.parse(raw) : null;
        } catch (err) {
          return null;
        }
      }

      function isCareWorker() {
        var worker = readWorker();
        return !!(worker && worker.id === windowId);
      }

      function claimWorker() {
        storage.set(STORE_WORKER, JSON.stringify({ id: windowId, ts: Date.now() }));
      }

      function releaseWorker() {
        var worker = readWorker();
        if (worker && worker.id === windowId) storage.set(STORE_WORKER, JSON.stringify({ id: '', ts: 0 }));
      }

      function workerTick() {
        var worker = readWorker();
        if (worker && worker.id === windowId) {
          claimWorker();
          return true;
        }
        var stale = !worker || !worker.id || Date.now() - (Number(worker.ts) || 0) > 90000;
        if (stale) {
          claimWorker();
          return true;
        }
        return false;
      }

      function onStorage(event) {
        if (!event || !event.key) return;
        if (event.key === STORE_CARE) {
          loadCare();
          ensureDaily();
          if (panelOpen) renderPanel();
        } else if (event.key === STORE_HIDDEN) {
          syncHidden();
        }
      }

      function onVisibilityChange() {
        if (document.visibilityState === 'hidden') releaseWorker();
        else workerTick();
      }

      function applyAccessories() {
        for (var i = 0; i < decoNodes.length; i++) {
          if (decoNodes[i].parentNode) decoNodes[i].parentNode.removeChild(decoNodes[i]);
        }
        decoNodes = [];
        host.classList.remove('is-deco-halo', 'is-deco-crown', 'is-deco-bow');
        var active = care.activeAccessory;
        if (!active) return;
        host.classList.add('is-deco-' + active);
        var node = document.createElement('span');
        node.className = 'pet-deco pet-deco-' + active;
        if (active === 'crown') node.textContent = '👑';
        else if (active === 'bow') node.textContent = '🎀';
        button.appendChild(node);
        decoNodes.push(node);
      }

      function useAccessory(id) {
        if (care.accessories.indexOf(id) < 0) return;
        care.activeAccessory = care.activeAccessory === id ? '' : id;
        saveCare();
        applyAccessories();
        showBubble(care.activeAccessory ? '换好了，怎么样？' : '先收起来了。');
        if (panelOpen) renderPanel();
      }

      function startGame() {
        if (game) return;
        var overlay = el('div', 'dsh-clove-game');
        var head = el('div', 'pet-game-head');
        var scoreEl = el('span', 'pet-game-score', '得分 0');
        var endBtn = el('button', 'pet-btn-small', '提前结束');
        endBtn.setAttribute('type', 'button');
        var tip = el('div', 'pet-game-tip', '30 秒内点掉飘过的蝴蝶，每只 3 金币 + 2 经验');
        var field = el('div', 'pet-game-field');
        head.appendChild(scoreEl);
        head.appendChild(endBtn);
        overlay.appendChild(head);
        overlay.appendChild(tip);
        overlay.appendChild(field);
        (document.body || document.documentElement).appendChild(overlay);
        game = { overlay: overlay, field: field, scoreEl: scoreEl, score: 0, ended: false };
        endBtn.addEventListener('click', function (event) {
          if (event && event.stopPropagation) event.stopPropagation();
          endGame(true);
        });
        var spawn = function () {
          if (!game || game.ended) return;
          var butterfly = el('button', 'pet-game-butterfly', '🦋');
          butterfly.setAttribute('type', 'button');
          butterfly.style.left = Math.round(rand(6, 88)) + '%';
          butterfly.style.top = Math.round(rand(12, 80)) + '%';
          butterfly.addEventListener('click', function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (!game || game.ended) return;
            game.score += 1;
            game.scoreEl.textContent = '得分 ' + game.score;
            if (butterfly.parentNode) butterfly.parentNode.removeChild(butterfly);
          });
          field.appendChild(butterfly);
          later(function () {
            if (butterfly.parentNode) butterfly.parentNode.removeChild(butterfly);
          }, 4200);
          later(spawn, rand(380, 720));
        };
        spawn();
        later(function () { endGame(false); }, 30000);
        if (panelOpen) renderPanel();
      }

      function endGame(early) {
        if (!game || game.ended) return;
        game.ended = true;
        var score = game.score;
        game.overlay.remove();
        game = null;
        care.gamePlays = (Number(care.gamePlays) || 0) + 1;
        care.gameBest = Math.max(Number(care.gameBest) || 0, score);
        saveCare();
        var coins = score * 3;
        var xp = score * 2;
        if (coins > 0) {
          care.coins += coins;
          saveCare();
          gainXp(xp);
          showBubble('抓蝴蝶结束：' + score + ' 只，+' + coins + ' 金币 +' + xp + ' 经验', 4200);
        } else {
          showBubble(early ? '才刚开始就不玩了？' : '一只都没抓到，下次加油。', 2800);
        }
        spawnFx('🦋', '#F9A8D4');
        checkAchievements();
        if (panelOpen) renderPanel();
      }

      function isInside(node, target) {
        var current = target;
        while (current) {
          if (current === node) return true;
          current = current.parentNode;
        }
        return false;
      }

      function onDocumentPointerDown(event) {
        if (!panelOpen || !panel) return;
        if (isInside(panel, event.target)) return;
        if (isInside(host, event.target)) return;
        if (game && isInside(game.overlay, event.target)) return;
        togglePanel(false);
      }

      function onDocumentKeyDown(event) {
        if (event.key !== 'Escape' && event.keyCode !== 27) return;
        if (game) endGame(true);
        else if (panelOpen) togglePanel(false);
      }

      function onPanelPointerDown(event) {
        if (!panel || (event.button !== undefined && event.button !== 0)) return;
        if (event.preventDefault) event.preventDefault();
        panelDrag = { x: event.clientX || 0, y: event.clientY || 0 };
        window.addEventListener('pointermove', onPanelPointerMove);
        window.addEventListener('pointerup', onPanelPointerUp);
      }

      function onPanelPointerMove(event) {
        if (!panelDrag || !panel || typeof panel.getBoundingClientRect !== 'function') return;
        var dx = (event.clientX || 0) - panelDrag.x;
        var dy = (event.clientY || 0) - panelDrag.y;
        panelDrag.x = event.clientX || 0;
        panelDrag.y = event.clientY || 0;
        var rect = panel.getBoundingClientRect();
        var left = Math.max(4, rect.left + dx);
        var top = Math.max(4, rect.top + dy);
        panel.style.left = Math.round(left) + 'px';
        panel.style.top = Math.round(top) + 'px';
        panel.style.right = 'auto';
      }

      function onPanelPointerUp() {
        if (!panelDrag) return;
        panelDrag = null;
        window.removeEventListener('pointermove', onPanelPointerMove);
        window.removeEventListener('pointerup', onPanelPointerUp);
        if (panel) storage.set(STORE_PANEL, JSON.stringify({ left: panel.style.left, top: panel.style.top }));
      }

      function restorePanelPos() {
        var raw = storage.get(STORE_PANEL);
        if (!raw || !panel) return;
        var saved = null;
        try {
          saved = JSON.parse(raw);
        } catch (err) {
          saved = null;
        }
        if (!saved || !saved.left || !saved.top) return;
        panel.style.left = saved.left;
        panel.style.top = saved.top;
        panel.style.right = 'auto';
      }

      function scheduleIdle(delay) {
        if (idleTimer !== null) window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(idleTick, delay !== undefined ? delay : rand(2200, 5200));
        timers.push(idleTimer);
      }

      function flyTo(tx, ty, duration) {
        if (state.sleeping || state.pinned) return;
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
        if (care.hunger < 15 || care.thirst < 15) {
          if (roll < 0.6) showBubble(pickLine(CARE_LINES.hungry), 3400);
          scheduleIdle(rand(3500, 6500));
          return;
        }
        if (state.pinned) {
          // 固定模式：只在原地做小动作，绝不自己换位置
          if (roll < 0.3) {
            showBubble(pickLine(LINES.lonely), 3200);
          } else if (roll < 0.42) {
            spin();
          } else if (roll < 0.54) {
            replay('is-happy', 760);
          }
          scheduleIdle(rand(4500, 8500));
          return;
        }
        if (state.silent >= 4) {
          // 没人理的时候慢慢安静下来，不要一直满窗口飞
          if (roll < 0.22) {
            flyTo(rand(MARGIN, maxX()), rand(MARGIN, maxY()));
          } else if (roll < 0.36) {
            showBubble(pickLine(LINES.lonely), 3200);
          } else if (roll < 0.46) {
            spin();
          } else if (roll < 0.56) {
            replay('is-happy', 760);
          }
          scheduleIdle(rand(4500, 8500));
          return;
        }
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
        showBubble(pickLine(linesForLevel(pool)));
        var next = bumpAffinity();
        care.petCount = (Number(care.petCount) || 0) + 1;
        saveCare();
        bumpDaily('pet');
        checkAchievements();
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

      function syncPinButton() {
        pinBtn.textContent = state.pinned ? '📍' : '📌';
        pinBtn.setAttribute('aria-pressed', state.pinned ? 'true' : 'false');
        pinBtn.setAttribute('title', state.pinned ? '固定中：点一下恢复自由' : '固定在这个位置');
        if (state.pinned) pinBtn.classList.add('is-active');
        else pinBtn.classList.remove('is-active');
      }

      function togglePin() {
        if (state.sleeping) wakeUp();
        state.pinned = !state.pinned;
        state.silent = 0;
        storage.set(STORE_PIN, state.pinned ? '1' : '0');
        persistPos();
        syncPinButton();
        if (state.pinned) {
          stopMotion();
          state.mode = 'idle';
          host.classList.remove('is-flying');
          host.style.setProperty('--pet-tilt', '0deg');
          showBubble('钉住了，我就在这儿。');
          scheduleIdle(rand(4500, 8000));
        } else {
          showBubble('好，随便逛逛。');
          scheduleIdle(rand(1800, 3200));
        }
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
      state.pinned = storage.get(STORE_PIN) === '1';
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
      syncPinButton();
      loadCare();
      ensureDaily();
      applyDecay();
      claimWorker();
      maybeTaskPay();
      if (signInPending()) doSignIn();
      buildPanel();
      applyAccessories();
      syncHidden();
      checkDaily(null);
      checkAchievements();
      document.addEventListener('pointerdown', onDocumentPointerDown, true);
      document.addEventListener('keydown', onDocumentKeyDown);
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('storage', onStorage);
      careTimer = later(careTick, 60000);

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
        later(function () { host.classList.remove('is-hover'); }, 450);
      }

      function onPinClick(event) {
        if (event && event.stopPropagation) event.stopPropagation();
        togglePin();
      }

      function onPanelClick(event) {
        if (event && event.stopPropagation) event.stopPropagation();
        togglePanel();
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
      actions.addEventListener('pointerenter', showHover);
      actions.addEventListener('pointerleave', hideHover);
      heartBtn.addEventListener('pointerenter', showHover);
      flyBtn.addEventListener('pointerenter', showHover);
      pinBtn.addEventListener('pointerenter', showHover);
      sleepBtn.addEventListener('pointerenter', showHover);
      heartBtn.addEventListener('pointerleave', hideHover);
      flyBtn.addEventListener('pointerleave', hideHover);
      pinBtn.addEventListener('pointerleave', hideHover);
      sleepBtn.addEventListener('pointerleave', hideHover);
      heartBtn.addEventListener('click', function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        petMe();
      });
      flyBtn.addEventListener('click', function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        if (state.sleeping) wakeUp();
        if (state.pinned) {
          showBubble('被钉住了，飞不动。');
          return;
        }
        flyTo(rand(MARGIN, maxX()), rand(MARGIN, maxY()));
        showBubble(pickLine(LINES.walkAway), 1800);
      });
      pinBtn.addEventListener('click', onPinClick);
      panelBtn.addEventListener('pointerenter', showHover);
      panelBtn.addEventListener('pointerleave', hideHover);
      panelBtn.addEventListener('click', onPanelClick);
      sleepBtn.addEventListener('click', function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        toggleSleep();
      });
      window.addEventListener('resize', onResize);

      // fly in from the right edge, then say hi
      introTimer = later(function () {
        if (state.sleeping) return;
        if (!state.pinned) {
          flyTo(clamp(window.innerWidth * 0.62, MARGIN, maxX()), clamp(window.innerHeight * 0.46, MARGIN, maxY()), 1600);
        }
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
        if (careTimer !== null) window.clearTimeout(careTimer);
        if (panel) {
          panel.remove();
          panel = null;
        }
        if (game) {
          game.overlay.remove();
          game = null;
        }
        removeShowChip();
        for (i = 0; i < decoNodes.length; i++) {
          if (decoNodes[i].parentNode) decoNodes[i].parentNode.removeChild(decoNodes[i]);
        }
        decoNodes = [];
        if (panelDrag) {
          panelDrag = null;
          window.removeEventListener('pointermove', onPanelPointerMove);
          window.removeEventListener('pointerup', onPanelPointerUp);
        }
        releaseWorker();
        document.removeEventListener('pointerdown', onDocumentPointerDown, true);
        document.removeEventListener('keydown', onDocumentKeyDown);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('storage', onStorage);
        stopMotion();
        button.removeEventListener('pointerdown', onPointerDown);
        button.removeEventListener('click', onClick);
        button.removeEventListener('dblclick', onDoubleClick);
        button.removeEventListener('contextmenu', onContextMenu);
        button.removeEventListener('pointerenter', showHover);
        button.removeEventListener('pointerleave', hideHover);
        actions.removeEventListener('pointerenter', showHover);
        actions.removeEventListener('pointerleave', hideHover);
        pinBtn.removeEventListener('pointerenter', showHover);
        pinBtn.removeEventListener('pointerleave', hideHover);
        pinBtn.removeEventListener('click', onPinClick);
        panelBtn.removeEventListener('pointerenter', showHover);
        panelBtn.removeEventListener('pointerleave', hideHover);
        panelBtn.removeEventListener('click', onPanelClick);
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
      style.textContent = ALL_CSS;
      (document.head || document.documentElement).appendChild(style);
      ctx.effect(function () { return function () { style.remove(); }; });

      ctx.effect(function () { return mountPet(); });
      console.log('[clove-pet] browser half active');
    }

    exports.inject = [];
    exports.apply = apply;
    exports._debug = {
      lines: LINES,
      css: ALL_CSS,
      shop: SHOP_ITEMS,
      careLines: CARE_LINES,
      xpForLevel: xpForLevel,
      levelFromXp: levelFromXp,
      dailyTasks: DAILY_TASKS,
      achievements: ACHIEVEMENTS,
      titles: TITLES,
    };
    return module.exports;
  },
});
