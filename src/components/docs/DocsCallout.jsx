import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  info: {
    icon: Info,
    className: "border-sky-500/30 bg-sky-500/10 text-sky-100",
    iconClass: "text-sky-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    iconClass: "text-amber-400",
  },
  tip: {
    icon: Lightbulb,
    className: "border-violet-500/30 bg-violet-500/10 text-violet-100",
    iconClass: "text-violet-400",
  },
};

export function DocsCallout({ variant = "info", title, children }) {
  const { icon: Icon, className, iconClass } = variants[variant];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4 text-sm leading-relaxed", className)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
      <div>
        {title && <p className="mb-1 font-semibold text-white">{title}</p>}
        <div className="text-zinc-300 [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
