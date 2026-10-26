# dsh-pet-clove

DeepSeek Harness Web GUI 的桌面宠物插件：一只会走动、会被你拖着跑、摸头会撒娇、还会睡觉的小家伙。

仓库里**不带**同人图，默认用 `assets/default/pet.png` 一张原创的蝴蝶占位图；想用自己的角色，替换它就行（透明底 PNG，高 300–500px）。

![preview](preview/preview.png)

## 能干什么

- 待机：呼吸浮动，每 5–9 秒随机走动、跳一下、转圈或自言自语
- 拖动：跟随指针，松手按重力落下、弹一下；拖动途中会喊两句
- 摸头：点击角色或 ♥ 按钮，跳起来冒爱心，亲密度 +1（存 localStorage）
- 双击转圈，右键睡觉/唤醒；睡着时慢慢呼吸、冒 `Z`
- 悬停出现 ♥ 和 ☾ 两个小按钮；太久没人理会自己睡着
- 会记住上次站的位置，重启后还在原地
- 67 句台词，按场景分池（问候/摸头/拖拽/落地/睡觉/独处/深夜……），连续两句不重复
- 亲密度 5 / 10 / 20 / 50 有专属台词
- 漫画尖角气泡，带蝴蝶翼角标，每句随机倾斜，贴屏幕边会自动挪回视口

## 安装

```
dsh plugin --profile web-desktop add github:<你的用户名>/dsh-pet-clove
```

本地开发就 clone 后 `dsh plugin --profile web-desktop add link:<路径>`。装完重启客户端并强刷。

> 和 `dsh-theme-clove` 是两个独立插件，同时装会有两个角色，按需二选一。

## 换成自己的图

替换 `assets/pet.png` 即可。要求透明底 PNG、角色大致居中、高 300–500px；底部加一点渐隐会更自然。没放的话会继续用 `assets/default/pet.png`。

## 调手感

- `client.js` 顶部：`WALK_SPEED`（92 px/s）、`GRAVITY`（2600）、`BOUNCE`（0.32）
- 大小：CSS 变量 `--clove-pet-size`，默认 150px
- 台词：`LINES` 对象，按场景分数组
- 存档键：`dsh-clove-pet:pos:v1`、`dsh-clove-pet:affinity:v1`

## 结构

```
host.js          # 宠物图路由，带默认图回退
client.js        # 状态机、拖动/重力、互动、粒子、台词
assets/default/  # 占位素材（原创）
test/            # 两个零依赖测试
```

## 测试

```
npm test
node test/host-smoke.mjs
```

`npm test` 用手写 DOM stub 跑：挂载、读档、摸头加亲密度、双击、睡眠、拖动、重力落地、卸载清理；rAF 是手动步进验证落地的。

## 许可

代码 MIT。`assets/default/` 的占位图原创，随代码一起按 MIT 使用。

「暮蝶 / Clove」和 VALORANT 是 Riot Games 的商标，本仓库与 Riot 无关，也不分发官方或同人素材。

---

A small interactive desktop pet for the DeepSeek Harness web GUI: it wanders around, can be dragged with gravity, reacts to clicks, falls asleep when ignored, and remembers where it stands. 67 lines of dialogue across contexts. Ships original placeholder art, MIT licensed. Not affiliated with Riot Games.
