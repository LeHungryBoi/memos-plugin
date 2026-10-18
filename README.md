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

## API 版本状况（2026-10-18 核实，改插件前必读）

**事实**：
- 用户服务器 = **memos 0.31.0**。API 带 v1：REST `/api/v1/...`、Connect `/memos.api.v1.*`。
- `memos-api-docs/`（官网爬取）+ 工作区 `memos/` 源码 = **最新版（26.10.x）**，与服务器**不同代**：REST `/api/...`、Connect `/memos.api.*`，v1 路径返回 410 Gone。
- 0.31.0 **已包含 SpaceService**（`GET /api/v1/spaces`、`Memo.space`、`Space.description`），space 功能无需升级即可用。
- 插件（`memos-plugin/language-card.js`）已做双代兼容：**先走最新版路径，遇 404/410 自动回退 v1 路径**。

**下次开新 chat 如何确认 API（按优先级）**：
1. **服务器版本的 proto = 唯一事实源**，从 GitHub tag 直接拉（小文件，秒拉）：
   - 0.31.0 全部 API 契约目录：`https://github.com/usememos/memos/tree/v0.31.0/proto/api/v1`
   - raw 单文件示例（把文件名换成所需 service）：
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/space_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/memo_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/auth_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/user_service.proto`
     - `https://raw.githubusercontent.com/usememos/memos/v0.31.0/proto/api/v1/instance_service.proto`
   - 最新版对照：把 URL 里的 `v0.31.0` 换成 `main`（或工作区 `memos/proto/api/`，无 v1 后缀）。
2. `memos-api-docs/` 是官网最新版本爬取文档，**不代表用户的 0.31 服务器**——引用前先想清楚在给哪一代写代码。

**已知字段差异（插件已兼容）**：
- tag 统计：0.31 = `ListAllUserStats`（`GET /api/v1/users:stats`，响应 `stats[].tagCount`）；最新版 = `ListUserStats`（parent `users/-`，`GET /api/users/-/stats`，响应 `userStats[].tagCounts`）。
- token 刷新：0.31 = `POST /api/v1/auth/refresh`；最新版 = `POST /api/auth/refresh`。

**目录**：`memos/` 保持最新版源码不动（它是"最新版参考"，不是服务器版本）；如确需 0.31 服务端源码，另拉 `git clone --branch v0.31.0 --depth 1`，不要覆盖现有文件夹。