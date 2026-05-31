import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
}

export function AppIcon({ className }: AppIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-primary",
        "w-8 h-8 text-white flex-shrink-0",
        className
      )}
    >
      <i className="fi fi-rr-suitcase text-white text-lg leading-none flex items-center justify-center" />
    </div>
  );
}
