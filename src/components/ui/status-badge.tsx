import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "warning" | "destructive" | "info" | "neutral" | "pending";
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

const statusStyles = {
  success: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  destructive: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  neutral: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  pending: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
};

export function StatusBadge({ status, children, className, icon: Icon }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// Invoice specific status badge
export function InvoiceStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: StatusBadgeProps["status"]; label: string }> = {
    paid: { variant: "success", label: "Pagada" },
    pending: { variant: "warning", label: "Pendiente" },
    overdue: { variant: "destructive", label: "Vencida" },
    cancelled: { variant: "neutral", label: "Anulada" },
    draft: { variant: "info", label: "Borrador" },
  };

  const config = statusMap[status] || { variant: "neutral" as const, label: status };
  
  return <StatusBadge status={config.variant}>{config.label}</StatusBadge>;
}
