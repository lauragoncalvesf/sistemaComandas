import { Clock, Flame, CheckCircle2, HandPlatter } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/store";
const styles = {
    pendente: {
        className: "bg-status-pending text-status-pending-foreground",
        Icon: Clock,
    },
    em_preparo: {
        className: "bg-status-preparing text-status-preparing-foreground",
        Icon: Flame,
    },
    pronto: {
        className: "bg-status-ready text-status-ready-foreground",
        Icon: CheckCircle2,
    },
    entregue: {
        className: "bg-primary text-primary-foreground",
        Icon: HandPlatter,
    },
};
export function StatusBadge({ status, className, }) {
    const { className: statusClass, Icon } = styles[status];
    return (<span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", statusClass, className)}>
      <Icon className="size-3.5"/>
      {STATUS_LABELS[status]}
    </span>);
}
