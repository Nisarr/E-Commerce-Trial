import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { topupWallet } from '../../services/api';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle, Check } from 'lucide-react';
import dayjs from 'dayjs';



export const WalletPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: userData, loading, fetchUserData } = useUserStore();
  
  const balance = userData?.wallet?.balance || 0;
  const transactions = (userData?.wallet?.transactions || []);
  const [showTopupForm, setShowTopupForm] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id!, user.username, user.email);
    }
  }, [user, fetchUserData]);

  const refreshData = () => {
    if (user?.id) fetchUserData(user.id!, user.username, user.email, true);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      // Simulate payment gateway delay
      await new Promise(res => setTimeout(res, 1500));
      
      await topupWallet({
        userId: user!.id!,
        amount,
        reference: 'Top-up via Card/MFS'
      });
      
      setShowTopupForm(false);
      setTopupAmount('');
      refreshData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to top up wallet';
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '160px', borderRadius: '2.5rem' }} />
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '400px', borderRadius: '2.5rem' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header & Balance Card */}
      <div className="bg-gradient-to-br from-primary to-[#5a189a] p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 text-white/80 text-[10px] sm:text-sm font-bold uppercase tracking-widest">
              <WalletIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
              Current Balance
            </div>
            <div className="text-3xl sm:text-5xl font-black font-garamond tracking-tight">
              ৳ {balance.toLocaleString()}
            </div>
          </div>
          
          <button 
            onClick={() => setShowTopupForm(true)}
            className="bg-white text-primary px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            Top Up Wallet
          </button>
        </div>
      </div>

      {/* Topup Modal */}
      {showTopupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl sm:text-2xl font-black text-primary font-garamond mb-1 sm:mb-2">Top Up Wallet</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4 sm:mb-6">Enter the amount you wish to add to your balance.</p>
            
            <form onSubmit={handleTopup} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="p-3 sm:p-4 bg-red-50 text-red-600 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest">Amount (৳)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="block w-full px-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-gray-50/50"
                  placeholder="e.g. 1000"
                  disabled={processing}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt.toString())}
                    className="py-2 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowTopupForm(false)}
                  className="flex-1 py-3 sm:py-4 bg-gray-100 text-gray-600 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-gray-200 transition-colors"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !topupAmount}
                  className="flex-[2] py-3 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex justify-center items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                >
                  {processing ? (
                    <><Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" /> Processing...</>
                  ) : (
                    <><Check size={16} className="sm:w-[18px] sm:h-[18px]" /> Confirm Payment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl shadow-primary/5">
        <h3 className="text-lg sm:text-xl font-black text-primary mb-4 sm:mb-6 flex items-center gap-3">
          <WalletIcon size={18} className="text-accent sm:w-5 sm:h-5" />
          Transaction History
        </h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <WalletIcon size={24} className="sm:w-8 sm:h-8" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base font-medium">No transactions found.</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Top up your wallet to get started.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {txn.type === 'credit' ? <ArrowDownRight size={18} className="sm:w-5 sm:h-5" /> : <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{txn.reference}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{dayjs(txn.createdAt).format('MMM D, YYYY • h:mm A')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-base sm:text-lg ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {txn.type === 'credit' ? '+' : '-'}৳ {txn.amount.toLocaleString()}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Bal: ৳ {txn.balanceAfter?.toLocaleString() ?? '0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
