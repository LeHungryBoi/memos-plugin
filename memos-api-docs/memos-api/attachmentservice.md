# Attachment Service — 7 个方法

> Source: https://usememos.com/docs/api/latest/attachmentservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [BatchDeleteAttachments](#batchdeleteattachments) — `POST /api/attachments:batchDelete`
- [CreateAttachment](#createattachment) — `POST /api/attachments`
- [DeleteAttachment](#deleteattachment) — `DELETE /api/attachments/{attachment}`
- [GetAttachment](#getattachment) — `GET /api/attachments/{attachment}`
- [ListAttachments](#listattachments) — `GET /api/attachments`
- [UpdateAttachment](#updateattachment) — `PATCH /api/attachments/{attachment}`
- [UploadAttachment](#uploadattachment) — `POST /api/attachments:upload`


---

## BatchDeleteAttachments

> BatchDeleteAttachments deletes up to 100 attachments in one atomic request. The caller must be the uploader of  each attachment or an admin.

`POST /api/attachments:batchDelete`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for AttachmentService.BatchDeleteAttachments.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/attachments:batchDelete" \-H "Content-Type: application/json" \-d '{"names": ["string"]}


---

## CreateAttachment

> CreateAttachment creates an attachment from inline content.

`POST /api/attachments`

## Query Parameters

attachmentId?string

Optional. The ID to use for the attachment. If empty, a unique ID is generated.
Format: ^a-zA-Z0-9?$

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Attachment is a file uploaded by a user, optionally linked to a memo.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/attachments" \-H "Content-Type: application/json" \-d '{"filename": "string","type": "string"}'

200default

{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}


---

## DeleteAttachment

> DeleteAttachment deletes an attachment uploaded by the caller.

`DELETE /api/attachments/{attachment}`

## Path Parameters

attachment*string

The attachment id.

## Response Body

### 200

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X DELETE "https://example.com/api/attachments/string"

200default

Empty

Create Attachment

CreateAttachment creates an attachment from inline content.Get Attachment

GetAttachment gets an attachment by name. An unlinked attachment is visible only to its uploader and admins;
 a linked attachment follows the read access of its memo.


---

## GetAttachment

> GetAttachment gets an attachment by name. An unlinked attachment is visible only to its uploader and admins;  a linked attachment follows the read access of its memo.

`GET /api/attachments/{attachment}`

## Path Parameters

attachment*string

The attachment id.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/attachments/string"

200default

{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}


---

## ListAttachments

> ListAttachments lists attachments linked to memos the caller can read, plus the caller's unlinked uploads.

`GET /api/attachments`

## Query Parameters

pageSize?integer

Optional. The maximum number of attachments to return. The service may return fewer.
If unspecified, at most 50 attachments are returned. Values above 1000 are coerced to 1000.

Formatint32

pageToken?string

Optional. A page token from a previous call. Provide it to retrieve the next page.

filter?string

Optional. A CEL filter over the results.
Example: mime_type == "image/png" or filename.contains("test").
Supported operators: ==, !=, <, <=, >, >=, : (contains), in.
Supported fields: creator, filename, mime_type, create_time, memo_id, space.
creator is the linked memo's creator, or the uploader for an unlinked attachment. It supports equality with a
User resource name.
space is the linked memo's Space resource name, or null when the attachment is unlinked or its memo has no
space. It supports only a non-negated == comparison with a Space resource name or null.

orderBy?string

Optional. The order to sort results by, such as "create_time desc" or "filename asc". The service does not apply
it yet.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X GET "https://example.com/api/attachments"

200default

{"attachments": [{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}],"nextPageToken": "string"}


---

## UpdateAttachment

> UpdateAttachment updates an attachment. Only `filename` can be updated. The caller must be the uploader or an  admin.

`PATCH /api/attachments/{attachment}`

## Path Parameters

attachment*string

The attachment id.

## Query Parameters

updateMask?string

Required. The fields to update. Only filename is supported.

Formatfield-mask

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Attachment is a file uploaded by a user, optionally linked to a memo.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X PATCH "https://example.com/api/attachments/string" \-H "Content-Type: application/json" \-d '{"filename": "string","type": "string"}'

200default

{"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}


---

## UploadAttachment

> UploadAttachment uploads a file in bounded chunks. The first call carries the spec and returns an upload_id;  later calls carry that upload_id. Uploads are bound to the authenticated user, expire after 30 minutes of  inactivity, and do not survive a server restart.

`POST /api/attachments:upload`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for AttachmentService.UploadAttachment.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/attachments:upload" \-H "Content-Type: application/json" \-d '{"writeOffset": "string"}'

200default

{"uploadId": "string","committedSize": "string","maxChunkSize": 0,"attachment": {"name": "string","creator": "string","filename": "string","type": "string","content": "string","externalLink": "string","motionMedia": {"family": "MOTION_MEDIA_FAMILY_UNSPECIFIED","role": "MOTION_MEDIA_ROLE_UNSPECIFIED","groupId": "string","presentationTimestampUs": "string","hasEmbeddedVideo": true},"mediaMetadata": {"width": 0,"height": 0,"photo": {"captureTime": {"localDateTime": "string","utcOffset": "string"},"location": {"latitude": 0.1,"longitude": 0.1,"altitudeMeters": 0.1},"sourceExifOrientation": 0,"cameraMake": "string","cameraModel": "string","lensModel": "string","fNumber": 0.1,"exposureTimeSeconds": 0.1,"iso": 0,"focalLengthMm": 0.1},"video": {"durationSeconds": 0.1}},"memo": "string","size": "string","createTime": "2019-08-24T14:15:22Z"}}
