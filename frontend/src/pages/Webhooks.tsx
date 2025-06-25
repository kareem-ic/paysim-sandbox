import React from 'react';

const Webhooks: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-secondary-900">Webhooks</h2>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
          Add Endpoint
        </button>
      </div>
      
      {/* Webhook configuration */}
      <div className="card-shadow p-6">
        <h3 className="font-semibold text-secondary-800 mb-4">Webhook Endpoints</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">https://example.com/webhooks</p>
              <p className="text-sm text-secondary-500">payment_authorized, payment_captured</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block px-2 py-1 rounded bg-success-100 text-success-700 text-xs font-medium">Active</span>
              <button className="text-secondary-400 hover:text-secondary-600">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Event logs */}
      <div className="card-shadow">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="font-semibold text-secondary-800">Recent Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-100">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Event</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="hover:bg-secondary-50 transition">
                  <td className="px-4 py-2 text-sm text-secondary-700">payment_authorized</td>
                  <td className="px-4 py-2 text-sm text-secondary-700">example.com</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="inline-block px-2 py-1 rounded bg-success-100 text-success-700 text-xs font-medium">Delivered</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-500">2 minutes ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Webhooks; 