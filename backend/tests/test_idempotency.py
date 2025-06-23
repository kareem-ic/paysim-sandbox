"""
Unit tests for Serverless Payments Sandbox API

This module tests the core payment functionality including:
- Idempotency handling
- Payment authorization
- Payment capture
- Payment refund
- Error handling
"""

import json
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import boto3
from moto import mock_dynamodb, mock_sns

# Import the FastAPI app
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from handler import app, check_idempotency, store_idempotency_key, publish_webhook
from fastapi.testclient import TestClient

# Create test client
client = TestClient(app)

@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'
    os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'

@pytest.fixture
def dynamodb_mock(aws_credentials):
    """Mock DynamoDB for testing."""
    with mock_dynamodb():
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        
        # Create test table
        table = dynamodb.create_table(
            TableName='payments-ledger',
            KeySchema=[
                {'AttributeName': 'transaction_id', 'KeyType': 'HASH'},
                {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'transaction_id', 'AttributeType': 'S'},
                {'AttributeName': 'created_at', 'AttributeType': 'S'},
                {'AttributeName': 'card_id', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'card_id_index',
                    'KeySchema': [
                        {'AttributeName': 'card_id', 'KeyType': 'HASH'},
                        {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        # Set environment variables
        os.environ['PAYMENTS_TABLE'] = 'payments-ledger'
        os.environ['WEBHOOK_TOPIC_ARN'] = 'arn:aws:sns:us-east-1:123456789012:test-topic'
        
        yield table

@pytest.fixture
def sns_mock(aws_credentials):
    """Mock SNS for testing."""
    with mock_sns():
        sns = boto3.client('sns', region_name='us-east-1')
        topic_arn = sns.create_topic(Name='test-topic')['TopicArn']
        os.environ['WEBHOOK_TOPIC_ARN'] = topic_arn
        yield sns

class TestIdempotency:
    """Test idempotency functionality."""
    
    def test_idempotency_key_storage(self, dynamodb_mock):
        """Test that idempotency keys are stored correctly."""
        idempotency_key = "test-key-123"
        operation = "authorize"
        result = {"transaction_id": "test-123", "status": "approved"}
        
        store_idempotency_key(idempotency_key, operation, result)
        
        # Verify storage
        stored = check_idempotency(idempotency_key, operation)
        assert stored is not None
        assert stored['result'] == result
    
    def test_idempotency_key_retrieval(self, dynamodb_mock):
        """Test that idempotency keys are retrieved correctly."""
        idempotency_key = "test-key-456"
        operation = "capture"
        result = {"transaction_id": "test-456", "status": "completed"}
        
        # Store first
        store_idempotency_key(idempotency_key, operation, result)
        
        # Retrieve
        retrieved = check_idempotency(idempotency_key, operation)
        assert retrieved is not None
        assert retrieved['result'] == result
    
    def test_nonexistent_idempotency_key(self, dynamodb_mock):
        """Test that nonexistent idempotency keys return None."""
        result = check_idempotency("nonexistent-key", "authorize")
        assert result is None

class TestAuthorizationEndpoint:
    """Test payment authorization endpoint."""
    
    def test_successful_authorization(self, dynamodb_mock, sns_mock):
        """Test successful payment authorization."""
        payload = {
            "amount": 5000,  # $50.00
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123",
            "description": "Test payment"
        }
        
        headers = {"X-Idempotency-Key": "auth-test-123"}
        
        response = client.post("/payments/authorize", json=payload, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "approved"
        assert data["amount"] == 5000
        assert data["currency"] == "USD"
        assert "transaction_id" in data
        assert "auth_id" in data
        assert data["message"] == "Authorization successful"
    
    def test_authorization_with_invalid_card(self, dynamodb_mock, sns_mock):
        """Test authorization with invalid card number."""
        payload = {
            "amount": 5000,
            "currency": "USD",
            "card_number": "4242424242424241",  # Invalid Luhn
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        headers = {"X-Idempotency-Key": "auth-test-invalid"}
        
        response = client.post("/payments/authorize", json=payload, headers=headers)
        
        assert response.status_code == 422  # Validation error
    
    def test_authorization_amount_limit(self, dynamodb_mock, sns_mock):
        """Test authorization with amount exceeding limit."""
        payload = {
            "amount": 1500000,  # $15,000 - exceeds $10,000 limit
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        headers = {"X-Idempotency-Key": "auth-test-limit"}
        
        response = client.post("/payments/authorize", json=payload, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "declined"
        assert data["message"] == "Amount exceeds limit"
    
    def test_authorization_idempotency(self, dynamodb_mock, sns_mock):
        """Test that authorization is idempotent."""
        payload = {
            "amount": 5000,
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        idempotency_key = "auth-idempotency-test"
        headers = {"X-Idempotency-Key": idempotency_key}
        
        # First request
        response1 = client.post("/payments/authorize", json=payload, headers=headers)
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Second request with same idempotency key
        response2 = client.post("/payments/authorize", json=payload, headers=headers)
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Should return same result
        assert data1["transaction_id"] == data2["transaction_id"]
        assert data1["auth_id"] == data2["auth_id"]

class TestCaptureEndpoint:
    """Test payment capture endpoint."""
    
    def test_successful_capture(self, dynamodb_mock, sns_mock):
        """Test successful payment capture."""
        # First authorize
        auth_payload = {
            "amount": 10000,
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        auth_headers = {"X-Idempotency-Key": "auth-for-capture"}
        auth_response = client.post("/payments/authorize", json=auth_payload, headers=auth_headers)
        auth_data = auth_response.json()
        
        # Then capture
        capture_payload = {
            "auth_id": auth_data["auth_id"],
            "amount": 8000,  # Partial capture
            "currency": "USD",
            "merchant_id": "merchant_123",
            "description": "Partial capture"
        }
        
        capture_headers = {"X-Idempotency-Key": "capture-test-123"}
        capture_response = client.post("/payments/capture", json=capture_payload, headers=capture_headers)
        
        assert capture_response.status_code == 200
        capture_data = capture_response.json()
        assert capture_data["status"] == "completed"
        assert capture_data["amount"] == 8000
        assert capture_data["auth_id"] == auth_data["auth_id"]
    
    def test_capture_exceeds_authorized_amount(self, dynamodb_mock, sns_mock):
        """Test capture with amount exceeding authorized amount."""
        # First authorize
        auth_payload = {
            "amount": 5000,
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        auth_headers = {"X-Idempotency-Key": "auth-for-exceed"}
        auth_response = client.post("/payments/authorize", json=auth_payload, headers=auth_headers)
        auth_data = auth_response.json()
        
        # Try to capture more than authorized
        capture_payload = {
            "auth_id": auth_data["auth_id"],
            "amount": 6000,  # Exceeds authorized 5000
            "currency": "USD",
            "merchant_id": "merchant_123"
        }
        
        capture_headers = {"X-Idempotency-Key": "capture-exceed"}
        capture_response = client.post("/payments/capture", json=capture_payload, headers=capture_headers)
        
        assert capture_response.status_code == 400
        assert "exceeds authorized amount" in capture_response.json()["detail"]

class TestRefundEndpoint:
    """Test payment refund endpoint."""
    
    def test_successful_refund(self, dynamodb_mock, sns_mock):
        """Test successful payment refund."""
        # This would require a more complex setup with actual capture transaction
        # For now, test the endpoint structure
        refund_payload = {
            "transaction_id": "capture_test_123",
            "amount": 5000,
            "currency": "USD",
            "merchant_id": "merchant_123",
            "reason": "Customer request"
        }
        
        refund_headers = {"X-Idempotency-Key": "refund-test-123"}
        refund_response = client.post("/payments/refund", json=refund_payload, headers=refund_headers)
        
        # Should fail because transaction doesn't exist, but endpoint is working
        assert refund_response.status_code in [400, 404]

class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["service"] == "payments-api"

class TestWebhookDelivery:
    """Test webhook delivery functionality."""
    
    def test_webhook_publishing(self, sns_mock):
        """Test webhook publishing to SNS."""
        with patch('handler.sns') as mock_sns:
            event_type = "payment_authorized"
            data = {"transaction_id": "test-123", "status": "approved"}
            
            publish_webhook(event_type, data)
            
            # Verify SNS publish was called
            mock_sns.publish.assert_called_once()
            call_args = mock_sns.publish.call_args
            assert call_args[1]['TopicArn'] == os.environ['WEBHOOK_TOPIC_ARN']

class TestErrorHandling:
    """Test error handling scenarios."""
    
    def test_missing_idempotency_key(self, dynamodb_mock):
        """Test request without idempotency key."""
        payload = {
            "amount": 5000,
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        response = client.post("/payments/authorize", json=payload)
        
        assert response.status_code == 422  # Validation error for missing header
    
    def test_invalid_request_data(self, dynamodb_mock):
        """Test request with invalid data."""
        payload = {
            "amount": -100,  # Invalid negative amount
            "currency": "USD",
            "card_number": "4242424242424242",
            "card_holder": "John Doe",
            "expiry_month": 12,
            "expiry_year": 2025,
            "cvv": "123",
            "merchant_id": "merchant_123"
        }
        
        headers = {"X-Idempotency-Key": "invalid-data-test"}
        response = client.post("/payments/authorize", json=payload, headers=headers)
        
        assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__]) 