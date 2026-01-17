# HoldCo Utility App Stack - API Documentation

## Overview

This document describes the API endpoints available in each application within the HoldCo Utility App Stack.

---

## Apprentice Log API

Base URL: `/api`

### Health Check

```
GET /api/health
```

Returns the health status of the application.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.0"
}
```

### Transcribe Audio

```
POST /api/transcribe
```

Transcribes audio recordings to text using OpenAI Whisper.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file (max 25MB, formats: webm, mp3, wav, m4a)

**Response:**
```json
{
  "text": "Today I worked on framing for 6 hours..."
}
```

**Errors:**
- `400` - No audio file provided or file too large
- `401` - Unauthorized (authentication required)
- `500` - Transcription failed

### Format Entry

```
POST /api/format-entry
```

Converts raw transcript text into a structured logbook entry using AI.

**Request:**
```json
{
  "transcript": "Today I worked on framing for 6 hours. Used the nail gun and circular saw."
}
```

**Response:**
```json
{
  "date": "2024-01-15",
  "tasks": [
    {
      "description": "Framing work",
      "hours": 6,
      "tools": ["nail gun", "circular saw"],
      "skills": ["framing", "carpentry"]
    }
  ],
  "totalHours": 6,
  "notes": "",
  "safetyObservations": ""
}
```

**Errors:**
- `400` - No transcript provided or transcript too long (max 10,000 chars)
- `401` - Unauthorized
- `500` - Formatting failed

---

## Bio-Swap API

Base URL: `/api`

### Health Check

```
GET /api/health
```

Returns the health status of the application.

### Get Medicine by Barcode

```
GET /api/medicine?barcode={barcode}
```

Looks up a medicine by barcode and returns alternatives.

**Parameters:**
- `barcode` (optional) - EAN-13 barcode of the medicine

**Response (with barcode):**
```json
{
  "scanned": {
    "id": "uuid",
    "barcode": "9415991011231",
    "name": "Paracetamol",
    "brandName": "Panadol",
    "genericName": "Paracetamol",
    "activeIngredient": "paracetamol",
    "strength": "500mg",
    "form": "tablet",
    "packSize": 20,
    "price": 8.99,
    "isGeneric": false,
    "isSubsidized": false,
    "manufacturer": "GSK"
  },
  "alternatives": [
    {
      "id": "uuid",
      "barcode": "9415991011232",
      "name": "Paracetamol",
      "brandName": "Pharmacy Brand",
      "price": 3.99,
      "isGeneric": true,
      "isSubsidized": true
    }
  ],
  "savings": 5.00,
  "subsidyAvailable": true
}
```

**Response (without barcode - lists all medicines):**
```json
{
  "medicines": [...]
}
```

**Errors:**
- `404` - Medicine not found
- `500` - Database error

### Search Medicines

```
GET /api/medicines/search?q={query}
```

Searches medicines by name or ingredient.

**Parameters:**
- `q` - Search query (min 2 characters)

**Response:**
```json
{
  "medicines": [
    {
      "id": "uuid",
      "brandName": "Panadol",
      "genericName": "Paracetamol",
      "strength": "500mg",
      "form": "tablet",
      "price": 8.99,
      "isGeneric": false
    }
  ]
}
```

---

## Salvage Scout API

Base URL: `/api`

### Health Check

```
GET /api/health
```

Returns the health status of the application.

### Analyze Material Image

```
POST /api/analyze
```

Analyzes an image of building materials using AI vision.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "title": "Timber Offcuts - Pine 2x4",
  "description": "Assorted pine timber offcuts, various lengths from 30cm to 1m",
  "category": "timber",
  "condition": "good",
  "suggestedQuantity": "Approximately 20 pieces",
  "tips": [
    "Include specific dimensions in title",
    "Mention if pressure-treated"
  ]
}
```

**Categories:** `timber`, `metal`, `fixtures`, `paint`, `electrical`, `plumbing`, `roofing`, `insulation`, `flooring`, `other`

**Conditions:** `new`, `like_new`, `good`, `fair`, `salvage`

**Errors:**
- `400` - No image data or image too large (max 5MB)
- `401` - Unauthorized
- `500` - Analysis failed

---

## Authentication

All protected endpoints require authentication via Supabase Auth.

Include the session token in requests:
- Cookie-based authentication (recommended for browser)
- Bearer token in `Authorization` header (for API clients)

---

## Rate Limiting

All API endpoints are rate-limited:
- **General endpoints:** 100 requests per minute per user
- **AI endpoints (transcribe, format, analyze):** 10 requests per minute per user

Rate limit headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Unix timestamp when limit resets

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE" // optional
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
