# Memos Language Card Extension (Plan B)

把 Language Card（多语言对照卡片）作为**原生插件**直接注入到已有的 Memos 实例中，无需单独部署外部网页，无需管理 PAT 密钥。

---

## 目录结构说明

- `/app`: **Plan A** 独立 Web App（React 19 + TypeScript + Vite + Vercel 部署方案）。
- `/memos-plugin`: **Plan B** Memos 原生 Custom JS/CSS 插件方案。
  - `language-card.js`: 注入到 Memos 的核心脚本（包含卡片渲染、行内编辑、专属发卡弹窗、Space 自动归属、防误判标识符、动态语言开关）。
  - `language-card.css`: 注入到 Memos 的卡片与弹窗样式（适配深色/浅色模式、手机端并排双栏、悬浮语言开关）。
  - `README.md`: 使用与配置手册。

---

## 3 分钟极速安装

作为 Memos 管理员（例如在 `http://cuteboi:5230`）：

1. 打开 Memos 侧边栏 -> **Settings**（设置） -> **System**（系统） -> 滚动到底部的 **Custom Code**（自定义代码）。
2. 把 `memos-plugin/language-card.css` 的全部内容粘贴到 **Additional Style**。
3. 把 `memos-plugin/language-card.js` 的全部内容粘贴到 **Additional Script**。
4. 点击 **Save**（保存）并刷新页面即可！

---

## 核心特性

1. **全新排布顺序与双语言并排**：
   - 顺序统一调整为：**日本語 (JA, 左) -> English (EN, 中) -> 中文 (ZH, 右)**。
   - **默认启用 EN + ZH**，JA 默认关闭。
   - 关闭的语言在 X 轴上**完全不占用任何空间**（display: none）。
   - **手机端真·并排 (Side-by-Side on Phone)**：在手机窄屏上双语言依然保持 50/50 左右并排对照，不再强制单列上下堆叠。
2. **外部全局开关 vs 单篇 Note 局部开关 (Global vs Per-Note Toggle)**：
   - **外部悬浮开关（`#lc-floating-bar`）**：全局主开关（保存在 localStorage）。它决定了新卡片默认以什么语言组合展开显示（默认开启 EN + ZH）。
   - **Note 内部开关（单卡顶部 & 弹窗内部）**：仅作用于当前这篇卡片 / 弹窗！
     - 每一张卡片顶部都带有独立的 `[JA] [EN] [ZH]` 药丸按钮。想单独看某篇卡片的日文，只需在它的卡片顶部点亮 `JA`，其它卡片完全不受影响。
     - 弹窗编辑器内切换语言也只影响当次录入草稿，绝不会泄漏或改动全局配置。
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
7. **Space（空间）专属模式**：
   - **Header 标记专属 Space**：在某个 Space 的 description 里放入 language card header（`{"_t":"lc","v":2}`，弹窗底部有一键复制框），该 Space 即成为"语言卡片空间"——**在任何页面**新建卡片都会自动存入这个 Space，不再依赖 URL。
     - 弹窗标题栏原来的 `_t:"lc"` 徽标已变成 **Space 指示器**（可点击）：
       - `🃏 <space_id>`（绿色）= 已锁定唯一目标 Space，点击查看详情；
       - `⚠️ N spaces with header`（黄色）= 有多个 Space 带了 header（只允许一个），此时不自动选择目标，点击弹出详情并列出所有命中的 Space；
       - `⛔ No space with header`（红色）= 尚未设置，点击弹出引导：把 header JSON 粘到目标 Space 的 description 里。
   - **兼容旧行为**：没有 header 标记的 Space 时，只要你在某个 Space 下（URL 为 `/s/<space_id>`），新建的卡片仍会自动归入当前 Space；否则进个人空间。
   - 识别结果缓存于 localStorage（`memos_lc_target_space_v2`），遇到 401/403 自动失效重查。
8. **双代 API 自动兼容（0.31 ↔ 最新版）**：
   - Memos 存在两代 API：**0.31**（`/api/v1/...`、Connect `/memos.api.v1.*`）与 **26.10+ 最新版**（`/api/...`、Connect `/memos.api.*`，v1 路径返回 410 Gone）。
   - 本脚本所有请求（memos 增改、spaces 列表、token 刷新、tag 统计）都**先走最新版路径，遇到 404/410 自动回退 0.31 路径**，两代服务器无需改代码。
   - 已知字段差异已处理：tag 统计在 0.31 是 `ListAllUserStats` + 响应 `stats[].tagCount`，最新版是 `ListUserStats(parent=users/-)` + `userStats[].tagCounts`。
   - 参考：`memos-api-docs/`（usememos 官网最新版 API 文档）。
