import React from 'react';
import { CreditCard, Construction } from 'lucide-react';

export const PaymentOptions: React.FC = () => (
  <div className="account-placeholder">
    <div className="account-placeholder-icon" style={{ backgroundColor: '#8B5CF615', color: '#8B5CF6' }}>
      <CreditCard size={40} />
    </div>
    <h2>Payment Options</h2>
    <p>Manage your saved payment methods and preferences. Payment gateway integration coming soon!</p>
    <div className="account-placeholder-badge">
      <Construction size={14} />
      Coming Soon — Stripe/SSLCommerz
    </div>
  </div>
);
