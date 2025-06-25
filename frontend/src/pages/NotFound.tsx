import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
        <circle cx="60" cy="60" r="56" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="4" />
        <ellipse cx="60" cy="80" rx="28" ry="8" fill="#DBEAFE" />
        <circle cx="48" cy="54" r="6" fill="#3B82F6" />
        <circle cx="72" cy="54" r="6" fill="#3B82F6" />
        <path d="M50 70 Q60 78 70 70" stroke="#64748B" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <h1 className="text-4xl font-bold text-primary-600 mb-2">404</h1>
      <p className="text-lg text-secondary-700 mb-4">Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" className="px-6 py-2 bg-primary-600 text-white rounded-lg shadow-soft hover:bg-primary-700 transition font-medium">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound; 