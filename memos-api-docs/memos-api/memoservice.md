# Memo Service — 20 个方法

> Source: https://usememos.com/docs/api/latest/memoservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [BatchGetLinkMetadata](#batchgetlinkmetadata) — `POST /api/memos/-/linkMetadata:batchGet`
- [CreateMemo](#creatememo) — `POST /api/memos`
- [CreateMemoComment](#creatememocomment) — `POST /api/memos/{memo}/comments`
- [CreateMemoShare](#creatememoshare) — `POST /api/memos/{memo}/shares`
- [DeleteMemo](#deletememo) — `DELETE /api/memos/{memo}`
- [DeleteMemoReaction](#deletememoreaction) — `DELETE /api/memos/{memo}/reactions/{reaction}`
- [DeleteMemoShare](#deletememoshare) — `DELETE /api/memos/{memo}/shares/{share}`
- [GetLinkMetadata](#getlinkmetadata) — `GET /api/memos/-/linkMetadata`
- [GetMemo](#getmemo) — `GET /api/memos/{memo}`
- [GetSharedMemo](#getsharedmemo) — `GET /api/shares/{shareToken}/memo`
- [ListMemoAttachments](#listmemoattachments) — `GET /api/memos/{memo}/attachments`
- [ListMemoComments](#listmemocomments) — `GET /api/memos/{memo}/comments`
- [ListMemoReactions](#listmemoreactions) — `GET /api/memos/{memo}/reactions`
- [ListMemoRelations](#listmemorelations) — `GET /api/memos/{memo}/relations`
- [ListMemos](#listmemos) — `GET /api/memos`
- [ListMemoShares](#listmemoshares) — `GET /api/memos/{memo}/shares`
- [SetMemoAttachments](#setmemoattachments) — `PATCH /api/memos/{memo}/attachments`
- [SetMemoRelations](#setmemorelations) — `PATCH /api/memos/{memo}/relations`
- [UpdateMemo](#updatememo) — `PATCH /api/memos/{memo}`
- [UpsertMemoReaction](#upsertmemoreaction) — `POST /api/memos/{memo}/reactions`


---

## BatchGetLinkMetadata

> BatchGetLinkMetadata fetches the metadata of up to 10 links.

`POST /api/memos/-/linkMetadata:batchGet`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for MemoService.BatchGetLinkMetadata.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/memos/-/linkMetadata:batchGet" \-H "Content-Type: application/json" \-d '{"urls": ["string"]}'

200default

{"linkMetadata": [{"url": "string","title": "string","description": "string","image": "string"}]}


---

## CreateMemo

> CreateMemo creates a memo owned by the authenticated user. The request body  is a Memo; set its Markdown content and visibility (defaults to PRIVATE).  Requires authentication.

`POST /api/memos`

## Query Parameters

memoId?string

Optional. The ID to use for the memo, which becomes the final segment of
its resource name. If empty, a unique ID is generated.
Format: ^a-zA-Z0-9?$

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Memo is a Markdown note written by a user.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/memos" \-H "Content-Type: application/json" \-d '{"content": "string","visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED"}'

200default

{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## CreateMemoComment

> CreateMemoComment atomically creates an independent memo plus one immutable  COMMENT context relation to the named memo. The new memo keeps its own  placement, visibility, authorship, and lifecycle. The named memo must be  readable by the caller and not archived.

`POST /api/memos/{memo}/comments`

## Path Parameters

memo*string

The memo id.

## Query Parameters

commentId?string

Optional. The ID to use for the comment memo, in the same format as
CreateMemoRequest.memo_id. If empty, a unique ID is generated.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Memo is a Markdown note written by a user.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/memos/string/comments" \-H "Content-Type: application/json" \-d '{"content": "string","visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED"}'

200default

{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## CreateMemoShare

> CreateMemoShare creates a share link for a memo. Requires the memo creator  or an instance administrator. Only active memos without SPACE visibility  can be shared.

`POST /api/memos/{memo}/shares`

## Path Parameters

memo*string

The memo id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

MemoShare is an access grant that permits read-only access to a memo via an
opaque bearer token.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/memos/string/shares" \-H "Content-Type: application/json" \-d '{}'

200default

{"name": "string","createTime": "2019-08-24T14:15:22Z","expireTime": "2019-08-24T14:15:22Z"}


---

## DeleteMemo

> DeleteMemo deletes the named memo and its comment subtree, including nested  replies and their owned resources. It removes incident relations for all  deleted memos. Requires the memo creator or an instance administrator.

`DELETE /api/memos/{memo}`

## Path Parameters

memo*string

The memo id.

## Query Parameters

force?boolean

Optional. Currently ignored by the server; deletion always includes the
comment subtree.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/memos/string"

200default

Empty

Create Memo Share

CreateMemoShare creates a share link for a memo. Requires the memo creator
 or an instance administrator. Only active memos without SPACE visibility
 can be shared.Delete Memo Reaction

DeleteMemoReaction deletes a reaction. Requires the reaction creator or an
 instance administrator.


---

## DeleteMemoReaction

> DeleteMemoReaction deletes a reaction. Requires the reaction creator or an  instance administrator.

`DELETE /api/memos/{memo}/reactions/{reaction}`

## Path Parameters

memo*string

The memo id.

reaction*string

The reaction id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/memos/string/reactions/string"

200default

Empty

Delete Memo

DeleteMemo deletes the named memo and its comment subtree, including nested
 replies and their owned resources. It removes incident relations for all
 deleted memos. Requires the memo creator or an instance administrator.Delete Memo Share

DeleteMemoShare revokes a share link. Requires the memo creator or an
 instance administrator.


---

## DeleteMemoShare

> DeleteMemoShare revokes a share link. Requires the memo creator or an  instance administrator.

`DELETE /api/memos/{memo}/shares/{share}`

## Path Parameters

memo*string

The memo id.

share*string

The share id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/memos/string/shares/string"

200default

Empty

Delete Memo Reaction

DeleteMemoReaction deletes a reaction. Requires the reaction creator or an
 instance administrator.Get Link Metadata

GetLinkMetadata fetches the title, description, and image of a link.


---

## GetLinkMetadata

> GetLinkMetadata fetches the title, description, and image of a link.

`GET /api/memos/-/linkMetadata`

## Query Parameters

url?string

Required. The link URL.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/-/linkMetadata"

200default

{"url": "string","title": "string","description": "string","image": "string"}


---

## GetMemo

> GetMemo gets a memo. Requires read access to the memo.

`GET /api/memos/{memo}`

## Path Parameters

memo*string

The memo id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/string"

200default

{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## GetSharedMemo

> GetSharedMemo resolves a share token to its memo. No authentication is  required. Returns NOT_FOUND if the token is invalid or expired.

`GET /api/shares/{shareToken}/memo`

## Path Parameters

shareToken*string

Required. The opaque bearer token from the share URL.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/shares/string/memo"

200default

{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## ListMemoAttachments

> ListMemoAttachments lists the attachments of a memo. Requires read access  to the memo.

`GET /api/memos/{memo}/attachments`

## Path Parameters

memo*string

The memo id.

## Query Parameters

pageSize?integer

Optional. The maximum number of attachments to return. The service may
return fewer. Currently ignored; all attachments are returned.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page. Currently ignored.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/string/attachments"

200default

{"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListMemoComments

> ListMemoComments lists the active comments on a memo that the caller can  read. Requires read access to the memo.

`GET /api/memos/{memo}/comments`

## Path Parameters

memo*string

The memo id.

## Query Parameters

pageSize?integer

Optional. The maximum number of comments to return. The service may return
fewer. Defaults to 50; values above 1000 are coerced to 1000.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

orderBy?string

Optional. The order to sort results by. Currently ignored by the server.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/string/comments"

200default

{"comments": [{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListMemoReactions

> ListMemoReactions lists the reactions on a memo. Requires read access to  the memo.

`GET /api/memos/{memo}/reactions`

## Path Parameters

memo*string

The memo id.

## Query Parameters

pageSize?integer

Optional. The maximum number of reactions to return. The service may
return fewer. Currently ignored; all reactions are returned.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page. Currently ignored.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/string/reactions"

200default

{"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListMemoRelations

> ListMemoRelations lists the relations of a memo in both directions.  Requires read access to the memo.

`GET /api/memos/{memo}/relations`

## Path Parameters

memo*string

The memo id.

## Query Parameters

pageSize?integer

Optional. The maximum number of relations to return. The service may
return fewer. Defaults to 50; values above 1000 are coerced to 1000.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/string/relations"

200default

{"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"nextPageToken": "string"}


---

## ListMemos

> ListMemos lists the memos the caller can read, excluding comments.  Anonymous callers can list only when the instance allows public access.

`GET /api/memos`

## Query Parameters

pageSize?integer

Optional. The maximum number of memos to return. The service may return
fewer. Defaults to 50; values above 1000 are coerced to 1000.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the
next page.

filter?string

Optional. A CEL expression to filter memos. Combine terms with && and ||.
Available fields:
content (string), creator (string, e.g. "users/1"),
created_ts / updated_ts (timestamp), pinned (bool),
visibility (string: PRIVATE | PROTECTED | PUBLIC | SPACE),
space (string resource name, or null when the memo has no space;
supports == and comparisons against null, e.g. space != null),
tags (list; match with "work" in tags, not tag == "work"),
has_task_list / has_link / has_code / has_incomplete_tasks (bool),
has_location (bool; true when the memo has a location attached).
Note: the time fields here are created_ts / updated_ts, which differ from
the create_time / update_time names used by order_by.
Examples:
pinned == true && visibility == "PUBLIC"
space == "spaces/team" or space == null
tags.exists(t, t == "urgent")
content.contains("roadmap") && created_ts > now - duration("168h")

orderBy?string

Optional. The order to sort results by, as a comma-separated list of
fields following AIP-132. Defaults to "create_time desc".
Supported fields: pinned, create_time, update_time, name.
Example: "pinned desc, create_time desc" or "update_time asc".
Note: order_by uses create_time / update_time, while the filter
expression uses created_ts / updated_ts for the same timestamps.

showDeleted?boolean

Optional. Whether to include deleted memos. Currently ignored by the
server.

state?string

Optional. The state of the memos to list. Defaults to NORMAL. Set to
ARCHIVED to list the caller's own archived memos.

Formatenum

Value in

- "STATE_UNSPECIFIED"
- "NORMAL"
- "ARCHIVED"

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos"

200default

{"memos": [{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## ListMemoShares

> ListMemoShares lists all share links for a memo. Requires the memo creator  or an instance administrator.

`GET /api/memos/{memo}/shares`

## Path Parameters

memo*string

The memo id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/memos/string/shares"

200default

{"memoShares": [{"name": "string","createTime": "2019-08-24T14:15:22Z","expireTime": "2019-08-24T14:15:22Z"}]}


---

## SetMemoAttachments

> SetMemoAttachments replaces the full set of attachments on a memo with the  provided list (not an append). Pass the complete desired set; an empty list  clears all attachments. Idempotent. Requires the memo creator or an  instance administrator.

`PATCH /api/memos/{memo}/attachments`

## Path Parameters

memo*string

The memo id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for MemoService.SetMemoAttachments.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/memos/string/attachments" \-H "Content-Type: application/json" \-d '{"name": "string","attachments": [{"filename": "string","type": "string"}]}


---

## SetMemoRelations

> SetMemoRelations replaces the full set of mutable REFERENCE relations on a  memo. COMMENT relations are immutable creation context and are rejected by  this RPC. An empty list clears references without changing COMMENT.  Requires the memo creator or an instance administrator.

`PATCH /api/memos/{memo}/relations`

## Path Parameters

memo*string

The memo id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for MemoService.SetMemoRelations.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/memos/string/relations" \-H "Content-Type: application/json" \-d '{"name": "string","relations": [{"memo": {"name": "string"},"relatedMemo": {"name": "string"},"type": "TYPE_UNSPECIFIED"}]}


---

## UpdateMemo

> UpdateMemo updates the memo fields listed in update_mask. Requires the memo  creator or an instance administrator.

`PATCH /api/memos/{memo}`

## Path Parameters

memo*string

The memo id.

## Query Parameters

updateMask?string

Required. The fields to update. Supported paths: content, visibility,
space, pinned, state, create_time, update_time, location, attachments,
relations.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Memo is a Markdown note written by a user.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/memos/string" \-H "Content-Type: application/json" \-d '{"content": "string","visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED"}'

200default

{"name": "string","creator": "string","space": "string","content": "string","location": {"placeholder": "string","latitude": 0.1,"longitude": 0.1},"visibility": "VISIBILITY_UNSPECIFIED","state": "STATE_UNSPECIFIED","pinned": true,"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"relations": [{"memo": {"name": "string","snippet": "string"},"relatedMemo": {"name": "string","snippet": "string"},"type": "TYPE_UNSPECIFIED"}],"reactions": [{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}],"parent": "string","tags": ["string"],"property": {"title": "string","hasLink": true,"hasCode": true,"hasTaskList": true,"hasIncompleteTasks": true},"snippet": "string","createTime": "2019-08-24T14:15:22Z","updateTime": "2019-08-24T14:15:22Z"}


---

## UpsertMemoReaction

> UpsertMemoReaction adds or updates the authenticated user's reaction on a  memo. Requires read access to the memo.

`POST /api/memos/{memo}/reactions`

## Path Parameters

memo*string

The memo id.

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for MemoService.UpsertMemoReaction.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/memos/string/reactions" \-H "Content-Type: application/json" \-d '{"parent": "string","reaction": {"reactionType": "string"}}'

200default

{"name": "string","creator": "string","reactionType": "string","createTime": "2019-08-24T14:15:22Z"}
