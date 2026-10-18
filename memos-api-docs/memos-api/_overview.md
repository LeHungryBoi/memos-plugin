# Memos API Reference (Latest) — Overview

> Source: https://usememos.com/docs/api/latest  
> Crawled: 2026-10-17T03:04:16.727Z

---

# API Reference

Memos API Reference (Latest)

## Overview

This reference tracks the latest API schema from the main branch.

## Base URL

The API is served at the /api path of your Memos instance.

https://your-memos-instance.com/api

For example, if your instance is hosted at https://memos.example.com, the API base URL would be:

https://memos.example.com/api

## Authentication

The Memos API uses Bearer Token authentication. You can obtain an access token by creating one in your account settings.

Include the token in the Authorization header of your requests:

Authorization:Bearer<YOUR_ACCESS_TOKEN>

## Pagination

List operations support pagination using pageSize and pageToken parameters.

- pageSize: The maximum number of resources to return.

- pageToken: A token received from a previous list response to retrieve the next page.

## Filtering

Some list operations support filtering via the filter parameter. The filter syntax follows the Google AIP-160 standard.

Example: row_status == "NORMAL"

## Field Masks

Update operations often require an updateMask parameter to specify which fields to update. This prevents accidental overwrites of other fields.

Example: updateMask=content,visibility

## Response Format

All responses are returned in JSON format. Errors are returned with a standard status object:

{
"code":3,
"message":"Invalid argument",
"details": []
}

## Example

Here is an example of how to list memos:

curl-XGET"https://your-memos-instance.com/api/memos?pageSize=10"\
-H"Authorization: Bearer <YOUR_ACCESS_TOKEN>"

## Services

### AI Service### Attachment Service### Auth Service### Identity Provider Service### Instance Service### Memo Service### Space Service### User Service

Transcribe

Transcribe transcribes an audio file with the instance's configured
 transcription provider. The caller must be signed in, and requests are rate limited per user.
