import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
}

export function AppIcon({ className }: AppIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm bg-primary",
        "w-8.5 h-8.5 text-white",
        className
      )}
    >
      <i className="fi fi-sr-briefcase" style={{ color: "white", fontSize: "1.1rem", lineHeight: 1 }}></i>
    </div>
  );
}
