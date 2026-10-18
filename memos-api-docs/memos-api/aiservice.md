# AI Service — 1 个方法

> Source: https://usememos.com/docs/api/latest/aiservice  
> Crawled: 2026-10-17T03:04:16.727Z

## 方法目录

- [Transcribe](#transcribe) — `POST /api/ai:transcribe`


---

## Transcribe

> Transcribe transcribes an audio file with the instance's configured  transcription provider. The caller must be signed in, and requests are rate limited per user.

`POST /api/ai:transcribe`

## Request Body

application/json

TypeScript Definitions

Use the request body type in TypeScript.

Copy

Request message for AIService.Transcribe.

## Response Body

### 200

application/json

### default

application/json

cURLJavaScriptGoPythonJavaC#Rust

curl -X POST "https://example.com/api/ai:transcribe" \-H "Content-Type: application/json" \-d '{"audio": {}}'

200default

{"text": "string"}
