let's work on memos-plugin .

GOAL:
- 用memos的custom css and js做一个custom ui. It create a new card type, 我叫它 language card.
- 用于记录words pairing in different languages. for multi-lingual ppl such as myself. 

参考:
- 爬虫下载的doc在 language-card\docs\memos-api .
- memos\web 包含官方的网页客户端, 功能重合度高, 可参考.

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