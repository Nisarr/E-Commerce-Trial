import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, ShieldCheck, ThumbsUp, CheckCircle2, Flag, Trash2, AlertCircle } from 'lucide-react';
import { premiumAction } from '../premiumAction';

const STATUS_COLORS: Record<string, string> = { approved: 'bg-green-50 text-green-600 border-green-100', pending: 'bg-amber-50 text-amber-600 border-amber-100', flagged: 'bg-red-50 text-red-600 border-red-100', rejected: 'bg-gray-100 text-gray-500 border-gray-200' };

export const ReviewPreview: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/v1/reviews').then(r => r.json()).then(d => setReviews(d.items || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-gray-100 shadow-sm">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><MessageSquare size={20} /></div> Review Moderation
        </h2>
        <p className="text-gray-400 font-bold text-sm mt-1">Manage and moderate customer feedback</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {loading ? [1,2,3].map(i => <div key={i} className="h-48 w-full rounded-[2rem] skeleton" />) : reviews.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 py-20 text-center"><h3 className="text-xl font-black text-gray-900">No reviews found</h3></div>
        ) : reviews.slice(0, 10).map((r: any) => {
          const status = r.status || 'approved';
          return (
            <div key={r.id} className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">{r.username?.[0]?.toUpperCase()}</div>
                  <div>
                    <span className="font-black text-gray-900 text-sm">{r.username}</span>
                    {r.isVerified === 1 && <span className="ml-2 text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-md border border-green-100"><ShieldCheck size={10} className="inline" /> Verified</span>}
                    <div className="flex items-center gap-1 mt-1">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-100'} />)}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 ${STATUS_COLORS[status] || 'bg-gray-100'}`}>{status}</div>
              </div>
              {r.title && <h4 className="text-lg font-black text-gray-900 mb-1">{r.title}</h4>}
              <p className="text-sm text-gray-500 font-medium italic mb-4">"{r.content}"</p>
              <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-gray-400"><ThumbsUp size={14} /> {r.helpfulCount || 0} Helpful</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => premiumAction('Approving reviews')} className="flex-1 bg-green-500 text-white p-3 rounded-xl shadow-lg"><CheckCircle2 size={18} className="mx-auto" /></button>
                <button onClick={() => premiumAction('Flagging reviews')} className="flex-1 bg-amber-500 text-white p-3 rounded-xl shadow-lg"><Flag size={18} className="mx-auto" /></button>
                <button onClick={() => premiumAction('Rejecting reviews')} className="flex-1 bg-gray-400 text-white p-3 rounded-xl shadow-lg"><AlertCircle size={18} className="mx-auto" /></button>
                <button onClick={() => premiumAction('Deleting reviews')} className="flex-1 bg-red-50 text-red-500 p-3 rounded-xl"><Trash2 size={18} className="mx-auto" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
