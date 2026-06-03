import Link from "next/link";
import { AppIcon } from "@/components/ui/AppIcon";

export default function AuthHeader() {
  return (
    <header className="py-6 px-8 border-b border-zinc-200 flex justify-between items-center bg-white">
      <Link href="/" className="flex items-center gap-2">
        <AppIcon className="w-7 h-7 bg-primary rounded-sm [&>i]:text-[1rem]" />
        <span className="text-xl font-bold font-sans tracking-tight text-zinc-900">JobReady.</span>
      </Link>
    </header>
  );
}
