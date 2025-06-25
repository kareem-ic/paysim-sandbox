import React, { useState } from 'react';
import { useTransactions } from '../api/hooks';

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const { data: transactions, isLoading, error } = useTransactions();

  // Filter transactions based on search and type
  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || transaction.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Transactions</h2>
        </div>
        <div className="card-shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-secondary-600">Loading transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Transactions</h2>
        </div>
        <div className="card-shadow p-8">
          <div className="text-center">
            <div className="text-error-600 text-lg font-medium mb-2">Failed to load transactions</div>
            <div className="text-secondary-600">Please try again later</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-secondary-900">Transactions</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by ID, merchant, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
          />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-secondary-200 rounded-lg text-sm bg-white"
          >
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
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-secondary-500">
                  {searchTerm || filterType ? 'No transactions match your filters' : 'No transactions found'}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.transaction_id} className="hover:bg-secondary-50 transition">
                  <td className="px-4 py-2 text-sm text-secondary-700 font-mono">{transaction.transaction_id}</td>
                  <td className="px-4 py-2 text-sm text-secondary-700 capitalize">{transaction.type}</td>
                  <td className="px-4 py-2 text-sm text-secondary-700">
                    ${(transaction.amount / 100).toFixed(2)} {transaction.currency}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      transaction.status === 'approved' || transaction.status === 'completed'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-error-100 text-error-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-700">{transaction.merchant_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredTransactions.length > 0 && (
          <div className="p-4 text-center text-secondary-400 text-sm">
            Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 