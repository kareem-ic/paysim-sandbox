# Serverless Payments Sandbox

A production-grade REST API sandbox that simulates card authorizations, captures, and refunds—complete with idempotency keys, rate-limits, and webhook callbacks—built entirely on Python + AWS with a modern React frontend.

## 🎯 Project Vision

**One-Sentence Pitch**: "A public REST sandbox that lets developers simulate card authorizations, captures, and refunds—complete with idempotency keys, rate-limits, and webhook callbacks—built entirely on Python + AWS."

### Why This Resonates with Target Companies

| Company | What They Care About | How This Project Proves You "Get It" |
|---------|---------------------|--------------------------------------|
| **Amazon** | • Low-latency, failure-resilient APIs<br>• Event-driven, serverless design<br>• Cost optimisation | Hit P95 < 50ms on Lambda; use CDK for IaC; show CloudWatch cost alarms |
| **Visa** | • Payments semantics (auth/capture/refund)<br>• PCI-grade security practices<br>• Dispute & idempotency logic | Implements ISO-style flows + HMAC webhook signatures; unit-tests idempotency |

## 🏗️ Architecture

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

## 🚀 Features

### Core Payment Operations
- **Authorization Workflow**: Amount validation, returns auth_id in < 50ms
- **Capture & Refund**: Validates original auth, enforces amount ≤ authorized
- **Idempotency**: X-Idempotency-Key header prevents duplicate transactions
- **Webhook Simulation**: 200ms average delivery via SNS → HTTPS endpoints

### Production-Grade Features
- **Rate Limiting**: API Gateway usage plans (100 req/min)
- **Error Handling**: 400 (bad request), 409 (conflict), 500 (internal)
- **Observability**: CloudWatch dashboard with TPS, P95, 4xx/5xx metrics
- **Security**: HMAC SHA-256 webhook signatures with KMS-encrypted secrets

### Frontend Dashboard
- **Real-time Transaction Monitoring**: Live feed of payment operations
- **Metrics Visualization**: Charts showing TPS, latency, error rates
- **Webhook Testing Interface**: Simulate and monitor webhook deliveries
- **API Documentation**: Interactive OpenAPI/Swagger UI

## 🛠️ Tech Stack

### Backend (AWS Serverless)
- **Python 3.12** with FastAPI inside Lambda
- **AWS CDK** for Infrastructure as Code
- **DynamoDB** single-table design with TTL
- **API Gateway** with usage plans & API keys
- **SNS** for webhook delivery
- **Step Functions** for settlement simulation
- **CloudWatch** for monitoring & alerting

### Frontend (React)
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** + Radix UI components
- **React Query** for API state management
- **React Router** for navigation
- **Recharts** for data visualization

### DevOps
- **GitHub Actions** for CI/CD
- **Pytest** for backend testing
- **Locust** for load testing
- **AWS SSM Parameter Store** for secrets

## 📁 Project Structure

```
serverless-payments-sandbox/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Python AWS backend
│   ├── cdk/                 # AWS CDK stacks
│   ├── src/                 # Lambda functions
│   ├── tests/               # Unit tests
│   └── requirements.txt
├── load_tests/              # Performance testing
├── docs/                    # Documentation
└── README.md
```

## 🚀 Getting Started

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Deployment
```bash
cd backend
pip install -r requirements.txt
cdk deploy --all
```

### Load Testing
```bash
cd load_tests
locust -f locustfile.py --host=http://localhost:8000
```

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Latency** | P95 < 50ms | CloudWatch metrics |
| **Throughput** | 5K TPS sustained | Locust load tests |
| **Cost** | < $10/month | AWS Cost Explorer |
| **Uptime** | 99.9% | CloudWatch alarms |
| **Test Coverage** | > 90% | Pytest coverage |

## 🎯 MVP Scope (3-Day Build)

### Day 1: Infrastructure
- [ ] CDK skeleton: API Gateway, Lambda, DynamoDB
- [ ] Basic FastAPI endpoints (empty responses)
- [ ] GitHub Actions CI/CD pipeline

### Day 2: Core Payment Logic
- [ ] Implement `/authorize` endpoint with idempotency
- [ ] DynamoDB single-table design
- [ ] Unit tests for payment flows

### Day 3: Production Features
- [ ] Add `/capture` and `/refund` endpoints
- [ ] SNS webhook delivery system
- [ ] CloudWatch dashboard and monitoring
- [ ] Frontend dashboard integration

## 🔒 Security & Compliance

- **PCI DSS Awareness**: Implements security best practices
- **Idempotency**: Prevents duplicate transaction processing
- **Rate Limiting**: Protects against abuse
- **Audit Trail**: Complete transaction logging
- **Encryption**: KMS-encrypted secrets and data at rest

## 📈 Monitoring & Observability

- **Real-time Metrics**: TPS, latency, error rates
- **Cost Alerts**: Budget notifications for dev environment
- **Error Tracking**: Detailed logging and alerting
- **Performance Monitoring**: P95, P99 latency tracking

## 🤝 Contributing

This project demonstrates enterprise-level software engineering practices including:
- Infrastructure as Code
- Serverless architecture
- Event-driven design
- Comprehensive testing
- Production monitoring
- Security best practices

Perfect for showcasing skills to companies like Amazon, Visa, Stripe, and other fintech leaders.

## 📄 License

MIT License - Feel free to use this as a portfolio project or learning resource.