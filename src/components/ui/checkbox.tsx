/**
 * ☑️ COMPONENTE CHECKBOX - Shadcn/UI Compatible
 * 
 * @description Checkbox con soporte para checked/onCheckedChange
 * compatible con el patrón shadcn/ui
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    }, [onCheckedChange]);

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-gray-300 bg-white",
            "ring-offset-background focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "peer-checked:bg-blue-600 peer-checked:border-blue-600",
            "transition-colors cursor-pointer",
            className
          )}
          onClick={() => onCheckedChange && onCheckedChange(!checked)}
        >
          {checked && (
            <Check className="h-3 w-3 text-white mx-auto" />
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };