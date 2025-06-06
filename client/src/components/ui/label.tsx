// src/components/ui/label.tsx
import { cn } from "@/lib/utils";
import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

/**
 * Accessible Label component based on Radix UI primitives
 * Ensures proper form accessibility and consistent styling
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
