import React from 'react';
import { premiumAction } from '../premiumAction';
import { Bell, RotateCcw, TrendingUp, Sparkles, ShoppingBag } from 'lucide-react';

// ── Notification Preview ──
export const NotificationPreview: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between">
      <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><Bell size={24} /> Notifications</h2><p className="text-[var(--adm-text-secondary)] text-sm font-medium">Send push notifications to customers</p></div>
      <button onClick={() => premiumAction('Sending notifications')} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg">+ Send New</button>
    </div>
    <div className="bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-12 text-center">
      <Bell size={48} className="mx-auto text-[var(--adm-text-secondary)] opacity-20 mb-4" />
      <p className="font-black text-[var(--adm-text-primary)]">Push Notification Center</p>
      <p className="text-sm text-[var(--adm-text-secondary)] mt-2">Create and manage customer notifications, promotional alerts, and order updates.</p>
    </div>
  </div>
);

// ── Return Preview ──
export const ReturnPreview: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><RotateCcw size={24} /> Returns & Refunds</h2><p className="text-[var(--adm-text-secondary)] text-sm font-medium">Process return requests and issue refunds</p></div>
    <div className="bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-12 text-center">
      <RotateCcw size={48} className="mx-auto text-[var(--adm-text-secondary)] opacity-20 mb-4" />
      <p className="font-black text-[var(--adm-text-primary)]">Return Management System</p>
      <p className="text-sm text-[var(--adm-text-secondary)] mt-2">Handle return requests, process refunds, and track return shipments.</p>
      <button onClick={() => premiumAction('Managing returns')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm">View Return Requests</button>
    </div>
  </div>
);

// ── Best Selling Preview ──
export const BestSellingPreview: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between">
      <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><TrendingUp size={24} /> Best Selling</h2><p className="text-[var(--adm-text-secondary)] text-sm font-medium">Curate your best-selling products showcase</p></div>
      <button onClick={() => premiumAction('Managing best sellers')} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg">+ Add Products</button>
    </div>
    <div className="bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-12 text-center">
      <TrendingUp size={48} className="mx-auto text-[var(--adm-text-secondary)] opacity-20 mb-4" />
      <p className="font-black text-[var(--adm-text-primary)]">Best Sellers Showcase</p>
      <p className="text-sm text-[var(--adm-text-secondary)] mt-2">Tag and feature your top-performing products on the homepage.</p>
    </div>
  </div>
);

// ── New Arrival Preview ──
export const NewArrivalPreview: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between">
      <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><Sparkles size={24} /> New Arrivals</h2><p className="text-[var(--adm-text-secondary)] text-sm font-medium">Feature new products on the homepage</p></div>
      <button onClick={() => premiumAction('Managing new arrivals')} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg">+ Add Products</button>
    </div>
    <div className="bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-12 text-center">
      <Sparkles size={48} className="mx-auto text-[var(--adm-text-secondary)] opacity-20 mb-4" />
      <p className="font-black text-[var(--adm-text-primary)]">New Arrivals Section</p>
      <p className="text-sm text-[var(--adm-text-secondary)] mt-2">Curate and highlight your newest products with tabbed categories.</p>
    </div>
  </div>
);

// ── Product Buyers Preview ──
export const ProductBuyersPreview: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><ShoppingBag size={24} /> Product Buyers</h2><p className="text-[var(--adm-text-secondary)] text-sm font-medium">View purchase history per product</p></div>
    <div className="bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-12 text-center">
      <ShoppingBag size={48} className="mx-auto text-[var(--adm-text-secondary)] opacity-20 mb-4" />
      <p className="font-black text-[var(--adm-text-primary)]">Product Purchase Analytics</p>
      <p className="text-sm text-[var(--adm-text-secondary)] mt-2">See who bought each product, purchase dates, and order details.</p>
      <button onClick={() => premiumAction('Viewing product buyers')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm">View Analytics</button>
    </div>
  </div>
);
