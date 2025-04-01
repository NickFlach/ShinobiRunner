import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType = "active" | "processing" | "pending" | "paused" | "completed" | "aborted" | "error";

interface QuantumBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  showDot?: boolean;
  variant?: "default" | "slim" | "outline";
}

const statusConfig: Record<StatusType, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  active: {
    label: "Active",
    bgColor: "bg-[#00cc66]/20",
    textColor: "text-[#00cc66]",
    dotColor: "bg-[#00cc66]"
  },
  processing: {
    label: "Processing",
    bgColor: "bg-[#ffaa00]/20",
    textColor: "text-[#ffaa00]",
    dotColor: "bg-[#ffaa00]"
  },
  pending: {
    label: "Pending Auth",
    bgColor: "bg-[#ffaa00]/20",
    textColor: "text-[#ffaa00]",
    dotColor: "bg-[#ffaa00]"
  },
  paused: {
    label: "Paused",
    bgColor: "bg-[#0099ff]/20",
    textColor: "text-[#0099ff]",
    dotColor: "bg-[#0099ff]"
  },
  completed: {
    label: "Completed",
    bgColor: "bg-[#00cc66]/20",
    textColor: "text-[#00cc66]",
    dotColor: "bg-[#00cc66]"
  },
  aborted: {
    label: "Aborted",
    bgColor: "bg-[#ff3366]/20",
    textColor: "text-[#ff3366]",
    dotColor: "bg-[#ff3366]"
  },
  error: {
    label: "Error",
    bgColor: "bg-[#ff3366]/20",
    textColor: "text-[#ff3366]",
    dotColor: "bg-[#ff3366]"
  }
};

const QuantumBadge = React.forwardRef<HTMLDivElement, QuantumBadgeProps>(
  ({ className, status, showDot = true, variant = "default", ...props }, ref) => {
    const config = statusConfig[status] || statusConfig.error;
    
    const variantClasses = {
      default: cn("px-2 py-1 rounded-full text-xs", config.bgColor, config.textColor),
      slim: cn("px-1.5 py-0.5 rounded-full text-xs", config.bgColor, config.textColor),
      outline: cn(
        "px-2 py-1 rounded-full text-xs border", 
        "bg-transparent", 
        `border-${config.textColor.split('-')[1]}`,
        config.textColor
      )
    };
    
    return (
      <div ref={ref} className={cn("flex items-center", className)} {...props}>
        <Badge variant="outline" className={cn(variantClasses[variant])}>
          {showDot && (
            <span className={cn("h-2 w-2 rounded-full mr-1.5", config.dotColor)}></span>
          )}
          {config.label}
        </Badge>
      </div>
    );
  }
);

QuantumBadge.displayName = "QuantumBadge";

export { QuantumBadge };
export type { StatusType };
