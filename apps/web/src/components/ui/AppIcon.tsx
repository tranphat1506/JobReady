import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
}

export function AppIcon({ className }: AppIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm bg-primary",
        "w-9 h-9 text-white",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-6.5 h-6.5 fill-current"
      >
        <path d="m21.946 7.144c-.103-.298-.339-.529-.639-.626-.091-.03-1.695-.533-4.807-.82.104-2.548-1.944-4.704-4.5-4.698-2.556-.006-4.604 2.149-4.5 4.698-3.112.287-4.716.79-4.807.82-.3.097-.536.328-.639.626-.043.125-1.054 3.11-1.054 7.106s1.011 6.981 1.054 7.106c.103.298.339.529.639.626.128.042 3.22 1.018 9.307 1.018s9.179-.976 9.307-1.018c.3-.097.536-.328.639-.626.043-.125 1.054-3.11 1.054-7.106s-1.011-6.981-1.054-7.106zm-11.446-1.644c0-.827.673-1.5 1.5-1.5s1.5.673 1.5 1.5v.023c-.48-.013-.975-.023-1.5-.023s-1.02.009-1.5.023z" />
      </svg>
    </div>
  );
}
