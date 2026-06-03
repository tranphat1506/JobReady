import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
}

export function AppIcon({ className }: AppIconProps) {
  return (
    <img src="/android-chrome-192x192.png" alt="JobReady" className="w-8.5 h-8.5 object-contain" />
  );
}
