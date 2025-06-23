# Serverless Payments Sandbox - Backend Architecture

## Overview

This document describes the backend architecture for the Serverless Payments Sandbox, a production-grade REST API for simulating card authorizations, captures, and refunds. The system is designed for low-latency, high-availability, and cost-effective operation using AWS serverless technologies.

---

## High-Level Architecture Diagram

```
┌───────────────┐  POST /authorize /capture /refund
│ API Gateway   │  ──────────────────────────────────►
└──────┬────────┘           Lambda (FastAPI)
       │                        │
       │   PutItem / UpdateItem │
       ▼                        ▼  Publish
┌────────────────────────────┐  ┌──────────────────┐
│ DynamoDB PaymentsLedger    │  │ SNS WebhookTopic │──► Client URL
│  - PK: transaction_id      │  └──────────────────┘
│  - GSI: card_id            │
└────────────────────────────┘
             ▲
             │ Trigger (nightly)
             │
     ┌──────────────────┐
     │ Step Functions   │—simulates T+1 settlement→ updates ledger, fires webhook
     └──────────────────┘
```

---

## AWS Resources

- **API Gateway**: Exposes REST endpoints for `/authorize`, `/capture`, `/refund`, and `/health`. Handles usage plans, API keys, and rate limiting.
- **Lambda (FastAPI)**: Implements the payment logic, idempotency, and webhook publishing. Deployed using AWS Lambda Powertools and Mangum for ASGI compatibility.
- **DynamoDB**: Single-table design for all payment transactions. TTL is used to auto-expire sandbox data. GSI on `card_id` for fast lookups.
- **SNS**: Publishes webhook events to client endpoints. HMAC SHA-256 signatures are added for security.
- **Step Functions**: Simulates overnight settlement and triggers ledger updates and webhooks.
- **CloudWatch**: Monitors API latency, error rates, throughput, and cost. Budget alerts for <$10/month dev cap.
- **SSM Parameter Store**: Stores secrets (e.g., webhook signing key) encrypted with KMS.

---

## Key Flows

### 1. Authorization
- Client POSTs to `/payments/authorize` with card and amount.
- Lambda validates, checks idempotency, and stores transaction in DynamoDB.
- Returns `{status: "approved", auth_id}` or `{status: "declined"}`.
- Publishes `payment_authorized` webhook to SNS.

### 2. Capture
- Client POSTs to `/payments/capture` with `auth_id` and amount.
- Lambda validates original auth, checks idempotency, and stores capture.
- Returns `{status: "completed"}` or error.
- Publishes `payment_captured` webhook to SNS.

### 3. Refund
- Client POSTs to `/payments/refund` with `transaction_id` and amount.
- Lambda validates original capture, checks idempotency, and stores refund.
- Returns `{status: "completed"}` or error.
- Publishes `payment_refunded` webhook to SNS.

### 4. Webhook Delivery
- SNS delivers webhook to client endpoint with HMAC signature in header.
- Retries and dead-letter queue for failed deliveries (future enhancement).

### 5. Settlement Simulation
- Step Functions triggers nightly to simulate T+1 settlement.
- Updates ledger and fires `transaction_settled` webhook.

---

## Security & Compliance

- **Idempotency**: All endpoints require `X-Idempotency-Key` header. Results are cached in DynamoDB for 24h.
- **Rate Limiting**: API Gateway usage plans enforce 100 req/min per API key.
- **HMAC Webhook Signatures**: All webhooks are signed using a secret from SSM Parameter Store (KMS-encrypted).
- **PCI Awareness**: Only last 4 digits of card are stored. No sensitive card data is persisted.
- **Audit Trail**: All transactions are logged with timestamps and status.
- **Encryption**: All data at rest is encrypted by AWS services.

---

## Observability

- **CloudWatch Dashboard**: Tracks TPS, P95 latency, 4xx/5xx errors, and estimated cost.
- **Budget Alerts**: Notifies if monthly cost exceeds $10.
- **Structured Logging**: Lambda uses AWS Lambda Powertools for JSON logs.

---

## Deployment & CI/CD

- **AWS CDK (Python)**: Infrastructure as Code for all resources.
- **GitHub Actions**: Runs `cdk diff` and `cdk deploy --all` on main branch.
- **Testing**: Pytest for unit tests, Locust for load tests.

---

## Future Enhancements

- Dead-letter queue for failed webhooks
- Exponential backoff for webhook retries
- OpenAPI docs hosted on S3 + CloudFront
- Multi-currency and partial approvals
- Dispute and chargeback simulation 