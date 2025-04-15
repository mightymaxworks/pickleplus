/**
 * PKL-278651-UI-0001-CORE
 * Heading Component
 *
 * A reusable heading component for section titles with optional descriptions and icons.
 */
import React from 'react';

interface HeadingProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Heading({
  title,
  description,
  icon,
  actions,
  className = '',
}: HeadingProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex-shrink-0 mt-2 sm:mt-0">{actions}</div>}
    </div>
  );
}