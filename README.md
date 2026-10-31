# dsh-pet-clove

DeepSeek Harness Web GUI 的桌面宠物：一只会在屏幕里飞来飞去、能被拖着甩出去、摸头会冒爱心的小家伙。它也有自己的小日子——会饿会渴、要赚钱、要买东西、会升级、会记仇，也会记住你陪了它几天。

仓库不带同人图，默认用 `assets/default/pet.png`（原创的蝴蝶小精灵）占位；换成自己的图见下面。

![preview](preview/preview.png)

## 会做什么

**陪伴**
- 自由飞行、拖动惯性、摸头爱心、双击转圈、右键睡觉
- 点一下小暮蝶摸头；鼠标放到宠物或按钮排上，按钮一直显示不消失
- 点 📋 打开面板（面板可拖动，Esc / 点外面关）
- 固定 📌、隐藏（1 小时 / 明天见，右下角有「显示暮蝶」小按钮找回）
- 饿了渴了会抱怨；没人理会慢慢安静、最后睡着
- 67 句台词，加等级解锁台词（Lv.3 / 5 / 8 各解锁两句）

**养成**
- 面板：五个页签（状态 / 背包 / 商店 / 玩具 / 游戏），等级 + 称号、经验条、饥饿度 / 口渴度 / 心情、金币、每日任务、成就、存档
- **背包**：食物和饮品买完自动放进背包，点「背包」页选中直接吃掉/喝掉；状态页有「打开背包」入口；玩具和装饰不占背包，在「玩具」页陪玩换装
- 每天上线自动签到，连续签到有额外奖励（连续天数越多越多，封顶 +30）
- 在线跑任务：每 10 分钟 +12 金币 +6 经验（金币每天上限 240）
- 每日任务 4 个：上线签到、喂食 2 次、陪玩 1 次、摸摸 5 下，完成给金币 + 经验
- 成就 8 个，解锁有金币奖励；面板显示「相识第 N 天」
- 商店 44 件：食物 10 / 饮品 9 / 玩具 16 / 装饰 9，部分商品按等级解锁（Lv.2 ~ 7）
- 玩具里有电子产品：降噪耳机、曲面显示器、智能终端、桌面机器人、全息投影屏、浮空音响、私人影院套件、机械蝴蝶伴飞器，越贵越难养
- 装饰：蝴蝶结、蝶翼光环、蝴蝶发卡、小皇冠、雪纺围巾、单片眼镜、火焰光环、星尘光环、蝶翼光效，买完可以在「玩具」页装备
- 买完东西面板不会跳回顶部，滚动位置会保持
- 小游戏「抓蝴蝶」：30 秒，每只 3 金币 + 2 经验，面板「游戏」页开

**数据**
- 数据存在 `localStorage`，可导出 / 导入 JSON 存档（换机器或清缓存前记得导）
- 多开窗口时只有一个窗口负责计时发钱，其余窗口靠 storage 事件同步，不会重复领工资
- 所有定时器/监听器都挂在插件 fiber 上，卸载即清理

## 安装

命令行版（`dsh web`）：

```
dsh plugin --profile web add github:forget6610/dsh-pet-clove
dsh web
```

桌面客户端：到 **设置 → 插件 → 市场** 从 GitHub 源搜索 `dsh-pet-clove` 安装，装完重启客户端。

本地开发：clone 后 `dsh plugin --profile web add link:<路径>`。

装完强刷页面，宠物出现后把鼠标移上去按钮排就稳定显示，点 📋 打开面板。

## 收益与数值

| 来源 | 金币 | 经验 |
| --- | --- | --- |
| 每日上线签到 | 80 + 10×(等级-1) + 连续签到加成 | +20 |
| 在线跑任务（每 10 分钟） | +12（每天上限 240） | +6（不封顶） |
| 每日任务（4 个） | 每个 20–25 | 每个 +10–15 |
| 成就（8 个） | 每个 20–80 | +10–30 |
| 抓蝴蝶小游戏 | 每只 +3 | 每只 +2 |
| 喂食 / 喝水 | — | +4 ~ +30 |
| 买玩具 / 装饰 | — | +5 |
| 陪玩 | — | +4 ~ +10（有冷却） |

- 饥饿度每 25 分钟 -1，口渴度每 20 分钟 -1，心情每 40 分钟 -1（离线也照算，最多补 12 小时）
- 升级时饱腹和口渴各 +10，等级还给称号（初来乍到 → 烟雾新人 → 蝴蝶常客 → …）
- 金币与经验都是纯本地数值，改存档文件就等于开挂，开心就好

## 存档

- 主要键：`dsh-clove-pet:care:v1`（养成数据）、`:pos:v2`（位置）、`:affinity:v1`（亲密度）、`:pinned:v1`（固定）、`:panel:v1`（面板位置）、`:hidden:v1`（隐藏到什么时候）
- 面板「状态」页底部有「导出存档 / 导入存档」，导出文件叫 `clove-pet-save-日期.json`
- 清浏览器数据前一定先导出一份

## 换角色图

替换 `assets/pet.png`：透明底 PNG、角色大致居中、高 300–500px，底部带一点渐隐更自然。没放就继续用 `assets/default/pet.png`。这个文件在 `.gitignore` 里。

## 调手感

`client.js` 顶部几个常量：

- `MARGIN` 边缘留白（8px）
- `FRICTION` 甩出后的阻尼（2.6，越大停得越快）
- `BOUNCE` 碰边反弹系数（0.55）
- 大小：CSS 变量 `--clove-pet-size`（默认 150px）
- 台词 / 商品 / 任务 / 成就：`LINES`、`SHOP_ITEMS`、`DAILY_TASKS`、`ACHIEVEMENTS`
- 等级曲线：`xpForLevel()`；称号：`TITLES`

## 结构

```
host.js          # 宠物图路由（带默认图回退）
client.js        # 飞行、养成面板、背包、商店、小游戏、装饰、存档、多窗口同步
assets/default/  # 占位素材（原创）
test/            # 两个零依赖测试
```

## 测试

```
npm test
node test/host-smoke.mjs
```

`npm test` 用手写 DOM stub 跑：挂载、读档、悬停按钮排、摸摸、双击、睡觉、飞行 rAF、固定、签到与数值衰减、每日任务、成就、面板渲染、背包页使用道具、商店购买/喂食/买玩具/陪玩冷却、购买后保持滚动位置、装饰装备、等级锁定、抓蝴蝶小游戏、隐藏与找回、Esc 关闭、拖动惯性、卸载清理与监听器泄漏检查。

## 许可

代码 MIT。`assets/default/` 的占位图原创，随代码按 MIT 使用。仓库与 Riot Games 无关，也不分发官方或同人素材；商店里的商品名均为原创虚构名称。

---

A small floating desktop pet for the DeepSeek Harness web GUI. It flies around on its own, can be pinned, dragged and thrown with inertia, petted, and will complain when hungry. It also grows: hunger, thirst, mood, XP, titles, coins, daily sign-in streaks, daily tasks, achievements, a 30-item shop (food, drinks, toys and accessories with original names), a butterfly-catching mini game, a hide-away mode, and JSON save export/import. Single-writer multi-window sync keeps income honest. 67 lines of dialogue. Ships original placeholder art. MIT. Not affiliated with Riot Games.
