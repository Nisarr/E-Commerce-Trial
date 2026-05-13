import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Shield, Ban, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { premiumAction } from '../premiumAction';

export const CustomerPreview: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    fetch('/api/v1/users?limit=15').then(r => r.json()).then(d => { setUsers(d.items || []); setTotal(d.pagination?.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><Users size={24} /> Customer Management</h2>
        <p className="text-[var(--adm-text-secondary)] font-medium text-sm">{total} registered user{total !== 1 ? 's' : ''}</p></div>
      <div className="bg-[var(--adm-card-bg)] md:rounded-[2rem] md:shadow-xl md:border border-[var(--adm-border)] overflow-hidden">
        {loading ? <div className="p-8 space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 w-full rounded-2xl border border-[var(--adm-border)] skeleton" />)}</div>
        : users.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-[var(--adm-text-secondary)]"><Users size={48} /><p className="mt-4 font-bold">No users found</p></div>
        : <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[var(--adm-border)] bg-[var(--adm-bg)]/50">
          <th className="text-left px-6 py-4 font-black text-xs uppercase tracking-wider text-[var(--adm-text-secondary)]">User</th>
          <th className="text-left px-4 py-4 font-black text-xs uppercase tracking-wider text-[var(--adm-text-secondary)]">Contact</th>
          <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-[var(--adm-text-secondary)]">Status</th>
          <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-[var(--adm-text-secondary)]">Joined</th>
          <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-[var(--adm-text-secondary)]">Actions</th>
        </tr></thead><tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-b border-[var(--adm-border)] hover:bg-[var(--adm-bg)]/50 transition-colors">
              <td className="px-6 py-4"><div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><span className="text-accent font-black text-sm">{(u.username||'?')[0].toUpperCase()}</span></div>
                <div><p className="font-bold text-[var(--adm-text-primary)]">{u.fullName || u.username}</p><p className="text-xs text-[var(--adm-text-secondary)]">@{u.username}</p></div>
              </div></td>
              <td className="px-4 py-4"><div className="space-y-1 text-xs text-[var(--adm-text-secondary)]">{u.email && <p className="flex items-center gap-1"><Mail size={11} /> {u.email}</p>}{u.phone && <p className="flex items-center gap-1"><Phone size={11} /> {u.phone}</p>}</div></td>
              <td className="px-4 py-4 text-center"><div className="flex flex-col items-center gap-1">
                {u.isVerified ? <span className="inline-flex items-center gap-1 text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><ShieldCheck size={10} /> Verified</span> : <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"><Shield size={10} /> Unverified</span>}
                {u.isBlocked ? <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full"><Ban size={10} /> Blocked</span> : null}
              </div></td>
              <td className="px-4 py-4 text-center text-xs text-[var(--adm-text-secondary)]"><span className="flex items-center justify-center gap-1"><Calendar size={11} />{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'N/A'}</span></td>
              <td className="px-4 py-4"><div className="flex items-center justify-center gap-2">
                <button onClick={() => premiumAction('Verifying users')} className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-green-50 text-green-600 border border-green-200"><UserCheck size={12} className="inline mr-1" />Verify</button>
                <button onClick={() => premiumAction('Blocking users')} className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-red-50 text-red-600 border border-red-200"><Ban size={12} className="inline mr-1" />Block</button>
              </div></td>
            </tr>
          ))}
        </tbody></table></div>}
      </div>
    </div>
  );
};
