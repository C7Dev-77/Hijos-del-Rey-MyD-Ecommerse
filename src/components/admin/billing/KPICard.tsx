import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md group",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground hidden sm:inline">vs mes anterior</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
            "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
            iconClassName
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
