"""
Locust load test for Serverless Payments Sandbox API

Simulates high-throughput payment flows including:
- Authorization
- Capture
- Refund
- Idempotency key usage
"""

import random
import string
from locust import HttpUser, task, between

class PaymentsUser(HttpUser):
    wait_time = between(0.01, 0.1)
    api_key = "YOUR_API_KEY"  # Replace with a real API key
    base_headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }

    def random_card(self):
        # Always returns a valid Visa test card
        return "4242424242424242"

    def random_idempotency_key(self):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

    @task(5)
    def authorize(self):
        payload = {
            "amount": random.randint(100, 10000),
            "currency": "USD",
            "card_number": self.random_card(),
            "card_holder": "Test User",
            "expiry_month": random.randint(1, 12),
            "expiry_year": 2026,
            "cvv": "123",
            "merchant_id": "merchant_locust",
            "description": "Load test auth"
        }
        headers = self.base_headers.copy()
        headers["X-Idempotency-Key"] = self.random_idempotency_key()
        self.client.post("/payments/authorize", json=payload, headers=headers)

    @task(2)
    def capture(self):
        # For demo, use a static auth_id (in real test, chain with authorize)
        payload = {
            "auth_id": "auth_test_locust",
            "amount": random.randint(100, 10000),
            "currency": "USD",
            "merchant_id": "merchant_locust",
            "description": "Load test capture"
        }
        headers = self.base_headers.copy()
        headers["X-Idempotency-Key"] = self.random_idempotency_key()
        self.client.post("/payments/capture", json=payload, headers=headers)

    @task(1)
    def refund(self):
        # For demo, use a static transaction_id (in real test, chain with capture)
        payload = {
            "transaction_id": "capture_test_locust",
            "amount": random.randint(100, 10000),
            "currency": "USD",
            "merchant_id": "merchant_locust",
            "reason": "Load test refund"
        }
        headers = self.base_headers.copy()
        headers["X-Idempotency-Key"] = self.random_idempotency_key()
        self.client.post("/payments/refund", json=payload, headers=headers) 