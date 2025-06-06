// src/components/layout/LoadingSpinner.tsx
import { cn } from "@/lib/utils";
/**
 * Reusable loading spinner component
 * Provides consistent loading states throughout the application
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
            sizeClasses[size]
          )}
        />
        {text && <p className="text-sm text-gray-600">{text}</p>}
      </div>
    </div>
  );
};
