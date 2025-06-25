import React, { useState } from 'react';
import { useCreateTransaction } from '../api/hooks';

interface PaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    type: 'authorization',
    merchant_id: '',
    description: '',
    metadata: {}
  });

  const createTransactionMutation = useCreateTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.merchant_id) {
      return;
    }

    try {
      const amount = Math.round(parseFloat(formData.amount) * 100); // Convert to cents
      await createTransactionMutation.mutateAsync({
        amount,
        currency: formData.currency,
        type: formData.type,
        merchant_id: formData.merchant_id,
        description: formData.description,
        metadata: formData.metadata
      });
      
      // Reset form
      setFormData({
        amount: '',
        currency: 'USD',
        type: 'authorization',
        merchant_id: '',
        description: '',
        metadata: {}
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card-shadow p-6">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Create New Transaction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-secondary-500">$</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Transaction Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="authorization">Authorization</option>
              <option value="capture">Capture</option>
              <option value="refund">Refund</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Merchant ID *
            </label>
            <input
              type="text"
              required
              value={formData.merchant_id}
              onChange={(e) => handleInputChange('merchant_id', e.target.value)}
              placeholder="merchant_123"
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Payment for services"
            className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={createTransactionMutation.isPending || !formData.amount || !formData.merchant_id}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTransactionMutation.isPending ? 'Creating...' : 'Create Transaction'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-50"
            >
              Cancel
            </button>
          )}
        </div>

        {createTransactionMutation.isError && (
          <div className="text-error-600 text-sm">
            Failed to create transaction. Please try again.
          </div>
        )}
      </form>
    </div>
  );
};

export default PaymentForm; 