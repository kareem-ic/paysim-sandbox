# 🚀 Serverless Payments Sandbox

A production-grade serverless payment processing platform built with AWS and modern web technologies. Perfect for demonstrating fintech expertise to Amazon and Visa hiring managers.

## 🎯 Project Overview

This project showcases a complete payment processing system with:

- **AWS Serverless Architecture**: Lambda, API Gateway, DynamoDB, SNS, CloudWatch
- **Modern Frontend**: React + TypeScript + Tailwind CSS + Radix UI
- **Production Features**: Idempotency, webhooks, monitoring, load testing
- **Developer Experience**: Local development, testing, CI/CD ready

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Gateway   │    │   Lambda        │
│   (Frontend)    │◄──►│   (REST API)    │◄──►│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   DynamoDB      │    │   SNS Topics    │
                       │   (Transactions)│    │   (Webhooks)    │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Local Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd paysim-sandbox
   ```

2. **Run the development environment**
   ```bash
   ./dev.sh
   ```

   This will:
   - Install all dependencies
   - Start the mock API server on `http://localhost:3000`
   - Start the frontend on `http://localhost:5173`
   - Open API documentation at `http://localhost:3000/docs`

3. **Access the application**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:3000/docs
   - Health Check: http://localhost:3000/health

### Option 2: AWS Deployment

1. **Prerequisites**
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   
   # Configure AWS credentials
   aws configure
   ```

2. **Deploy to AWS**
   ```bash
   ./deploy.sh
   ```

   This will:
   - Deploy complete AWS infrastructure
   - Create API Gateway, Lambda, DynamoDB, SNS
   - Configure frontend with real API endpoints
   - Output deployment information

## 📁 Project Structure

```
paysim-sandbox/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── api/             # API client and hooks
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # AWS backend
│   ├── cdk/                 # Infrastructure as Code
│   │   ├── app.py           # CDK application
│   │   └── context.json     # CDK context
│   ├── src/
│   │   └── handler.py       # Lambda function (FastAPI)
│   ├── mock_server.py       # Local development server
│   ├── requirements.txt     # Python dependencies
│   └── tests/               # Unit tests
├── deploy.sh                # AWS deployment script
├── dev.sh                   # Local development script
└── README.md
```

## 🛠️ Features

### Frontend Features
- **Dashboard**: Real-time metrics and charts
- **Transactions**: Search, filter, and view payment history
- **Webhooks**: Manage webhook endpoints and view events
- **API Documentation**: Interactive API docs
- **Responsive Design**: Mobile-friendly interface

### Backend Features
- **Payment Processing**: Authorization, capture, refund
- **Idempotency**: Prevents duplicate transactions
- **Webhooks**: Real-time event notifications
- **Monitoring**: CloudWatch dashboards and metrics
- **Security**: API key authentication, input validation
- **Load Testing**: Locust-based performance testing

### AWS Services Used
- **Lambda**: Serverless compute
- **API Gateway**: REST API management
- **DynamoDB**: NoSQL database
- **SNS**: Event messaging
- **CloudWatch**: Monitoring and logging
- **CDK**: Infrastructure as Code

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
python3 mock_server.py
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Load Testing

```bash
cd backend/load_tests
locust -f locustfile.py --host=http://localhost:3000
```

## 📊 API Endpoints

### Payment Endpoints
- `POST /payments/authorize` - Authorize a payment
- `POST /payments/capture` - Capture an authorized payment
- `POST /payments/refund` - Refund a captured payment

### Mock Endpoints (Development)
- `GET /mock/transactions` - Get mock transactions
- `GET /mock/metrics` - Get mock metrics
- `GET /mock/webhooks` - Get mock webhook events
- `POST /mock/webhook-endpoints` - Create webhook endpoint

### Health Check
- `GET /health` - Service health status

## 🔐 Security

- **API Key Authentication**: Required for all payment endpoints
- **Idempotency Keys**: Prevents duplicate transactions
- **Input Validation**: Pydantic models for request validation
- **CORS Configuration**: Proper cross-origin settings
- **HTTPS Only**: In production environments

## 📈 Monitoring

- **CloudWatch Dashboards**: Real-time metrics
- **API Gateway Metrics**: Request count, latency, errors
- **Lambda Metrics**: Invocations, duration, errors
- **Custom Metrics**: Transaction volume, success rates

## 🚀 Deployment

### Local Development
```bash
./dev.sh
```

### AWS Production
```bash
./deploy.sh
```

### Manual AWS Deployment
```bash
cd backend/cdk
cdk deploy
```

## 🧪 Testing

### Unit Tests
```bash
cd backend
pytest tests/
```

### Load Tests
```bash
cd backend/load_tests
locust -f locustfile.py
```

### API Tests
```bash
# Test the API endpoints
curl -X POST http://localhost:3000/payments/authorize \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-key-123" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "merchant_id": "merchant_123",
    "description": "Test payment"
  }'
```

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=mock-api-key-for-development
```

### Backend (Lambda Environment)
```env
PAYMENTS_TABLE=payments-ledger
WEBHOOK_TOPIC_ARN=arn:aws:sns:...
POWERTOOLS_SERVICE_NAME=payments-api
LOG_LEVEL=INFO
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **API Connection Issues**
   - Check if mock server is running: `http://localhost:3000/health`
   - Verify environment variables in `.env`

3. **AWS Deployment Issues**
   - Ensure AWS CLI is configured: `aws configure`
   - Check AWS permissions
   - Review CloudFormation logs

4. **Port Conflicts**
   - Mock server: Port 3000
   - Frontend: Port 5173
   - Change ports in scripts if needed

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement real payment processor integration
- [ ] Add more comprehensive testing
- [ ] Set up CI/CD pipeline
- [ ] Add database migrations
- [ ] Implement rate limiting
- [ ] Add audit logging
- [ ] Create mobile app

---

**Built with ❤️ for Amazon and Visa hiring managers**