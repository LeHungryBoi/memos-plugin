let's work on memos-plugin .

GOAL:
- 用memos的custom css and js做一个custom ui. It create a new card type, 我叫它 language card.
- 用于记录words pairing in different languages. for multi-lingual ppl such as myself. 

参考:
- /memos 是上游 main 的开发源码可能领先于最新 RC，不代表稳定发布版或用户服务器版本
- 爬虫下载的doc在 /memos-api-docs/ . 这个版本最新. （注意：它代表最新版 API，不代表用户服务器——用户服务器是 0.31.0，v1 API。动手前必读下方「API 版本状况」！）
- memos/web 包含官方的网页客户端, 功能重合度高, 可参考.

---

Custom UI 描述:
- 以现有Ui code为准
- 一个language card有多个文本框. 每个文本框对应一个语言代码(etc. en,jp,cn). select which type is included in a card. 
- 一个language card里的文本框叫 language section.
- language card的note编辑ui推荐显示raw json, so error can be caught if occurred.

数据结构:
- "_t":"lc","v":2,"是language card header, 用来注明一个note是language card type. 不要改!
- 没有header也能识别, 为了Backwards compatibility. 
- 尽量多以来memos本身的api来增加可靠性. 因为memos有proper programmer维护; 而本custom卡片项目依赖vibe coding.
- 一个language card对应memos笔记里本身的一个笔记/卡片/item(我不知道memos源代码里具体叫它什么). this matches memos api, less ai handling data and backend, more reliable.
- language card的custom结构通过json直接写到一个note里面. 这样就算ai的部分坏了, 普通的memos客户端也能直接看到json.
```json
{
  "_t": "lc",
  "v": "2",
  "en": "serendipity",
  "cn": "意外发现珍宝的运气 / 缘分",
  "jp": "セレンディピティ"
}
```
- language section是optional, 可以使用任意的组合, 甚至未来可能增加新语言. 但是, 只要数据结构足够基础, 使用标准的iso国家代码, 就不容易出问题.
```json
{
  "_t": "lc",
  "v": "2",
  "en": "motor",
  "cn": "电机"
}
```

## Space 标记（存放位置）
- 想让 language card 固定存进某个 space：往该 space 的 description 里放入**仅含 header 的 json** `{"_t":"lc","v":2}`。
- 插件识别 space 列表 API 并读取各 space 的 description；只允许一个 space 带此 header（多个则警告、不自动选择），没找到则弹引导。
- 2026-10-18 实现：`memos-plugin/language-card.js` 的 Space 指示器（弹窗标题栏）+ header 复制框（弹窗底部）。

## 卡片快捷操作（Quick Actions，2026-10-20 实现）
- 需求：memo 卡片右上角原生三点菜单里的 Pin / Edit / Archive 直接外露成图标，省掉一次点击。
- 实现：`memos-plugin/language-card.js`（v2.9）给每张 memo 卡片的原生 `data-slot="memo-header-actions"` 注入图标按钮（置于三点按钮左侧），点击时**驱动该卡片原生的三点下拉菜单**并点击对应菜单项——原生逻辑全复用，不重复实现任何 API。
- 菜单 DOM 事实（2026-10-20 chrome-devtools 实测，服务器 0.31.0）：触发器 = `button[aria-label="More"]`（`data-slot="dropdown-menu-trigger"`，Base UI 渲染，菜单挂在 body 下的 portal，`role="menu"` + `aria-labelledby` 指向触发器 id）；菜单项 = `div[role="menuitem"]`，顶层 Pin/Edit/Copy/Archive/More，子菜单 Copy→Copy Link/Copy Content，More→Move to Space/Delete；图标为 lucide（bookmark-plus/pen-line/archive）。原生编辑器打开时 `article` 整体被替换、且编辑器是 CodeMirror 不是 tiptap，插件不会误抓编辑器内容。
- 快捷集合可在 `CONFIG.quickActions` 增删，`path` 支持子菜单路径（如 `['Copy', 'Copy Content']`）；窄屏 <480px 自动隐藏图标保留三点菜单。

## API 版本状况（2026-10-18 核实，改插件前必读）

**版本号 scheme（重要，别被数字大小骗了）**：
- memos 在 2026-10 换了版本号规则：**旧规则 `0.x`** → **新规则 CalVer 按年月**（`26.10` = 2026 年 10 月）。
- 时间线（以 `https://github.com/usememos/memos/tags` 的发布日期为准）：
  - `v0.31.0`（2026-09-19）= 旧规则**最后一个正式版**，也就是用户服务器的版本；
  - `26.10-RC.1`（2026-10-09）= 新规则**首个版本**（RC = release candidate 候选版）；
  - 之后的正式版形如 `26.10.0` / `26.10.1`，**小数点后的 `.x` 是小版本号，不是版本数字变小**。
- 结论：**26.10.x 比 0.31.0 新**。docs 和工作区源码都是新规则最新版，用户服务器是旧规则最后版，差一个月。

**事实**：
- 用户服务器 = **memos 0.31.0**。API 带 v1：REST `/api/v1/...`、Connect `/memos.api.v1.*`。
- `memos-api-docs/`（官网爬取）+ 工作区 `memos/` 源码 = **新规则最新版（26.10.x，2026-10）**，与服务器不同代：REST `/api/...`、Connect `/memos.api.*`，v1 路径返回 410 Gone。
- 0.31.0 **已包含 SpaceService**（`GET /api/v1/spaces`、`Memo.space`、`Space.description`），space 功能无需升级即可用。
- 插件（`memos-plugin/language-card.js`）已做双代兼容：**先走最新版路径，遇 404/410 自动回退 v1 路径**（0.31 上新版路径是 404 不是 410，只判 410 会漏）。
- 确认服务器版本：Memos 设置页直接看版本号；或 `GET <服务器>/api/v1/instance/profile` 返回 JSON 的 `version` 字段。

**下次开新 chat 如何确认 API（按优先级）**：
1. **服务器版本的 proto = 唯一事实源**，从 GitHub tag 直接拉（小文件，秒拉）：
   - 0.31.0 全部 API 契约目录：`https://github.com/usememos/memos/tree/v0.31.0/proto/api/v1`
   - raw 单文件示例（把文件名换成所需 service）：
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/space_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/memo_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/auth_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/user_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/instance_service.proto`
   - 最新版对照：把 URL 里的 `v0.31.0` 换成 `main`（或工作区 `memos/proto/api/`，无 v1 后缀）。注意 tag 命名也随规则变了：旧规则带 `v` 前缀（`v0.31.0`），新规则不带（`26.10-RC.1`）。
2. `memos-api-docs/` 是官网最新版本爬取文档，**不代表用户的 0.31 服务器**——引用前先想清楚在给哪一代写代码。

**已知字段差异（插件已兼容）**：
- tag 统计：0.31 = `ListAllUserStats`（`GET /api/v1/users:stats`，响应 `stats[].tagCount`）；最新版 = `ListUserStats`（parent `users/-`，`GET /api/users/-/stats`，响应 `userStats[].tagCounts`）。
- token 刷新：0.31 = `POST /api/v1/auth/refresh`；最新版 = `POST /api/auth/refresh`。

**目录**：`memos/` 保持最新版源码不动（它是"最新版参考"，不是服务器版本）；如确需 0.31 服务端源码，另拉 `git clone --branch v0.31.0 --depth 1`，不要覆盖现有文件夹。