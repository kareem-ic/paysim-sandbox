import React from 'react';

const Transactions: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-secondary-900">Transactions</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by card, merchant, or status..."
            className="px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
          />
          <select className="px-3 py-2 border border-secondary-200 rounded-lg text-sm bg-white">
            <option value="">All Types</option>
            <option value="authorization">Authorization</option>
            <option value="capture">Capture</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      </div>
      <div className="card-shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-100">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Merchant</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-100">
            {/* Placeholder rows */}
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="hover:bg-secondary-50 transition">
                <td className="px-4 py-2 text-sm text-secondary-700">txn_{i + 1}abc</td>
                <td className="px-4 py-2 text-sm text-secondary-700">authorization</td>
                <td className="px-4 py-2 text-sm text-secondary-700">$100.00</td>
                <td className="px-4 py-2 text-sm">
                  <span className="inline-block px-2 py-1 rounded bg-success-100 text-success-700 text-xs font-medium">approved</span>
                </td>
                <td className="px-4 py-2 text-sm text-secondary-500">2024-07-01</td>
                <td className="px-4 py-2 text-sm text-secondary-700">merchant_123</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-center text-secondary-400 text-sm">Pagination coming soon...</div>
      </div>
    </div>
  );
};

export default Transactions; 