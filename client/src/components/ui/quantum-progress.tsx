import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface QuantumProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  labelPosition?: "above" | "below" | "right";
  labelFormat?: (value: number, max: number) => string;
  labelClassName?: string;
  height?: "xs" | "sm" | "md" | "lg";
}

const QuantumProgress = React.forwardRef<HTMLDivElement, QuantumProgressProps>(
  ({
    className,
    value,
    max = 100,
    variant = "default",
    showLabel = false,
    labelPosition = "right",
    labelFormat,
    labelClassName,
    height = "md",
    ...props
  }, ref) => {
    const heightClasses = {
      xs: "h-1",
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3"
    };
    
    const variantClasses = {
      default: "bg-gradient-to-r from-[#6a11cb] to-[#2575fc]",
      success: "bg-gradient-to-r from-[#00cc66] to-[#0099ff]",
      warning: "bg-gradient-to-r from-[#ffaa00] to-[#0099ff]",
      error: "bg-gradient-to-r from-[#ff3366] to-[#ffaa00]"
    };
    
    const normalizedValue = Math.min(Math.max(0, value), max);
    const percentage = (normalizedValue / max) * 100;
    
    const formattedLabel = labelFormat 
      ? labelFormat(normalizedValue, max)
      : `${percentage.toFixed(0)}%`;
    
    const progressBar = (
      <Progress
        value={percentage}
        className={cn(
          "rounded-full bg-[#0a0a0a]",
          className
        )}
        indicatorClassName={cn(
          heightClasses[height],
          variantClasses[variant]
        )}
      />
    );
    
    if (!showLabel) {
      return progressBar;
    }
    
    const label = (
      <div className={cn("text-xs text-gray-400", labelClassName)}>
        {formattedLabel}
      </div>
    );
    
    if (labelPosition === "right") {
      return (
        <div ref={ref} className="flex items-center gap-2" {...props}>
          <div className="flex-1">{progressBar}</div>
          {label}
        </div>
      );
    }
    
    return (
      <div ref={ref} {...props}>
        {labelPosition === "above" && (
          <div className="flex justify-between items-center mb-1">
            {label}
          </div>
        )}
        {progressBar}
        {labelPosition === "below" && (
          <div className="flex justify-end items-center mt-1">
            {label}
          </div>
        )}
      </div>
    );
  }
);

QuantumProgress.displayName = "QuantumProgress";

export { QuantumProgress };
