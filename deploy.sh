#!/bin/bash

# Serverless Payments Sandbox Deployment Script
# This script deploys the complete AWS infrastructure and updates frontend configuration

set -e

echo "🚀 Starting Serverless Payments Sandbox Deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account and region
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

echo "📍 Using AWS Account: $AWS_ACCOUNT"
echo "📍 Using AWS Region: $AWS_REGION"

# Create CDK context file
cat > backend/cdk/context.json << EOF
{
  "account": "$AWS_ACCOUNT",
  "region": "$AWS_REGION"
}
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Deploy AWS infrastructure
echo "🏗️  Deploying AWS infrastructure..."
cd cdk
cdk deploy --require-approval never

# Get the API URL and API Key from CDK outputs
API_URL=$(aws cloudformation describe-stacks --stack-name ServerlessPaymentsSandbox --query 'Stacks[0].Outputs[?OutputKey==`APIURL`].OutputValue' --output text)
API_KEY_ID=$(aws cloudformation describe-stacks --stack-name ServerlessPaymentsSandbox --query 'Stacks[0].Outputs[?OutputKey==`APIKey`].OutputValue' --output text)

echo "✅ AWS Infrastructure deployed successfully!"
echo "🌐 API URL: $API_URL"
echo "🔑 API Key ID: $API_KEY_ID"

# Get the actual API key value
API_KEY_VALUE=$(aws apigateway get-api-key --api-key $API_KEY_ID --include-value --query 'value' --output text)

# Update frontend environment
cd ../../frontend

# Create .env file with API configuration
cat > .env << EOF
VITE_API_URL=$API_URL
VITE_API_KEY=$API_KEY_VALUE
EOF

echo "✅ Frontend environment configured!"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. The API is available at: $API_URL"
echo "2. API Key: $API_KEY_VALUE"
echo "3. Frontend is built in: frontend/dist/"
echo "4. You can serve the frontend with: cd frontend && npm run dev"
echo ""
echo "🔗 API Documentation: $API_URL/docs"
echo "🔗 ReDoc: $API_URL/redoc" 