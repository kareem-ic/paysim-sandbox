import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-soft border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">PaySim Sandbox</h1>
                <p className="text-xs text-secondary-500">Serverless Payments</p>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/transactions') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              Transactions
            </Link>
            <Link
              to="/webhooks"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/webhooks') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              Webhooks
            </Link>
            <Link
              to="/api-docs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/api-docs') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              API Docs
            </Link>
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-secondary-600">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-slow"></div>
              <span>API Status: Healthy</span>
            </div>
            <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-secondary-700">U</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-secondary-200">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/transactions') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Transactions
            </Link>
            <Link
              to="/webhooks"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/webhooks') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Webhooks
            </Link>
            <Link
              to="/api-docs"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/api-docs') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              API Docs
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 