import React from 'react';

interface SkeletonCardProps {
  rows?: number;
  height?: string;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  rows = 3, 
  height = 'h-4',
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className={`bg-slate-200 dark:bg-slate-700 rounded ${height} ${
              i === rows - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{
              animation: 'shimmer 2s infinite',
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const SkeletonCircle: React.FC<{ size?: string; className?: string }> = ({ 
  size = 'w-12 h-12',
  className = '' 
}) => {
  return (
    <div 
      className={`${size} bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse ${className}`}
      style={{
        animation: 'shimmer 2s infinite',
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        backgroundSize: '200% 100%',
      }}
    />
  );
};

export const SkeletonText: React.FC<{ width?: string; height?: string; className?: string }> = ({ 
  width = 'w-full',
  height = 'h-4',
  className = '' 
}) => {
  return (
    <div 
      className={`${width} ${height} bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`}
      style={{
        animation: 'shimmer 2s infinite',
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        backgroundSize: '200% 100%',
      }}
    />
  );
};
