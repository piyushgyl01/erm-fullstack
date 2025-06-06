// src/components/layout/PageHeader.tsx
import { cn } from "@/lib/utils";
/**
 * Reusable page header component for consistent page layouts
 * Provides title, description, and action areas for pages
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "border-b border-gray-200 bg-white px-4 py-5 sm:px-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 flex items-center space-x-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
