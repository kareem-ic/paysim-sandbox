"""
FastAPI Lambda Handler for Serverless Payments Sandbox

This module implements the core payment processing logic including:
- Card authorization
- Payment capture
- Refund processing
- Idempotency handling
- Webhook delivery
"""

import json
import os
import uuid
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

import boto3
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic import BaseModel, Field, validator

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
table = dynamodb.Table(os.environ['PAYMENTS_TABLE'])
webhook_topic_arn = os.environ['WEBHOOK_TOPIC_ARN']

# Initialize FastAPI app
app = FastAPI(
    title="Serverless Payments Sandbox API",
    description="A production-grade REST API sandbox for payment simulation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Pydantic models for request/response validation
class AuthorizationRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Amount in cents")
    currency: str = Field(default="USD", max_length=3)
    card_number: str = Field(..., min_length=13, max_length=19)
    card_holder: str = Field(..., min_length=1, max_length=100)
    expiry_month: int = Field(..., ge=1, le=12)
    expiry_year: int = Field(..., ge=2024)
    cvv: str = Field(..., min_length=3, max_length=4)
    merchant_id: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

    @validator('card_number')
    def validate_card_number(cls, v):
        # Basic Luhn algorithm check
        if not v.isdigit():
            raise ValueError('Card number must contain only digits')
        
        digits = [int(d) for d in v]
        checksum = 0
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        checksum += sum(odd_digits)
        for d in even_digits:
            checksum += sum(divmod(d * 2, 10))
        
        if checksum % 10 != 0:
            raise ValueError('Invalid card number')
        return v

class CaptureRequest(BaseModel):
    auth_id: str = Field(..., min_length=1, max_length=50)
    amount: int = Field(..., gt=0, description="Amount in cents")
    currency: str = Field(default="USD", max_length=3)
    merchant_id: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class RefundRequest(BaseModel):
    transaction_id: str = Field(..., min_length=1, max_length=50)
    amount: int = Field(..., gt=0, description="Amount in cents")
    currency: str = Field(default="USD", max_length=3)
    merchant_id: str = Field(..., min_length=1, max_length=50)
    reason: Optional[str] = Field(None, max_length=200)

class PaymentResponse(BaseModel):
    transaction_id: str
    status: str
    amount: int
    currency: str
    created_at: str
    auth_id: Optional[str] = None
    message: Optional[str] = None

def generate_hmac_signature(payload: str, secret: str) -> str:
    """Generate HMAC signature for webhook security"""
    return hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def publish_webhook(event_type: str, data: Dict[str, Any]) -> None:
    """Publish webhook event to SNS"""
    try:
        webhook_payload = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        
        # In production, get secret from SSM Parameter Store
        secret = "webhook-secret-key"  # Replace with SSM lookup
        signature = generate_hmac_signature(json.dumps(webhook_payload), secret)
        
        message = {
            "payload": webhook_payload,
            "signature": signature
        }
        
        sns.publish(
            TopicArn=webhook_topic_arn,
            Message=json.dumps(message),
            MessageAttributes={
                'event_type': {
                    'DataType': 'String',
                    'StringValue': event_type
                }
            }
        )
    except Exception as e:
        print(f"Failed to publish webhook: {e}")

def check_idempotency(idempotency_key: str, operation: str) -> Optional[Dict[str, Any]]:
    """Check for existing transaction with same idempotency key"""
    try:
        response = table.get_item(
            Key={
                'transaction_id': f"{operation}_{idempotency_key}",
                'created_at': 'idempotency_check'
            }
        )
        return response.get('Item')
    except Exception:
        return None

def store_idempotency_key(idempotency_key: str, operation: str, result: Dict[str, Any]) -> None:
    """Store idempotency key with result"""
    try:
        table.put_item(
            Item={
                'transaction_id': f"{operation}_{idempotency_key}",
                'created_at': 'idempotency_check',
                'result': result,
                'ttl': int((datetime.utcnow() + timedelta(hours=24)).timestamp())
            }
        )
    except Exception as e:
        print(f"Failed to store idempotency key: {e}")

@app.post("/payments/authorize", response_model=PaymentResponse)
async def authorize_payment(
    request: AuthorizationRequest,
    x_idempotency_key: str = Header(..., alias="X-Idempotency-Key")
):
    """Authorize a payment transaction"""
    
    # Check idempotency
    existing = check_idempotency(x_idempotency_key, "authorize")
    if existing:
        return PaymentResponse(**existing['result'])
    
    # Generate transaction ID
    transaction_id = f"auth_{uuid.uuid4().hex[:16]}"
    auth_id = f"auth_{uuid.uuid4().hex[:12]}"
    
    # Simulate authorization logic
    # In production, this would integrate with payment processors
    status = "approved"
    if request.amount > 1000000:  # $10,000 limit
        status = "declined"
    
    # Store transaction
    item = {
        'transaction_id': transaction_id,
        'created_at': datetime.utcnow().isoformat(),
        'type': 'authorization',
        'status': status,
        'amount': request.amount,
        'currency': request.currency,
        'card_number': request.card_number[-4:],  # Only store last 4 digits
        'card_holder': request.card_holder,
        'merchant_id': request.merchant_id,
        'description': request.description,
        'auth_id': auth_id,
        'ttl': int((datetime.utcnow() + timedelta(days=30)).timestamp())
    }
    
    try:
        table.put_item(Item=item)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to store transaction")
    
    # Prepare response
    response_data = {
        'transaction_id': transaction_id,
        'status': status,
        'amount': request.amount,
        'currency': request.currency,
        'created_at': item['created_at'],
        'auth_id': auth_id,
        'message': 'Authorization successful' if status == 'approved' else 'Amount exceeds limit'
    }
    
    # Store idempotency key
    store_idempotency_key(x_idempotency_key, "authorize", response_data)
    
    # Publish webhook
    publish_webhook("payment_authorized", response_data)
    
    return PaymentResponse(**response_data)

@app.post("/payments/capture", response_model=PaymentResponse)
async def capture_payment(
    request: CaptureRequest,
    x_idempotency_key: str = Header(..., alias="X-Idempotency-Key")
):
    """Capture a previously authorized payment"""
    
    # Check idempotency
    existing = check_idempotency(x_idempotency_key, "capture")
    if existing:
        return PaymentResponse(**existing['result'])
    
    # Find original authorization
    try:
        response = table.query(
            IndexName='card_id_index',
            KeyConditionExpression='card_id = :auth_id',
            FilterExpression='#type = :type',
            ExpressionAttributeNames={'#type': 'type'},
            ExpressionAttributeValues={
                ':auth_id': request.auth_id,
                ':type': 'authorization'
            }
        )
        
        auth_items = response.get('Items', [])
        if not auth_items:
            raise HTTPException(status_code=404, detail="Authorization not found")
        
        auth_item = auth_items[0]
        if auth_item['status'] != 'approved':
            raise HTTPException(status_code=409, detail="Authorization not approved")
        
        if request.amount > auth_item['amount']:
            raise HTTPException(status_code=400, detail="Capture amount exceeds authorized amount")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Failed to retrieve authorization")
    
    # Generate capture transaction ID
    transaction_id = f"capture_{uuid.uuid4().hex[:16]}"
    
    # Store capture transaction
    item = {
        'transaction_id': transaction_id,
        'created_at': datetime.utcnow().isoformat(),
        'type': 'capture',
        'status': 'completed',
        'amount': request.amount,
        'currency': request.currency,
        'merchant_id': request.merchant_id,
        'description': request.description,
        'auth_id': request.auth_id,
        'original_auth_id': auth_item['auth_id'],
        'ttl': int((datetime.utcnow() + timedelta(days=30)).timestamp())
    }
    
    try:
        table.put_item(Item=item)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to store capture transaction")
    
    # Prepare response
    response_data = {
        'transaction_id': transaction_id,
        'status': 'completed',
        'amount': request.amount,
        'currency': request.currency,
        'created_at': item['created_at'],
        'auth_id': request.auth_id,
        'message': 'Payment captured successfully'
    }
    
    # Store idempotency key
    store_idempotency_key(x_idempotency_key, "capture", response_data)
    
    # Publish webhook
    publish_webhook("payment_captured", response_data)
    
    return PaymentResponse(**response_data)

@app.post("/payments/refund", response_model=PaymentResponse)
async def refund_payment(
    request: RefundRequest,
    x_idempotency_key: str = Header(..., alias="X-Idempotency-Key")
):
    """Refund a captured payment"""
    
    # Check idempotency
    existing = check_idempotency(x_idempotency_key, "refund")
    if existing:
        return PaymentResponse(**existing['result'])
    
    # Find original transaction
    try:
        response = table.get_item(
            Key={
                'transaction_id': request.transaction_id,
                'created_at': 'capture'  # This would need proper lookup logic
            }
        )
        
        original_item = response.get('Item')
        if not original_item:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if original_item['type'] != 'capture':
            raise HTTPException(status_code=400, detail="Can only refund captured payments")
        
        if request.amount > original_item['amount']:
            raise HTTPException(status_code=400, detail="Refund amount exceeds captured amount")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Failed to retrieve transaction")
    
    # Generate refund transaction ID
    transaction_id = f"refund_{uuid.uuid4().hex[:16]}"
    
    # Store refund transaction
    item = {
        'transaction_id': transaction_id,
        'created_at': datetime.utcnow().isoformat(),
        'type': 'refund',
        'status': 'completed',
        'amount': request.amount,
        'currency': request.currency,
        'merchant_id': request.merchant_id,
        'reason': request.reason,
        'original_transaction_id': request.transaction_id,
        'ttl': int((datetime.utcnow() + timedelta(days=30)).timestamp())
    }
    
    try:
        table.put_item(Item=item)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to store refund transaction")
    
    # Prepare response
    response_data = {
        'transaction_id': transaction_id,
        'status': 'completed',
        'amount': request.amount,
        'currency': request.currency,
        'created_at': item['created_at'],
        'message': 'Refund processed successfully'
    }
    
    # Store idempotency key
    store_idempotency_key(x_idempotency_key, "refund", response_data)
    
    # Publish webhook
    publish_webhook("payment_refunded", response_data)
    
    return PaymentResponse(**response_data)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "payments-api"
    }

# Lambda handler
def lambda_handler(event, context):
    """AWS Lambda handler function"""
    asgi_handler = Mangum(app)
    return asgi_handler(event, context) 