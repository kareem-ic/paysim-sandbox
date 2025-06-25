#!/usr/bin/env python3
"""
Mock API Server for Local Development

This server provides mock endpoints that simulate the AWS Lambda API
for local frontend development and testing.
"""

import json
import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="Payments Sandbox Mock API",
    description="Mock API for local development",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
mock_transactions = []
mock_metrics = {}
mock_webhook_events = []
mock_webhook_endpoints = []

# Pydantic models
class TransactionRequest(BaseModel):
    amount: int = Field(..., gt=0)
    currency: str = Field(default="USD")
    type: str = Field(default="authorization")
    merchant_id: str = Field(..., min_length=1)
    description: str = Field(default="")
    metadata: Dict[str, Any] = Field(default_factory=dict)

class WebhookEndpointRequest(BaseModel):
    url: str = Field(..., min_length=1)
    events: List[str] = Field(default_factory=list)
    description: str = Field(default="")

# Initialize mock data
def initialize_mock_data():
    """Initialize mock data for development with realistic values"""
    global mock_transactions, mock_metrics, mock_webhook_events
    merchant_names = [
        "Amazon", "Visa", "Starbucks", "Apple", "Netflix", "Uber", "Delta Airlines", "Walmart", "Target", "Shell Oil"
    ]
    card_brands = ["Visa", "Mastercard", "Amex", "Discover"]
    descriptions = [
        "Online purchase", "Coffee shop", "Subscription renewal", "Flight booking", "Grocery shopping",
        "Fuel purchase", "Electronics", "Streaming service", "Ride share", "Retail store"
    ]
    for i in range(50):
        merchant = merchant_names[i % len(merchant_names)]
        card_brand = card_brands[i % len(card_brands)]
        transaction = {
            "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
            "type": random.choice(["authorization", "capture", "refund"]),
            "amount": random.randint(500, 50000),  # $5 to $500
            "currency": "USD",
            "status": random.choice(["approved", "completed", "failed"]),
            "merchant_id": merchant.lower().replace(" ", "_"),
            "merchant_name": merchant,
            "card_brand": card_brand,
            "created_at": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).isoformat(),
            "description": random.choice(descriptions)
        }
        mock_transactions.append(transaction)
    
    # Generate mock metrics
    mock_metrics.update({
        "total_transactions": len(mock_transactions),
        "total_volume": sum(t["amount"] for t in mock_transactions),
        "success_rate": 95.2,
        "active_merchants": 10,
        "transaction_growth_rate": 12.5,
        "volume_growth_rate": 8.3,
        "success_rate_change": 2.1,
        "merchant_growth_rate": 15.0,
        "daily_volume": [random.randint(50000, 200000) for _ in range(7)],
        "transaction_types": [
            {"type": "authorization", "count": 25},
            {"type": "capture", "count": 20},
            {"type": "refund", "count": 5}
        ],
        "recent_activity": [
            {
                "type": "transaction",
                "description": "New payment authorized",
                "timestamp": datetime.utcnow().isoformat(),
                "time_ago": "2 minutes ago"
            },
            {
                "type": "webhook",
                "description": "Webhook delivered successfully",
                "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                "time_ago": "5 minutes ago"
            }
        ]
    })
    
    # Generate mock webhook events
    for i in range(20):
        event = {
            "event_id": f"evt_{uuid.uuid4().hex[:16]}",
            "event_type": random.choice(["transaction.created", "transaction.updated", "payment.succeeded"]),
            "status": random.choice(["delivered", "failed", "pending"]),
            "endpoint_url": f"https://webhook.site/{uuid.uuid4().hex[:8]}",
            "response_time": random.randint(50, 500) if random.random() > 0.2 else None,
            "created_at": (datetime.utcnow() - timedelta(hours=random.randint(0, 24))).isoformat()
        }
        mock_webhook_events.append(event)

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    initialize_mock_data()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "payments-mock-api"
    }

# Mock transactions endpoint
@app.get("/mock/transactions")
async def get_transactions():
    return mock_transactions

# Mock metrics endpoint
@app.get("/mock/metrics")
async def get_metrics():
    return mock_metrics

# Mock webhook events endpoint
@app.get("/mock/webhooks")
async def get_webhook_events():
    return mock_webhook_events

# Mock webhook endpoints endpoint
@app.get("/mock/webhook-endpoints")
async def get_webhook_endpoints():
    return mock_webhook_endpoints

# Create webhook endpoint
@app.post("/mock/webhook-endpoints")
async def create_webhook_endpoint(request: WebhookEndpointRequest):
    endpoint = {
        "id": f"webhook_{uuid.uuid4().hex[:16]}",
        "url": request.url,
        "events": request.events,
        "description": request.description,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    mock_webhook_endpoints.append(endpoint)
    return endpoint

# Create transaction endpoint
@app.post("/mock/transactions")
async def create_transaction(request: TransactionRequest):
    transaction = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
        "type": request.type,
        "amount": request.amount,
        "currency": request.currency,
        "status": "approved" if random.random() > 0.1 else "failed",
        "merchant_id": request.merchant_id,
        "created_at": datetime.utcnow().isoformat(),
        "description": request.description
    }
    mock_transactions.append(transaction)
    
    # Update metrics
    mock_metrics["total_transactions"] += 1
    mock_metrics["total_volume"] += request.amount
    
    return transaction

# Real payment endpoints (simplified for mock)
@app.post("/payments/authorize")
async def authorize_payment(request: TransactionRequest, x_idempotency_key: str = Header(...)):
    return await create_transaction(request)

@app.post("/payments/capture")
async def capture_payment(request: TransactionRequest, x_idempotency_key: str = Header(...)):
    return await create_transaction(request)

@app.post("/payments/refund")
async def refund_payment(request: TransactionRequest, x_idempotency_key: str = Header(...)):
    return await create_transaction(request)

# --- ALIAS ROUTES for frontend compatibility ---
@app.get("/metrics")
async def get_metrics_alias():
    return await get_metrics()

@app.get("/transactions")
async def get_transactions_alias():
    return await get_transactions()

@app.get("/webhooks/events")
async def get_webhook_events_alias():
    return await get_webhook_events()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000) 