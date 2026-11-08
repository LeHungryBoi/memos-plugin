# Memos Language Card Extension (Plan B)

把 Language Card（多语言对照卡片）作为**原生插件**直接注入到已有的 Memos 实例中，无需单独部署外部网页，无需管理 PAT 密钥。

---

## 目录结构说明

- `/memos-plugin`: **Plan B** Memos 原生 Custom JS/CSS 插件方案。
  - `src/`: **源码（只改这里）**，按职责拆分的小模块 + `src/styles/language-card.css`。
  - `build.mjs` / `package.json`: esbuild 构建器，把所有模块**合并成一个完整文件**。
  - `language-card.js`: **生成物**，合并后的完整脚本（已内联 CSS），直接粘贴到 Memos。
  - `language-card.css`: **生成物**，独立样式表，仅旧式双框安装时需要。
  - `tools/`: watcher 单实例锁、V2 契约向量、mock DOM 冒烟测试。
  - `schema/v2.md`: **V2 数据格式规范**（历史写入格式，仍是读取器的兼容基线）。
  - `schema/v3.md`: **V3 数据格式**（当前实现：卡片类型 marker + note content）。
  - `schema/v3-requirements.md`: **V3 需求规格**（五项需求与验收清单；已按默认决策实现）。
  - `README.md`: 使用与配置手册。
- `/.vscode`: 打开工作区时自动启动 watcher 的任务配置（位于项目根目录）。
- `/memos-api-docs`: 官网 API 文档快照（最新版，不代表用户服务器版本）。

---

## 3 分钟极速安装

作为 Memos 管理员（例如在 `http://cuteboi:5230`）：

1. 打开 Memos 侧边栏 -> **Settings**（设置） -> **System**（系统） -> 滚动到底部的 **Custom Code**（自定义代码）。
2. 把 `memos-plugin/language-card.js` 的全部内容粘贴到 **Additional Script**。
   这个文件已经内联了全部 CSS，**不需要再粘贴 Additional Style**。
3. 点击 **Save**（保存）并刷新页面即可！

> 沿用旧的「JS + CSS 两个框」装法也行：执行 `npm run build:split` 生成不含内联样式的 JS，
> 再把 `language-card.css` 贴进 **Additional Style**。两个框都贴同一份样式也不会有副作用。

---

## 开发：模块拆分与自动构建

单文件太长，源码已拆成 `src/` 下的模块；发布时由 esbuild 合并回**一个** `language-card.js`（IIFE、未压缩、可读）。

| 模块 | 职责 |
| --- | --- |
| `src/config.js` | 语言定义、`_t:"lc"` 标识、快捷操作配置、localStorage 键 |
| `src/state.js` | 编辑器会话状态、类型列表、memo→Space 缓存（`state` 单例） |
| `src/utils.js` | 主题、URL Space、转义、复制、marker 文本等纯工具 |
| `src/api.js` | 双代 API（0.31 / 26.10+）读写、token 刷新、Space 描述 PATCH |
| `src/card-types.js` | V3 卡片类型：marker 解析/序列化、排序、分区别名 |
| `src/spaces.js` | 多类型发现、指示器、memo→Space 预热 |
| `src/space-manager.js` | 类型管理面板、分区增删排序、不兼容 note 迁移 |
| `src/card-model.js` | V2/V3 分派、note 解析与序列化 |
| `src/card-render.js` | feed 卡片渲染（动态分区 + 说明区）、行内编辑入口 |
| `src/tags.js` | 标签仓库与光标跟随的自动补全下拉 |
| `src/editor.js` | 悬浮栏、动态并排编辑器、说明区开关、预览与保存 |
| `src/quick-actions.js` | 原生 Pin / Edit / Archive / Copy Content / Delete 快捷按钮 |
| `src/main.js` | 样式注入、类型预热、MutationObserver、启动 |
| `src/styles/language-card.css` | 全部样式（构建时内联进 JS） |

```powershell
cd memos-plugin
npm install          # 仅首次，安装 esbuild
npm run build        # 生成 language-card.js + language-card.css
npm run watch        # 监听 src/ 变化，自动重建（单实例）
npm run build:split  # 旧式双框安装：JS 不内联 CSS
npm test            # V2 + V3 契约向量 + mock DOM 冒烟测试
npm run test:schema # 只跑 V2 数据格式契约向量
npm run test:v3     # 只跑 V3 marker / payload / 迁移向量
```

**数据格式**：V3 卡片定义（分区、排序、别名）只写在 Space 的 description marker 里；
note `content` 存分区值、启用分区、每语言与统一说明及尾部 tags。格式见 `schema/v3.md`，V2 兼容规则见 `schema/v2.md`。
需求与验收清单见 `schema/v3-requirements.md`（五项需求，**已按文档中的默认决策实现**）。

**VS Code 自动监听**：打开工作区根目录时，`.vscode/tasks.json` 会启动 `npm run watch`。
监听构建只写入被 Git 忽略的 `memos-plugin/.watch/`，不会改动 Git 跟踪的发布文件，因此 rebase 时无需停止 watcher。
开发时从 `memos-plugin/.watch/language-card.js` 复制最新构建；仓库中的 `language-card.js` 保持为可直接下载和粘贴的发布版本。
`tools/watch-lock.mjs` 保证多窗口/多次启动只有一个 watcher 写产物；改任意 `src/*.js` 或 CSS
都会在终端打印一次构建结果。

`language-card.js` / `language-card.css` 是**生成文件**，不要直接编辑；改 `src/` 后重新构建。
只有显式运行 `npm run build`（或 `npm run build:split`）才会更新 Git 跟踪的发布文件。

---

## 核心特性

> **V3 已落地**：① Copy Content 快捷按钮；② 多 Space 卡片类型（定义只存 Space）；③ 每语言说明 + 统一说明及独立显示开关；④ 独立的 Space 快选与类型管理（排序 / 分区管理 / 迁移）；⑤ 移除首页无效分区开关与重复卡片头，定义不再写入每条 note。详见 `schema/v3.md`。

1. **全新排布顺序与双语言并排**：
   - 默认类型（V2 兼容）顺序为 **日本語 (JA, 左) -> English (EN, 中) -> 中文 (ZH, 右)**，且 JA 默认隐藏（新建卡片只开 EN+ZH，与 V2 一致）；V3 类型由 Space marker 自定义分区与顺序，每个分区可单独设定是否默认隐藏。
   - 编辑器里关闭的分区在 X 轴上**完全不占用任何空间**（display: none）。
   - **手机端真·并排 (Side-by-Side on Phone)**：在手机窄屏上双语言依然保持 50/50 左右并排对照，不再强制单列上下堆叠。
2. **卡片分区由类型定义 + 编辑器内分区开关**：
   - V3 卡片的分区（名称、顺序、配色）来自所属 Space 的卡片类型；feed 卡片只展开**实际含有**的分区，右上角只有编辑按钮（✏️），不再重复显示 🔤 卡片标题。
   - **首页悬浮栏只有 `[ 🔤 New Card ]`**：V3 移除了左侧无效的语言分区开关（分区语义属于卡片类型，不属于首页）。
   - **弹窗编辑器内的分区开关**：按当前类型动态生成，仅作用于当次录入草稿。
   - **说明区与语言分区联动**：语言分区 Toggle 同时开关对应 explanation；统一 explanation 位于各语言 explanation 下方。独立的说明总开关可隐藏所有 explanation，但不删除内容。
   - **JSON 键序 = 类型 sections 顺序**：由 `src/card-types.js` 动态生成；V2 的固定白名单只用于兼容旧卡片（见 `schema/v3.md`）。
3. **版本标识 & 100% 向下兼容**：
   - V3 新卡片写入 `{"_t":"lc","v":3,...}`，定义不进 note，只存分区值、说明与 tags。
   - **防误判**：`_t` 非 `lc` 的杂项 JSON 不会被渲染。
   - **向下兼容**：V2 卡片（`v:2` / 无 `_t`）继续按三分区渲染，21 个 V2 契约向量持续回归。
   - **每个 Space 一种卡片类型**：多个带 marker 的 Space 是常态，不再互相冲突。
4. **并排对照录入编辑器 (Side-by-Side Editor)**：
   - 点击右下角 `[ 🔤 New Card ]` 打开弹窗，左右扫视对照输入极其顺手。
   - 支持多行扩展输入，并支持 `Ctrl + Enter` / `Cmd + Enter` 极速保存，`Esc` 快速关闭。
   - **Tags 自动补全**：输入 `#` 后弹出已有标签下拉（数据源与 Memos 原生编辑器一致：`UserService/ListUserStats`，parent `users/-`，聚合各用户 tagCounts，缓存 2 分钟），每项带用量计数；`↑`/`↓` 选择，`Enter`/`Tab` 补全（补全后带一个空格继续输入下一个），`Esc` 关下拉，鼠标点击也可选。下拉**紧贴文本光标（blinker）下方弹出**，光标移动（方向键/Home/End/点击）、弹窗滚动、窗口缩放时实时跟随；空间不足时自动上翻。
   - **保存失败详细报错**：保存/更新失败时，弹窗错误框会显示完整的失败请求信息：HTTP 状态码、请求方法、**绝对 URL**、响应体摘要（Memos 返回 JSON `message`，反向代理/SPA 回退则返回 HTML——这是区分"路由没打到 API"与"API 报错"的关键线索）以及当前页面 URL；浏览器控制台另有 `[LanguageCard] Save failed` 完整日志（含是否携带 token、是否 Space、是否编辑模式）。
5. **零配置原生自动鉴权 (Automatic Session Auth)**：
   - 脚本直接复用 Memos 网页自身存储在 `localStorage` 的 `memos_access_token`。
   - 请求时自动附带 `Authorization: Bearer <token>` 及 Session Cookie。
   - 若遇到令牌过期，自动触发静默刷新重试，彻底解决 `authentication required` 报错，无需手动生成或配置 PAT。
6. **交互功能**：
   - ✏️ **行内编辑**：每张卡片标题栏右侧带编辑按钮，点击直接打开同一套并排编辑器，自动预填该卡片的 JA/EN/ZH 与 Tags；保存走 `PATCH` 更新原 memo，**不刷新页面**，卡片原地换新内容。编辑框内的语言开关只影响本次编辑会话，不会改动卡片的全局/单篇显示状态。
   - 保存成功后**不做任何整页刷新**，也不弹提示——Memos 会自行把新卡片/更新后的卡片带进 feed。
7. **原生快捷操作（Quick Actions）**：
   - 每张 memo 卡片（不限语言卡片）的原生标题栏右侧、三点菜单**左边**，直接显示 **Pin / Edit / Archive / Copy Content** 四个图标按钮；**Delete** 单独放在这一行**最左边**（时间左边），远离按钮簇防误触。
   - Copy Content 只是把原生菜单里的 `Copy → Copy Content` 在外层再放一份；点击时脚本打开原生三点菜单并点击对应菜单项，全部原生逻辑（复制内容、置顶状态、原生编辑器）原样复用，插件不重写任何 API。
   - 菜单项匹配支持标签变化（如 `Pin` → `Unpin`）与图标类名回退；结构对不上时安静关掉菜单。快捷集合可在 `src/config.js` 的 `CONFIG.quickActions` 中增删（`path` 支持子菜单路径）。
   - 超窄手机屏（< 480px）下自动隐藏快捷图标；Copy Link / Move to Space 等仍留在三菜单内。Delete 走 `More → Delete` 子菜单路径（原生 0.31.0 菜单里没有 `data-variant="destructive"`），定位失败时会关掉菜单、不留残留。
8. **多空间卡片类型 & 管理入口**：
   - **每个 Space 的 description 里放一个 V3 marker**，含类型名、排序、语言分区定义、说明区模式与分区名别名；该 Space 即成为一种卡片类型。marker 的预览与复制按钮在管理面板内，编辑器底部只保留 note 的 Payload Preview 一个预览窗口。
   - 弹窗标题栏把**快速 Space 选择**与**类型管理**分成两个按钮：选择菜单按类型顺序列出 Space；手机上无需打开菜单，在编辑器非输入区域左右滑动即可切换；菜单底部「Add new space」进入创建表单。编辑器打开时会锁定背景页面滚动，同时保留弹窗内容区自身滚动。类型管理面板可点卡片展开定义、用上下箭头排序、增删/排序语言分区，键名映射由迁移向导逐键选择后自动保存。
   - 没有手动选择时，新卡片默认使用排序第一的类型。类型顺序由上下箭头管理，不需要手动编辑 Order 数值。
   - 管理面板可直接创建 Memos Space 并自动写入 Language Card 类型定义；新空间复制当前类型的分区，之后的新卡片默认使用它，当前打开的草稿保持不变。
   - **无 marker 的 Space** 会单独列出，可一键声明为卡片类型；写 description 需要 Space 管理员权限，权限不足时降级为复制 marker 手动粘贴。
   - **不兼容 note**：管理面板里只是入口按钮；点击后打开独立迁移窗口——扫描所属 Space 的 memo，逐条列出 note 及其真实键值，每个不匹配的键从当前类型分区里选择目标（或保留原样），预览确认后逐条迁移（framework 一致，只改分区名）。
   - 混合 feed 会按 memo 所属 Space 选择类型定义；没有可用类型时回退当前 URL Space / 个人空间。缓存键沿用 `memos_lc_target_space_v2`。
9. **双代 API 自动兼容（0.31 ↔ 最新版）**：
   - Memos 存在两代 API：**0.31**（`/api/v1/...`、Connect `/memos.api.v1.*`）与 **26.10+ 最新版**（`/api/...`、Connect `/memos.api.*`，v1 路径返回 410 Gone）。
   - 版本号说明：memos 2026-10 换了规则，`26.10` = 2026 年 10 月（CalVer），**比 0.31.0 新**；`v0.31.0`（2026-09-19）是旧 0.x 规则最后一个正式版。详见根 README「API 版本状况」。
   - 本脚本所有请求（memos 增改、spaces 列表、token 刷新、tag 统计）都**先走最新版路径，遇到 404/410 自动回退 0.31 路径**，两代服务器无需改代码。
   - 已知字段差异已处理：tag 统计在 0.31 是 `ListAllUserStats` + 响应 `stats[].tagCount`，最新版是 `ListUserStats(parent=users/-)` + `userStats[].tagCounts`。
   - 参考：`memos-api-docs/`（usememos 官网最新版 API 文档）。
