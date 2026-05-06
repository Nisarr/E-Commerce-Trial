import React from 'react';
import { Printer, X } from 'lucide-react';

import type { Order } from '../../types';

interface InvoiceProps {
  order: Order;
  onClose: () => void;
}

export const Invoice: React.FC<InvoiceProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header Actions */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 no-print">
          <h2 className="text-2xl font-black font-garamond text-primary">Invoice {order.invoiceId}</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-primary rounded-xl font-bold transition-colors"
            >
              <Printer size={18} /> Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 overflow-y-auto flex-grow printable-invoice">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-black font-garamond text-primary mb-2">PlayPen House</h1>
              <p className="text-gray-500 text-sm">Dhaka, Bangladesh<br/>support@playpenhouse.com<br/>+880 1XXX-XXXXXX</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-gray-300 mb-2">INVOICE</h2>
              <p className="text-sm text-primary font-bold">#{order.invoiceId}</p>
              <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
              <p className="text-primary font-bold">{order.customerName}</p>
              {order.customerEmail && <p className="text-gray-500 text-sm">{order.customerEmail}</p>}
              <p className="text-gray-500 text-sm">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ship To</h3>
              <p className="text-gray-700 text-sm whitespace-pre-line">{order.shippingAddress}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
                <th className="py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-4 text-primary font-medium">{item.productName || `Product ID: ${item.productId.slice(0, 8)}`}</td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">৳{item.price.toLocaleString()}</td>
                  <td className="py-4 text-right text-primary font-bold">৳{(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal (Items)</span>
                <span>৳{(order.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 border-b border-gray-100 pb-3">
                <span>Shipping & Adjustments</span>
                <span>৳{(order.totalAmount - (order.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-primary pt-1">
                <span>Total</span>
                <span>৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-gray-400 text-sm font-medium">
            <p>Thank you for shopping with PlayPen House!</p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .printable-invoice, .printable-invoice * { visibility: visible; }
            .printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            .fixed { position: absolute; }
          }
        `}</style>
      </div>
    </div>
  );
};
