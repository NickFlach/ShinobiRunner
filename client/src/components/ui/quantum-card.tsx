import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";

interface QuantumCardProps extends React.ComponentProps<typeof Card> {
  glowing?: boolean;
  variant?: "default" | "secondary" | "success" | "warning" | "error";
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footerContent?: React.ReactNode;
  children?: React.ReactNode;
}

const QuantumCard = React.forwardRef<HTMLDivElement, QuantumCardProps>(
  ({ 
    className, 
    glowing = false, 
    variant = "default",
    icon,
    title,
    description,
    footerContent,
    children,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "bg-[#1e1e1e] border-[#333333]",
      secondary: "bg-[#1e1e1e] border-[#6a11cb]/30",
      success: "bg-[#1e1e1e] border-[#00cc66]/30",
      warning: "bg-[#1e1e1e] border-[#ffaa00]/30",
      error: "bg-[#1e1e1e] border-[#ff3366]/30"
    };

    const iconContainerVariants = {
      default: "bg-[#0099ff]/10 text-[#0099ff]",
      secondary: "bg-[#6a11cb]/10 text-[#6a11cb]",
      success: "bg-[#00cc66]/10 text-[#00cc66]",
      warning: "bg-[#ffaa00]/10 text-[#ffaa00]",
      error: "bg-[#ff3366]/10 text-[#ff3366]"
    };

    return (
      <Card
        ref={ref}
        className={cn(
          variantClasses[variant],
          glowing && "animate-glow",
          className
        )}
        {...props}
      >
        {(title || icon) && (
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              {title && typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title}
              {description && typeof description === 'string' ? 
                <CardDescription>{description}</CardDescription> : description}
            </div>
            {icon && (
              <div className={cn("p-2 rounded-md", iconContainerVariants[variant])}>
                {icon}
              </div>
            )}
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
        {footerContent && (
          <CardFooter>
            {footerContent}
          </CardFooter>
        )}
      </Card>
    );
  }
);

QuantumCard.displayName = "QuantumCard";

export { QuantumCard };
