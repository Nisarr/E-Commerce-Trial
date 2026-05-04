import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../services/api';
import type { Address } from '../../types';
import {
  MapPin, Plus, Pencil, Trash2, Loader2, Home, Building2,
  Star, Check, X, AlertCircle, CheckCircle2
} from 'lucide-react';

const LABEL_OPTIONS = [
  { value: 'Home', icon: Home, color: '#4F46E5' },
  { value: 'Office', icon: Building2, color: '#10B981' },
  { value: 'Other', icon: MapPin, color: '#F59E0B' },
];

export const AddressBook: React.FC = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user?.id) fetchAddresses();
  }, [user?.id]);

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses(user!.id!);
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ label: 'Home', fullName: '', phone: '', address: '', city: '', postalCode: '', isDefault: false });
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const openEditForm = (addr: Address) => {
    setForm({
      label: addr.label || 'Home',
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city || '',
      postalCode: addr.postalCode || '',
      isDefault: !!addr.isDefault,
    });
    setEditing(addr);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) {
      setError('Name, phone, and address are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateAddress(editing.id, {
          ...form,
          isDefault: form.isDefault ? 1 : 0,
        } as any);
      } else {
        await createAddress({
          userId: user!.id!,
          ...form,
          city: form.city || null,
          postalCode: form.postalCode || null,
          isDefault: form.isDefault ? 1 : 0,
        });
      }
      setSuccess(editing ? 'Address updated!' : 'Address added!');
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      await fetchAddresses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      await fetchAddresses();
    } catch {
      setError('Failed to delete address.');
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await updateAddress(addr.id, { isDefault: 1 } as any);
      await fetchAddresses();
    } catch {
      setError('Failed to set default.');
    }
  };

  if (loading) {
    return (
      <div className="address-book">
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '60px', borderRadius: '0.75rem', marginBottom: '1.25rem' }} />
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '240px', borderRadius: '1.25rem' }} />
      </div>
    );
  }

  return (
    <div className="address-book">
      <div className="address-book-header">
        <div>
          <h2>Address Book</h2>
          <p>{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="address-add-btn">
            <Plus size={18} /> Add Address
          </button>
        )}
      </div>

      {success && (
        <div className="profile-alert profile-alert--success"><CheckCircle2 size={16} /> {success}</div>
      )}
      {error && (
        <div className="profile-alert profile-alert--error"><AlertCircle size={16} /> {error}</div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="address-form-card">
          <div className="address-form-header">
            <h3>{editing ? 'Edit Address' : 'Add New Address'}</h3>
            <button onClick={resetForm} className="address-form-close"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="address-form">
            <div className="address-label-picker">
              {LABEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`address-label-btn ${form.label === opt.value ? 'address-label-btn--active' : ''}`}
                  onClick={() => setForm({ ...form, label: opt.value })}
                  style={form.label === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                >
                  <opt.icon size={16} /> {opt.value}
                </button>
              ))}
            </div>
            <div className="address-form-grid">
              <div className="profile-field">
                <label>Full Name *</label>
                <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Recipient name" />
              </div>
              <div className="profile-field">
                <label>Phone *</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880 1XXXXXXXXX" />
              </div>
            </div>
            <div className="profile-field">
              <label>Street Address *</label>
              <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, road, area..." rows={2} />
            </div>
            <div className="address-form-grid">
              <div className="profile-field">
                <label>City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dhaka" />
              </div>
              <div className="profile-field">
                <label>Postal Code</label>
                <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="1200" />
              </div>
            </div>
            <label className="address-default-check">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              <span>Set as default address</span>
            </label>
            <div className="address-form-actions">
              <button type="button" onClick={resetForm} className="address-cancel-btn">Cancel</button>
              <button type="submit" disabled={saving} className="profile-save-btn">
                {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Check size={16} /> {editing ? 'Update' : 'Save'} Address</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="address-empty">
          <MapPin size={48} />
          <p>No addresses saved yet.</p>
          <button onClick={() => setShowForm(true)} className="address-add-btn">
            <Plus size={18} /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((addr) => {
            const labelOpt = LABEL_OPTIONS.find(l => l.value === addr.label) || LABEL_OPTIONS[2];
            return (
              <div key={addr.id} className={`address-card ${addr.isDefault ? 'address-card--default' : ''}`}>
                <div className="address-card-header">
                  <div className="address-card-label" style={{ backgroundColor: `${labelOpt.color}15`, color: labelOpt.color }}>
                    <labelOpt.icon size={14} /> {addr.label}
                  </div>
                  {addr.isDefault ? (
                    <span className="address-default-tag"><Star size={10} /> Default</span>
                  ) : (
                    <button onClick={() => handleSetDefault(addr)} className="address-set-default" title="Set as default">
                      <Star size={12} /> Set Default
                    </button>
                  )}
                </div>
                <div className="address-card-body">
                  <p className="address-card-name">{addr.fullName}</p>
                  <p className="address-card-phone">{addr.phone}</p>
                  <p className="address-card-addr">{addr.address}</p>
                  {(addr.city || addr.postalCode) && (
                    <p className="address-card-city">{[addr.city, addr.postalCode].filter(Boolean).join(', ')}</p>
                  )}
                </div>
                <div className="address-card-actions">
                  <button onClick={() => openEditForm(addr)} className="address-edit-btn">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="address-delete-btn">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
