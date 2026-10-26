# dsh-pet-clove

DeepSeek Harness Web GUI 的桌面宠物：一只会在屏幕里飞来飞去、能被拖着甩出去、摸头会冒爱心、还会自己睡觉的小家伙。

仓库不带同人图，默认用 `assets/default/pet.png`（原创的蝴蝶小精灵）占位；换成自己的图见下面。

![preview](preview/preview.png)

## 会做什么

- **固定 / 自由**：悬停点 📌 把它钉在原地，再点恢复乱飞；固定状态会记住，刷新页面也不变
- **自由飞行**：未固定时每隔几秒自己挑个位置飞过去，平滑移动带倾斜和拖尾星点；首次出现会从右边飞进来
- **会自己安静**：没人理的时候飞动越来越少，最后自己睡着，不会一直满窗口跑
- **拖动**：按住就能拖，松手带着惯性甩出去，碰到屏幕边缘会弹回来，最后自己停下
- **摸头**：点一下跳起来冒爱心 + 随机台词，亲密度 +1（存 localStorage）
- **双击**转一圈，**右键**睡觉/唤醒；睡着时慢慢呼吸冒 `Z`
- **悬停**出现四个按钮：♥ 摸头、✦ 飞一下、📌 固定、☾ 睡觉
- **记位置**：关掉再打开还在上次待的地方
- **67 句台词**，按场景分池（问候/摸头/拖拽/独处/深夜…），连续两句不重复
- 漫画尖角气泡，带蝴蝶翼角标，每句随机倾斜，贴屏幕边会自动挪回视口
- 窄屏隐藏；`prefers-reduced-motion` 下关掉装饰动画，但宠物还是会动

## 安装

命令行版（`dsh web`）：

```
dsh plugin --profile web add github:forget6610/dsh-pet-clove
dsh web
```

桌面客户端：到 **设置 → 插件 → 市场** 从 GitHub 源搜索 `dsh-pet-clove` 安装，装完重启客户端。

本地开发：clone 后 `dsh plugin --profile web add link:<路径>`。

## 换角色图

替换 `assets/pet.png`：透明底 PNG、角色大致居中、高 300–500px，底部带一点渐隐更自然。没放就继续用 `assets/default/pet.png`。这个文件在 `.gitignore` 里。

## 调手感

`client.js` 顶部几个常量：

- `MARGIN` 边缘留白（8px）
- `FRICTION` 甩出后的阻尼（2.6，越大停得越快）
- `BOUNCE` 碰边反弹系数（0.55）
- 大小：CSS 变量 `--clove-pet-size`（默认 150px）
- 台词：`LINES` 对象，按场景分数组
- 存档键：`dsh-clove-pet:pos:v2`（位置）、`dsh-clove-pet:affinity:v1`（亲密度）、`dsh-clove-pet:pinned:v1`（固定状态）

## 结构

```
host.js          # 宠物图路由（带默认图回退）
client.js        # 飞行/固定/拖动/互动/粒子/台词
assets/default/  # 占位素材（原创）
test/            # 两个零依赖测试
```

## 测试

```
npm test
node test/host-smoke.mjs
```

`npm test` 用手写 DOM stub 跑：挂载、读档、摸头、双击、睡觉、飞行动画的 rAF 结束、固定开关（含没有飞走）、拖动 + 惯性滑行、卸载清理；顺手校验生成的 CSS 不是坏的。

## 许可

代码 MIT。`assets/default/` 的占位图原创，随代码按 MIT 使用。仓库与 Riot Games 无关，也不分发官方或同人素材。

---

A small floating desktop pet for the DeepSeek Harness web GUI: it flies around on its own, can be pinned in place, dragged and thrown with inertia, gives hearts when petted, spins on double click, sleeps when ignored, and remembers where it was. 67 lines of dialogue. Ships original placeholder art. MIT. Not affiliated with Riot Games.
