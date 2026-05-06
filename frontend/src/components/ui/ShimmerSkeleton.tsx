import React from 'react';

interface ShimmerSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({ 
  className = '', 
  width = '100%', 
  height = '20px', 
  borderRadius = '0.5rem' 
}) => {
  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ width, height, borderRadius }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export const ModalSkeleton: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <ShimmerSkeleton height="100px" borderRadius="2rem" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShimmerSkeleton height="200px" borderRadius="2rem" />
            <ShimmerSkeleton height="200px" borderRadius="2rem" />
          </div>
          <ShimmerSkeleton height="120px" borderRadius="2rem" />
          <ShimmerSkeleton height="300px" borderRadius="2.5rem" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <ShimmerSkeleton height="250px" borderRadius="2rem" />
          <ShimmerSkeleton height="200px" borderRadius="2rem" />
          <ShimmerSkeleton height="320px" borderRadius="2rem" />
        </div>
      </div>
    </div>
  );
};
