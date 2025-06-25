import React from 'react';
import { useMetrics } from '../api/hooks';

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading, error } = useMetrics();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Dashboard</h2>
        </div>
        <div className="card-shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-secondary-600">Loading metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">Dashboard</h2>
        </div>
        <div className="card-shadow p-8">
          <div className="text-center">
            <div className="text-error-600 text-lg font-medium mb-2">Failed to load metrics</div>
            <div className="text-secondary-600">Please try again later</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-secondary-900">Dashboard</h2>
        <div className="text-sm text-secondary-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Transactions</p>
              <p className="text-2xl font-bold text-secondary-900">
                {metrics?.total_transactions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success-600 font-medium">
              +{metrics?.transaction_growth_rate || 0}% from last month
            </span>
          </div>
        </div>

        <div className="card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Volume</p>
              <p className="text-2xl font-bold text-secondary-900">
                ${((metrics?.total_volume || 0) / 100).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-success-100 rounded-lg">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success-600 font-medium">
              +{metrics?.volume_growth_rate || 0}% from last month
            </span>
          </div>
        </div>

        <div className="card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Success Rate</p>
              <p className="text-2xl font-bold text-secondary-900">
                {metrics?.success_rate || 0}%
              </p>
            </div>
            <div className="p-2 bg-warning-100 rounded-lg">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success-600 font-medium">
              +{metrics?.success_rate_change || 0}% from last month
            </span>
          </div>
        </div>

        <div className="card-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Active Merchants</p>
              <p className="text-2xl font-bold text-secondary-900">
                {metrics?.active_merchants || 0}
              </p>
            </div>
            <div className="p-2 bg-info-100 rounded-lg">
              <svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-success-600 font-medium">
              +{metrics?.merchant_growth_rate || 0}% from last month
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Transaction Volume (Last 7 Days)</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {metrics?.daily_volume?.map((volume, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t"
                  style={{ height: `${(volume / Math.max(...(metrics?.daily_volume || [1]))) * 200}px` }}
                ></div>
                <span className="text-xs text-secondary-500 mt-2">
                  {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Transaction Types</h3>
          <div className="space-y-4">
            {metrics?.transaction_types?.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4] }}
                  ></div>
                  <span className="text-sm font-medium text-secondary-700 capitalize">{type.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-secondary-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(type.count / Math.max(...(metrics?.transaction_types?.map(t => t.count) || [1]))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-secondary-600 w-12 text-right">{type.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-shadow p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {metrics?.recent_activity?.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'transaction' ? 'bg-primary-500' : 'bg-success-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">{activity.description}</p>
                <p className="text-xs text-secondary-500">{activity.timestamp}</p>
              </div>
              <span className="text-xs text-secondary-400">{activity.time_ago}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 