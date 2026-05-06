import React from 'react';
import { X, MessageSquare, Calendar, Clock, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageModalProps {
  message: string;
  status: string;
  date?: string | Date;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ message, status, date, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Message copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl -z-10" />

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-garamond text-primary tracking-tight">Status Update Details</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.15em] rounded-full border border-accent/20 shadow-sm">
                  {status}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-primary border border-transparent hover:border-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8">
          <div className="relative group">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-8 border border-gray-100 min-h-[160px] transition-all group-hover:shadow-2xl group-hover:shadow-primary/5 flex items-center justify-center text-center">
              <p className="text-gray-800 text-lg leading-relaxed font-bold font-garamond italic">
                "{message}"
              </p>
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute -top-3 -right-3 p-3 bg-white shadow-xl border border-gray-100 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-all hover:scale-110 active:scale-95"
              title="Copy Message"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 py-2">
            {date && (
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} className="text-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
            {date && (
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} className="text-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/40 transition-all shadow-xl shadow-primary/20 text-xs"
          >
            Acknowledge Message
          </button>
        </div>
      </div>
    </div>
  );
};
