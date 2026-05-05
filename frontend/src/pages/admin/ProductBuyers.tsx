import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Calendar, 
  FileText, 
  ShoppingBag, 
  Clock,
  ExternalLink
} from 'lucide-react';
import type { ProductSale, Product } from '../../types';
import dayjs from 'dayjs';

export const ProductBuyers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState<ProductSale[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, buyersRes] = await Promise.all([
          fetch(`/api/v1/products/${id}`).then(res => res.json()),
          fetch(`/api/v1/products/${id}/buyers`).then(res => res.json())
        ]);
        
        setProduct(productRes);
        setBuyers(buyersRes.items || []);
      } catch (error) {
        console.error('Error fetching product buyers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const filteredBuyers = buyers.filter(buyer => 
    buyer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.customerPhone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-muted hover:text-primary hover:border-gray-200 transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-primary flex items-center gap-3">
              Product Buyers
              <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">
                {buyers.length} {buyers.length === 1 ? 'Customer' : 'Customers'}
              </span>
            </h1>
            <p className="text-sm text-muted font-medium mt-1">
              Sales history for <span className="text-primary font-bold">{product?.title}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Total Customers</div>
              <div className="text-2xl font-black text-primary">{buyers.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Total Sold</div>
              <div className="text-2xl font-black text-primary">
                {buyers.reduce((sum, b) => sum + b.quantity, 0)} Units
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
              ৳
            </div>
            <div>
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Total Revenue</div>
              <div className="text-2xl font-black text-primary">
                ৳{buyers.reduce((sum, b) => sum + b.total, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border-2 border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by customer or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent/20 focus:bg-white rounded-xl text-sm font-bold outline-none transition-all"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b-2 border-gray-100">
            <tr>
              <th className="px-6 py-4 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100">Customer Info</th>
              <th className="px-6 py-4 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100">Order Details</th>
              <th className="px-6 py-4 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100">Amount</th>
              <th className="px-6 py-4 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100">Purchase Date</th>
              <th className="px-6 py-4 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {filteredBuyers.map(buyer => (
              <tr key={buyer.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 border-r border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center font-black">
                      {buyer.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-primary">{buyer.customerName}</div>
                      <div className="text-xs text-muted">{buyer.customerPhone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-gray-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-muted" />
                      <span className="text-xs font-black text-primary uppercase tracking-wider">{buyer.invoiceId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                      <ShoppingBag size={12} />
                      Qty: {buyer.quantity}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-gray-50">
                  <div className="font-black text-primary">৳{buyer.total.toLocaleString()}</div>
                  <div className="text-[10px] text-muted font-bold">৳{buyer.price} / unit</div>
                </td>
                <td className="px-6 py-4 border-r border-gray-50">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Calendar size={14} className="text-accent" />
                    {dayjs(buyer.createdAt).format('DD MMM, YYYY')}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted font-black mt-1 uppercase tracking-widest">
                    <Clock size={12} />
                    {dayjs(buyer.createdAt).format('hh:mm A')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/adm/orders/${buyer.orderId}`)}
                    className="p-3 bg-white border border-gray-100 rounded-xl text-muted hover:text-accent hover:border-accent/20 transition-all shadow-sm group/btn"
                  >
                    <ExternalLink size={18} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredBuyers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Users size={32} />
                  </div>
                  <h3 className="text-lg font-black text-primary">No Buyers Found</h3>
                  <p className="text-sm text-muted font-bold uppercase tracking-widest mt-1">This product hasn't been sold yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
