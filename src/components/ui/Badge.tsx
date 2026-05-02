import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sale' | 'new' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', children, ...props }) => {
  const variantStyles = {
    sale: 'bg-[var(--sale)] text-white',
    new: 'bg-[var(--new)] text-white',
    default: 'bg-[var(--primary)] text-white',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
