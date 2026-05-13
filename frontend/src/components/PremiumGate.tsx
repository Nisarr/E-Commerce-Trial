// ═══════════════════════════════════════════════════════════════
// PlayPen House — Premium Feature Gate Component
// Shows upgrade overlay for premium-only features
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { ORBIT_SAAS_URL } from '../utils/featureGate';
import { Lock, Crown, ExternalLink } from 'lucide-react';

interface PremiumGateProps {
  /** The children content to render (visible but locked in trial) */
  children: React.ReactNode;
  /** If true, renders a compact inline lock badge instead of full overlay */
  inline?: boolean;
  /** Optional custom fallback instead of the default overlay */
  fallback?: React.ReactNode;
}

/**
 * Wraps premium features with an upgrade overlay in trial mode.
 * - Full-page mode (default): Shows centered upgrade CTA replacing the content
 * - Inline mode: Blurs/disables the content with a small lock badge
 * 
 * Trial version: always shows the locked state (no license check needed).
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  inline = false,
  fallback,
}) => {
  // Custom fallback if provided
  if (fallback) return <>{fallback}</>;

  // ── Inline Mode: blur + small badge ─────────────────────
  if (inline) {
    return (
      <div className="relative">
        <div className="opacity-[0.45] pointer-events-none select-none blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <a
            href={ORBIT_SAAS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-[11px] font-black px-4 py-2.5 rounded-2xl border-2 border-amber-200/60 flex items-center gap-2 shadow-lg shadow-amber-100/50 hover:shadow-xl hover:scale-105 hover:border-amber-300 transition-all cursor-pointer no-underline"
          >
            <Lock size={12} />
            <span>PREMIUM</span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-600">Contact Orbit SaaS</span>
            <ExternalLink size={10} className="text-amber-400" />
          </a>
        </div>
      </div>
    );
  }

  // ── Full Page Mode: show content blurred + floating overlay ──
  return (
    <div className="relative min-h-[60vh]">
      {/* Blurred, non-interactive content (visible to attract the client) */}
      <div className="opacity-[0.55] pointer-events-none select-none blur-[1px]">
        {children}
      </div>

      {/* Floating upgrade overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-16 md:pt-24 z-10">
        <div className="relative flex flex-col items-center text-center px-8 py-10 md:px-12 md:py-14 bg-[var(--adm-card-bg)]/90 backdrop-blur-xl rounded-[2.5rem] border-2 border-amber-200/40 shadow-2xl shadow-amber-200/20 max-w-md mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
          {/* Decorative glow */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 bg-amber-400/20 rounded-full blur-2xl" />
          
          {/* Crown Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-amber-200/40 border-2 border-amber-200/30">
            <Crown size={38} className="text-amber-500" strokeWidth={2} />
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-black text-[var(--adm-text-primary)] mb-2 tracking-tight">
            Premium Feature
          </h2>

          {/* Description */}
          <p className="text-[13px] text-[var(--adm-text-secondary)] max-w-sm mb-2 leading-relaxed font-medium">
            This feature is available in the <span className="font-black text-amber-600">Premium Plan</span>.
            Upgrade to unlock advanced tools and grow your business.
          </p>
          <p className="text-[10px] text-[var(--adm-text-secondary)]/50 mb-6 font-bold uppercase tracking-widest">
            Powered by Orbit SaaS
          </p>

          {/* CTA Button — clickable, redirects to orbitsaas.cloud */}
          <a
            href={ORBIT_SAAS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white font-black rounded-2xl shadow-lg shadow-amber-400/30 hover:shadow-2xl hover:shadow-amber-400/40 hover:scale-[1.04] transition-all text-sm flex items-center gap-2.5 border border-amber-400/20 no-underline"
          >
            <Crown size={16} className="group-hover:rotate-12 transition-transform" />
            Contact with Orbit SaaS
            <ExternalLink size={13} className="opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable trial limit warning banner component.
 * Shows when approaching or at the trial limit.
 */
export const TrialLimitBanner: React.FC<{
  current: number;
  max: number;
  label: string; // e.g. "products" or "categories"
}> = ({ current, max, label }) => {
  const percentage = (current / max) * 100;
  const isAtLimit = current >= max;
  const isNearLimit = percentage >= 80;

  if (!isNearLimit) return null;

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 text-[12px] font-bold mb-6 animate-in fade-in slide-in-from-top-2 duration-500 ${
        isAtLimit
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}
    >
      {isAtLimit ? (
        <Lock size={15} className="text-red-500 flex-shrink-0" />
      ) : (
        <Crown size={15} className="text-amber-500 flex-shrink-0" />
      )}
      <span className="flex-grow">
        {isAtLimit ? (
          <>
            Trial limit reached — <strong>{current}/{max} {label}</strong>.{' '}
            <button
              onClick={() => window.open(ORBIT_SAAS_URL, '_blank')}
              className="underline font-black hover:text-red-900 transition-colors"
            >
              Contact Orbit SaaS
            </button>{' '}
            for unlimited {label}.
          </>
        ) : (
          <>
            You've used <strong>{current}/{max} {label}</strong> (Trial).{' '}
            <button
              onClick={() => window.open(ORBIT_SAAS_URL, '_blank')}
              className="underline font-black hover:text-amber-900 transition-colors"
            >
              Contact Orbit SaaS
            </button>{' '}
            to upgrade.
          </>
        )}
      </span>
      <span
        className={`text-[10px] font-black px-2 py-1 rounded-lg ${
          isAtLimit ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
        }`}
      >
        {current}/{max}
      </span>
    </div>
  );
};
