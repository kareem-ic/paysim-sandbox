# Serverless Payments Sandbox - API Reference

## Base URL

```
https://<api-gateway-url>/v1/payments
```

---

## Authentication

- All endpoints require an `x-api-key` header with a valid API key.
- All write endpoints require an `X-Idempotency-Key` header for idempotency.

---

## Endpoints

### 1. Authorize Payment

**POST** `/payments/authorize`

#### Headers
- `x-api-key: <API_KEY>` (required)
- `X-Idempotency-Key: <unique-key>` (required)

#### Request Body
```json
{
  "amount": 5000,
  "currency": "USD",
  "card_number": "4242424242424242",
  "card_holder": "John Doe",
  "expiry_month": 12,
  "expiry_year": 2025,
  "cvv": "123",
  "merchant_id": "merchant_123",
  "description": "Test payment"
}
```

#### Response
```json
{
  "transaction_id": "auth_abc123...",
  "status": "approved",
  "amount": 5000,
  "currency": "USD",
  "created_at": "2024-07-01T12:00:00Z",
  "auth_id": "auth_xyz456...",
  "message": "Authorization successful"
}
```

#### Error Codes
- `400` - Bad request (invalid data)
- `409` - Conflict (duplicate or invalid state)
- `422` - Validation error
- `500` - Internal server error

---

### 2. Capture Payment

**POST** `/payments/capture`

#### Headers
- `x-api-key: <API_KEY>` (required)
- `X-Idempotency-Key: <unique-key>` (required)

#### Request Body
```json
{
  "auth_id": "auth_xyz456...",
  "amount": 5000,
  "currency": "USD",
  "merchant_id": "merchant_123",
  "description": "Capture for order #123"
}
```

#### Response
```json
{
  "transaction_id": "capture_abc123...",
  "status": "completed",
  "amount": 5000,
  "currency": "USD",
  "created_at": "2024-07-01T12:05:00Z",
  "auth_id": "auth_xyz456...",
  "message": "Payment captured successfully"
}
```

#### Error Codes
- `400` - Bad request (invalid data or amount)
- `404` - Authorization not found
- `409` - Conflict (invalid state)
- `422` - Validation error
- `500` - Internal server error

---

### 3. Refund Payment

**POST** `/payments/refund`

#### Headers
- `x-api-key: <API_KEY>` (required)
- `X-Idempotency-Key: <unique-key>` (required)

#### Request Body
```json
{
  "transaction_id": "capture_abc123...",
  "amount": 5000,
  "currency": "USD",
  "merchant_id": "merchant_123",
  "reason": "Customer request"
}
```

#### Response
```json
{
  "transaction_id": "refund_abc123...",
  "status": "completed",
  "amount": 5000,
  "currency": "USD",
  "created_at": "2024-07-01T12:10:00Z",
  "message": "Refund processed successfully"
}
```

#### Error Codes
- `400` - Bad request (invalid data or amount)
- `404` - Transaction not found
- `409` - Conflict (invalid state)
- `422` - Validation error
- `500` - Internal server error

---

### 4. Health Check

**GET** `/health`

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-07-01T12:00:00Z",
  "service": "payments-api"
}
```

---

## Webhook Events

- All webhooks are delivered via SNS to subscribed endpoints.
- Each webhook includes an HMAC SHA-256 signature in the payload for verification.

#### Example Webhook Payload
```json
{
  "payload": {
    "event_type": "payment_authorized",
    "timestamp": "2024-07-01T12:00:00Z",
    "data": {
      "transaction_id": "auth_abc123...",
      "status": "approved",
      ...
    }
  },
  "signature": "abcdef123456..."
}
```

---

## Idempotency

- All write endpoints require the `X-Idempotency-Key` header.
- The same key with the same request returns the same response (no duplicate writes).
- Idempotency keys are valid for 24 hours.

---

## Rate Limiting

- API Gateway usage plans enforce 100 requests/minute per API key.
- Exceeding the limit returns HTTP 429 (rate limit exceeded).

---

## Error Handling

- All errors return a JSON body with a `detail` field describing the error.

#### Example Error
```json
{
  "detail": "Authorization not found"
}
``` 