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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
              <Users size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <div className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest">Total Customers</div>
              <div className="text-xl md:text-2xl font-black text-primary">{buyers.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 shrink-0">
              <ShoppingBag size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <div className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest">Total Sold</div>
              <div className="text-xl md:text-2xl font-black text-primary">
                {buyers.reduce((sum, b) => sum + b.quantity, 0)} Units
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
              <span className="font-black text-lg">৳</span>
            </div>
            <div>
              <div className="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-widest">Total Revenue</div>
              <div className="text-xl md:text-2xl font-black text-primary">
                ৳{buyers.reduce((sum, b) => sum + b.total, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & List */}
      <div className="bg-white md:rounded-[2rem] md:shadow-xl shadow-primary/5 md:border-2 border-gray-100 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <div className="relative group max-w-md w-full">
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

        {/* Desktop Table View */}
        <div className="hidden md:block">
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
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredBuyers.map(buyer => (
            <div key={buyer.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center font-black">
                    {buyer.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-primary text-sm">{buyer.customerName}</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{buyer.invoiceId}</div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/adm/orders/${buyer.orderId}`)}
                  className="p-2.5 bg-gray-50 text-gray-400 rounded-xl active:scale-95 transition-all border border-gray-100"
                >
                  <ExternalLink size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</p>
                  <p className="text-sm font-black text-primary">৳{buyer.total.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quantity</p>
                  <p className="text-xs font-bold text-gray-600">{buyer.quantity} Units</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                  <p className="text-[10px] font-bold text-gray-600">{dayjs(buyer.createdAt).format('DD MMM, YYYY')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                  <p className="text-[10px] font-bold text-gray-600">{dayjs(buyer.createdAt).format('hh:mm A')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(filteredBuyers.length === 0) && (
          <div className="px-8 py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-black text-primary">No Buyers Found</h3>
            <p className="text-sm text-muted font-bold uppercase tracking-widest mt-1">This product hasn't been sold yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
