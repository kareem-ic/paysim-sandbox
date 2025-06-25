import React from 'react';

const ApiDocs: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-secondary-900 mb-2">API Documentation</h2>
      
      {/* Quick start */}
      <div className="card-shadow p-6">
        <h3 className="font-semibold text-secondary-800 mb-4">Quick Start</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary-600 mb-2">Base URL:</p>
            <code className="bg-secondary-100 px-2 py-1 rounded text-sm font-mono">https://api.paysim-sandbox.com/v1</code>
          </div>
          <div>
            <p className="text-sm text-secondary-600 mb-2">Authentication:</p>
            <code className="bg-secondary-100 px-2 py-1 rounded text-sm font-mono">x-api-key: YOUR_API_KEY</code>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        <div className="card-shadow p-6">
          <h3 className="font-semibold text-secondary-800 mb-4">Authorize Payment</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">POST</span>
              <code className="text-sm font-mono">/payments/authorize</code>
            </div>
            <div>
              <p className="text-sm text-secondary-600 mb-2">Request Body:</p>
              <pre className="bg-secondary-100 p-4 rounded text-sm font-mono overflow-x-auto">
{`{
  "amount": 5000,
  "currency": "USD",
  "card_number": "4242424242424242",
  "card_holder": "John Doe",
  "expiry_month": 12,
  "expiry_year": 2025,
  "cvv": "123",
  "merchant_id": "merchant_123"
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="card-shadow p-6">
          <h3 className="font-semibold text-secondary-800 mb-4">Capture Payment</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">POST</span>
              <code className="text-sm font-mono">/payments/capture</code>
            </div>
            <div>
              <p className="text-sm text-secondary-600 mb-2">Request Body:</p>
              <pre className="bg-secondary-100 p-4 rounded text-sm font-mono overflow-x-auto">
{`{
  "auth_id": "auth_xyz456...",
  "amount": 5000,
  "currency": "USD",
  "merchant_id": "merchant_123"
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="card-shadow p-6">
          <h3 className="font-semibold text-secondary-800 mb-4">Refund Payment</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">POST</span>
              <code className="text-sm font-mono">/payments/refund</code>
            </div>
            <div>
              <p className="text-sm text-secondary-600 mb-2">Request Body:</p>
              <pre className="bg-secondary-100 p-4 rounded text-sm font-mono overflow-x-auto">
{`{
  "transaction_id": "capture_abc123...",
  "amount": 5000,
  "currency": "USD",
  "merchant_id": "merchant_123",
  "reason": "Customer request"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs; 