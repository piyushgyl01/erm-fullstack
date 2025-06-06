// src/components/layout/EmptyState.tsx
import { Button } from "../ui/button";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
/**
 * Empty state component for when there's no data to display
 * Provides consistent empty states with calls to action
 */
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderKanban,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
};
