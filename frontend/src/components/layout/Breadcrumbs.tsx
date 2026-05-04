import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbOverride {
  label?: string; // Override the auto-generated label for the last segment
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbOverride> = ({ label, className }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't render on homepage or admin
  if (pathnames.length === 0 || pathnames[0] === 'adm') return null;

  // Generate readable labels from path segments
  const toLabel = (segment: string, idx: number) => {
    if (idx === pathnames.length - 1 && label) return label;
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav aria-label="Breadcrumb" className={className || "w-full bg-gray-50/80 border-b border-gray-100"}>
      <div className={className ? "py-1 flex items-center" : "max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3"}>
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 text-gray-400 hover:text-accent transition-colors font-medium"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {pathnames.map((segment, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayLabel = toLabel(segment, index);

            return (
              <li key={routeTo} className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-gray-300" />
                {isLast ? (
                  <span className="font-bold text-primary truncate max-w-[200px]" aria-current="page">
                    {displayLabel}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-gray-400 hover:text-accent transition-colors font-medium truncate max-w-[150px]"
                  >
                    {displayLabel}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
