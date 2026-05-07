// ═══════════════════════════════════════════════════════════════
// PlayPen House — License Verification Store
// Verifies subscription tier via Orbit SaaS remote API
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';

interface LicenseState {
  /** Whether the current installation is a premium license */
  isPremium: boolean;
  /** Max products allowed (controlled by Orbit SaaS per client) */
  maxProducts: number;
  /** Max categories allowed (controlled by Orbit SaaS per client) */
  maxCategories: number;
  /** Whether license has been verified this session */
  verified: boolean;
  /** Whether verification is in progress */
  loading: boolean;
  /** Verify license against Orbit SaaS API */
  verify: () => Promise<void>;
}

// Orbit SaaS license verification endpoint
const ORBIT_LICENSE_API = 'https://api.orbitsaas.cloud/license/verify';

export const useLicenseStore = create<LicenseState>((set) => ({
  // Default: trial mode with conservative limits
  isPremium: false,
  maxProducts: 20,
  maxCategories: 5,
  verified: false,
  loading: true,

  verify: async () => {
    set({ loading: true });
    try {
      // Retrieve the license key (set by Orbit SaaS during deployment)
      const licenseKey = localStorage.getItem('orbit_license_key') || '';

      const res = await fetch(ORBIT_LICENSE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-License-Key': licenseKey,
        },
        body: JSON.stringify({
          domain: window.location.hostname,
          timestamp: Date.now(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        set({
          isPremium: data.isPremium ?? false,
          maxProducts: data.maxProducts ?? 20,
          maxCategories: data.maxCategories ?? 5,
          verified: true,
        });
      } else {
        // Invalid license or server error → stay in trial
        set({ isPremium: false, verified: true });
      }
    } catch {
      // Network error / Orbit SaaS API unreachable → default to trial
      // This ensures the app still works offline in trial mode
      set({ isPremium: false, verified: true });
    } finally {
      set({ loading: false });
    }
  },
}));
