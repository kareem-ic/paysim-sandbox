import React, { useState } from 'react';
import { useWebhookEvents, useAddWebhookEndpoint } from '../api/hooks';

const Webhooks: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: ['transaction.created', 'transaction.updated'],
    description: ''
  });

  const { data: webhookEvents, isLoading, error } = useWebhookEvents();
  const createWebhookMutation = useAddWebhookEndpoint();

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebhookMutation.mutateAsync(newWebhook);
      setShowCreateForm(false);
      setNewWebhook({ url: '', events: ['transaction.created', 'transaction.updated'], description: '' });
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Webhooks</h2>
        </div>
        <div className="card-shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-secondary-600">Loading webhook events...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Webhooks</h2>
        </div>
        <div className="card-shadow p-8">
          <div className="text-center">
            <div className="text-error-600 text-lg font-medium mb-2">Failed to load webhook events</div>
            <div className="text-secondary-600">Please try again later</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-secondary-900">Webhooks</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Add Webhook Endpoint
        </button>
      </div>

      {/* Create Webhook Form */}
      {showCreateForm && (
        <div className="card-shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Create New Webhook Endpoint</h3>
          <form onSubmit={handleCreateWebhook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Webhook URL</label>
              <input
                type="url"
                required
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://your-domain.com/webhook"
                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Events</label>
              <div className="space-y-2">
                {['transaction.created', 'transaction.updated', 'transaction.failed', 'payment.succeeded'].map((event) => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                        } else {
                          setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-secondary-700">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Description (Optional)</label>
              <input
                type="text"
                value={newWebhook.description}
                onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
                placeholder="Production webhook endpoint"
                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createWebhookMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhook Events Table */}
      <div className="card-shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-100">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Event ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Endpoint</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Response Time</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-100">
            {webhookEvents?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-secondary-500">
                  No webhook events found
                </td>
              </tr>
            ) : (
              webhookEvents?.map((event) => (
                <tr key={event.event_id} className="hover:bg-secondary-50 transition">
                  <td className="px-4 py-2 text-sm text-secondary-700 font-mono">{event.event_id}</td>
                  <td className="px-4 py-2 text-sm text-secondary-700">{event.event_type}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'delivered' 
                        ? 'bg-success-100 text-success-700'
                        : event.status === 'failed'
                        ? 'bg-error-100 text-error-700'
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-700 font-mono truncate max-w-xs">
                    {event.endpoint_url}
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-700">
                    {event.response_time ? `${event.response_time}ms` : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-500">
                    {new Date(event.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {webhookEvents && webhookEvents.length > 0 && (
          <div className="p-4 text-center text-secondary-400 text-sm">
            Showing {webhookEvents.length} webhook events
          </div>
        )}
      </div>

      {/* Webhook Documentation */}
      <div className="card-shadow p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Webhook Documentation</h3>
        <div className="space-y-4 text-sm text-secondary-700">
          <p>
            Webhooks allow you to receive real-time notifications when events occur in your account. 
            Each webhook event includes a JSON payload with relevant transaction data.
          </p>
          <div className="bg-secondary-50 p-4 rounded-lg">
            <h4 className="font-medium text-secondary-900 mb-2">Example Webhook Payload:</h4>
            <pre className="text-xs overflow-x-auto">
{`{
  "event_id": "evt_123456789",
  "event_type": "transaction.created",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "transaction_id": "txn_123456789",
    "amount": 1000,
    "currency": "USD",
    "status": "pending",
    "merchant_id": "merchant_123"
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webhooks; 