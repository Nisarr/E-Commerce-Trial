import React, { useEffect, useState } from 'react';
import {
  Users, Shield, ShieldCheck, Ban, UserCheck,
  Loader2, ChevronLeft, ChevronRight, Mail, Phone, Calendar, X
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface UserRecord {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  isVerified?: number;
  isBlocked?: number;
  createdAt?: string;
}

export const CustomerManager: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/v1/users?${params}`);
      const data = await res.json();
      setUsers(data.items || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch(`/api/v1/users/${userId}/block`, { method: 'PATCH' });
      await fetchUsers();
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerify = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch(`/api/v1/users/${userId}/verify`, { method: 'PATCH' });
      await fetchUsers();
    } catch {} finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2">
            <Users size={24} /> Customer Management
          </h2>
          <p className="text-muted font-medium text-sm">{total} registered user{total !== 1 ? 's' : ''}</p>
        </div>
        {search && (
          <button 
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('q');
              setSearchParams(newParams);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
          >
            <X size={14} strokeWidth={3} /> Clear Search
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-16 w-full rounded-2xl border border-gray-50 skeleton" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={48} />
            <p className="mt-4 font-bold">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 font-black text-xs uppercase tracking-wider text-gray-400">User</th>
                  <th className="text-left px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Contact</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Joined</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-accent font-black text-sm">{(u.username || '?')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{u.fullName || u.username}</p>
                          <p className="text-xs text-muted">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-xs text-muted">
                        {u.email && <p className="flex items-center gap-1"><Mail size={11} /> {u.email}</p>}
                        {u.phone && <p className="flex items-center gap-1"><Phone size={11} /> {u.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            <Shield size={10} /> Unverified
                          </span>
                        )}
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            <Ban size={10} /> Blocked
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-muted">
                      <span className="flex items-center justify-center gap-1">
                        <Calendar size={11} />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleVerify(u.id)}
                          disabled={actionLoading === u.id}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors ${
                            u.isVerified
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                          }`}
                          title={u.isVerified ? 'Remove verification' : 'Verify user'}
                        >
                          {actionLoading === u.id ? <Loader2 size={12} className="animate-spin" /> : (
                            <>{u.isVerified ? 'Unverify' : <><UserCheck size={12} className="inline mr-1" />Verify</>}</>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u.id)}
                          disabled={actionLoading === u.id}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors ${
                            u.isBlocked
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          }`}
                          title={u.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {u.isBlocked ? 'Unblock' : <><Ban size={12} className="inline mr-1" />Block</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-xs text-muted font-bold">
              Page {page} of {totalPages} ({total} users)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
