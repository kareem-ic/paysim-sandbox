import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-secondary-900 mb-2">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metrics cards */}
        <div className="card-shadow p-6 flex flex-col items-start">
          <span className="text-secondary-500 text-xs mb-1">Total Payments</span>
          <span className="text-3xl font-bold text-primary-600">$12,340</span>
          <span className="text-success-600 text-xs mt-2">+8% this week</span>
        </div>
        <div className="card-shadow p-6 flex flex-col items-start">
          <span className="text-secondary-500 text-xs mb-1">API Latency (P95)</span>
          <span className="text-3xl font-bold text-primary-600">42ms</span>
          <span className="text-success-600 text-xs mt-2">Fast</span>
        </div>
        <div className="card-shadow p-6 flex flex-col items-start">
          <span className="text-secondary-500 text-xs mb-1">Error Rate</span>
          <span className="text-3xl font-bold text-primary-600">0.2%</span>
          <span className="text-success-600 text-xs mt-2">Healthy</span>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-shadow p-6">
          <h3 className="font-semibold text-secondary-800 mb-2">Payments Volume</h3>
          <div className="h-48 flex items-center justify-center text-secondary-400">
            {/* Placeholder for chart */}
            <span>Chart coming soon...</span>
          </div>
        </div>
        <div className="card-shadow p-6">
          <h3 className="font-semibold text-secondary-800 mb-2">API TPS (Requests/sec)</h3>
          <div className="h-48 flex items-center justify-center text-secondary-400">
            {/* Placeholder for chart */}
            <span>Chart coming soon...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 