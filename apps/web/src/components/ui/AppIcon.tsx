import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
}

export function AppIcon({ className }: AppIconProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-lg bg-zinc-950 font-black tracking-tighter border border-zinc-800 shadow-sm",
        "w-9 h-9 text-xl select-none",
        className
      )}
    >
      <span className="text-white">C</span>
      <span className="text-primary -ml-[1px]">G</span>
    </div>
  );
}
