import toast from 'react-hot-toast';

const ORBIT_URL = 'https://orbitsaas.cloud/';

export const premiumAction = (feature: string) => {
  toast(
    `🔒 ${feature} requires Premium. Contact Orbit SaaS to upgrade.`,
    { duration: 4000, icon: '👑' }
  );
  window.open(ORBIT_URL, '_blank');
};

export const getAuthHeaders = () => {
  const key = localStorage.getItem('admin_key') || import.meta.env.VITE_ADMIN_API_KEY || '';
  return { Authorization: `Bearer ${key}` };
};
