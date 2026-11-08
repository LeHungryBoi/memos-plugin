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
  - `schema/v2.md`: **V2 数据格式规范**（当前写入版本，也是以后设计 V3 的兼容基线）。
  - `README.md`: 使用与配置手册。
- `/.vscode`: VS Code 打开工作区时自动启动 watcher 的任务配置（位于项目根目录）。
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
| `src/state.js` | 全局语言开关与编辑器会话状态（`state` 单例） |
| `src/utils.js` | 主题、URL Space、转义、复制等纯工具 |
| `src/api.js` | 双代 API（0.31 / 26.10+）请求与 token 刷新 |
| `src/spaces.js` | 专属 Space 解析、缓存、指示器与详情弹窗 |
| `src/card-model.js` | memo 内 JSON 的解析与旧键兼容 |
| `src/card-render.js` | feed 卡片渲染、行内编辑入口 |
| `src/tags.js` | 标签仓库与光标跟随的自动补全下拉 |
| `src/editor.js` | 悬浮栏、并排编辑器弹窗、预览与保存 |
| `src/quick-actions.js` | 原生 Pin / Edit / Archive 快捷按钮 |
| `src/main.js` | 样式注入、MutationObserver、启动 |
| `src/styles/language-card.css` | 全部样式（构建时内联进 JS） |

```powershell
cd memos-plugin
npm install          # 仅首次，安装 esbuild
npm run build        # 生成 language-card.js + language-card.css
npm run watch        # 监听 src/ 变化，自动重建（单实例）
npm run build:split  # 旧式双框安装：JS 不内联 CSS
npm test            # V2 契约向量 + mock DOM 冒烟测试
npm run test:schema # 只跑 V2 数据格式契约向量
```

**数据格式**：卡片是 memo `content` 里的一段 JSON（`{"_t":"lc","v":2,...}`）+ 尾部 tags。
写入/读取规则、遗留兼容、Space 标记、已知怪癖与 V3 决策清单都在 `schema/v2.md`；
`npm run test:schema` 用真实解析器验证 21 个行为向量，改读取器后应逐条复核。

**VS Code 自动监听**：打开工作区根目录时，`.vscode/tasks.json` 的 `runOn: "folderOpen"` 会自动执行
`npm run watch`（根目录 `.vscode/settings.json` 已开启 `task.allowAutomaticTasks`）。
`tools/watch-lock.mjs` 保证多窗口/多次启动只有一个 watcher 写产物；改任意 `src/*.js` 或 CSS
都会在终端打印一次构建结果，粘贴发布时始终取最新的 `language-card.js`。

`language-card.js` / `language-card.css` 是**生成文件**，不要直接编辑；改 `src/` 后重新构建。

---

## 核心特性

1. **全新排布顺序与双语言并排**：
   - 顺序统一调整为：**日本語 (JA, 左) -> English (EN, 中) -> 中文 (ZH, 右)**。
   - **默认启用 EN + ZH**，JA 默认关闭。
   - 关闭的语言在 X 轴上**完全不占用任何空间**（display: none）。
   - **手机端真·并排 (Side-by-Side on Phone)**：在手机窄屏上双语言依然保持 50/50 左右并排对照，不再强制单列上下堆叠。
2. **卡片按内容显示 + 编辑器内语言开关**：
   - **卡片视图按内容显示**：feed 里的卡片只展开它**实际含有**的语言 section（如只有日文的卡只显示日文一栏），始终按 JA → EN → ZH 的 UI 顺序排列；卡片右上角**只有编辑按钮（✏️）**，没有语言开关——每个 language section 的标题已经标明了语言，要改内容就点铅笔进编辑器。只有极少数无语言内容的旧卡片才回退到全局开关的默认组合。
   - **外部悬浮开关（`#lc-floating-bar`）**：全局主开关（保存在 localStorage）。它决定**新建卡片时编辑器**默认展开哪些语言（默认开启 EN + ZH）。
   - **弹窗编辑器内的语言开关**：仅作用于当次录入草稿，绝不会泄漏或改动全局配置，也不会影响其它卡片。
   - **JSON 键序 = UI 顺序**：保存的 JSON 按 `CONFIG.languages` 的顺序（JA → EN → ZH）序列化，与编辑器左中右布局一致，新增语言时输出与 UI 会跟随配置；但读取器的语言键白名单仍硬编码在 `src/card-model.js`，加语言必须同步改（见 `schema/v2.md` §8.2）。
3. **零冲突专属标识符 (`_t: "lc"`) & 100% 向下兼容**：
   - 新卡片自动写入永久短标识 `{"_t":"lc","v":2,...}`，仅占几个字节。
   - **防误判**：随手在其它笔记里贴入的杂项 JSON 或代码绝不会被误渲染成语言卡片。
   - **向下兼容**：历史上创建的无 `_t` 卡片依然无缝渲染。
   - **专属 Space 规则**：在 `CONFIG.dedicatedSpaceKeyword` 指定的空间内，即使卡片没有 `_t` 也会自动渲染为语言卡片。
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
7. **原生快捷操作（Quick Actions，v2.9 新增）**：
   - 每张 memo 卡片（不限语言卡片，所有笔记生效）的原生标题栏右侧、三点菜单**左边**，会直接显示 **Pin / Edit / Archive** 三个图标按钮，单击即可执行，无需先展开三点菜单。
   - 实现方式：点击时用脚本打开该卡片**原生的三点下拉菜单**并点击对应菜单项——Pin/Edit/Archive 的全部原生逻辑（API 请求、置顶状态、原生编辑器）原样复用，插件不重复实现任何 API，因此不存在状态不同步的风险。
   - 按钮样式直接克隆原生三点按钮的 Tailwind 类，深浅色主题自动适配；菜单项匹配支持标签变化（如 `Pin` → `Unpin`）与图标类名回退，Memos 改版导致菜单结构对不上时会安静地关掉菜单、不影响任何功能。
   - Copy（Copy Link / Copy Content）、Move to Space、Delete 等复合或破坏性操作仍保留在三菜单内；快捷集合可在 `src/config.js` 的 `CONFIG.quickActions` 中增删（`path` 支持子菜单路径，如 `['Copy', 'Copy Content']`）。
   - 超窄手机屏（< 480px）下自动隐藏快捷图标，保留三点菜单操作路径。
8. **Space（空间）专属模式**：
   - **Header 标记专属 Space**：在某个 Space 的 description 里放入 language card header（`{"_t":"lc","v":2}`，弹窗底部有一键复制框），该 Space 即成为"语言卡片空间"——**在任何页面**新建卡片都会自动存入这个 Space，不再依赖 URL。
     - 弹窗标题栏原来的 `_t:"lc"` 徽标已变成 **Space 指示器**（可点击）：
       - `🃏 <space_id>`（绿色）= 已锁定唯一目标 Space，点击查看详情；
       - `⚠️ N spaces with header`（黄色）= 有多个 Space 带了 header（只允许一个），此时不自动选择目标，点击弹出详情并列出所有命中的 Space；
       - `⛔ No space with header`（红色）= 尚未设置，点击弹出引导：把 header JSON 粘到目标 Space 的 description 里。
   - **兼容旧行为**：没有 header 标记的 Space 时，只要你在某个 Space 下（URL 为 `/s/<space_id>`），新建的卡片仍会自动归入当前 Space；否则进个人空间。
   - 识别结果缓存于 localStorage（`memos_lc_target_space_v2`），遇到 401/403 自动失效重查。
9. **双代 API 自动兼容（0.31 ↔ 最新版）**：
   - Memos 存在两代 API：**0.31**（`/api/v1/...`、Connect `/memos.api.v1.*`）与 **26.10+ 最新版**（`/api/...`、Connect `/memos.api.*`，v1 路径返回 410 Gone）。
   - 版本号说明：memos 2026-10 换了规则，`26.10` = 2026 年 10 月（CalVer），**比 0.31.0 新**；`v0.31.0`（2026-09-19）是旧 0.x 规则最后一个正式版。详见根 README「API 版本状况」。
   - 本脚本所有请求（memos 增改、spaces 列表、token 刷新、tag 统计）都**先走最新版路径，遇到 404/410 自动回退 0.31 路径**，两代服务器无需改代码。
   - 已知字段差异已处理：tag 统计在 0.31 是 `ListAllUserStats` + 响应 `stats[].tagCount`，最新版是 `ListUserStats(parent=users/-)` + `userStats[].tagCounts`。
   - 参考：`memos-api-docs/`（usememos 官网最新版 API 文档）。
