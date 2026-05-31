import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <span>CV<span className="text-primary">Gen</span></span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Tính năng</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Bảng giá</Link>
          <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
            Đăng nhập
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full px-6">Bắt đầu ngay</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
