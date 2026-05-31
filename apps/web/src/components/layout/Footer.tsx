import Link from "next/link";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted py-12 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span>CV<span className="text-primary">Gen</span></span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Giải pháp tối ưu hóa hồ sơ ứng tuyển bằng trí tuệ nhân tạo. 
              Giúp bạn chinh phục mọi nhà tuyển dụng.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">Tính năng</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Bảng giá</Link></li>
              <li><Link href="/templates" className="hover:text-primary">Mẫu CV</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary">Câu hỏi thường gặp</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Liên hệ</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Bảo mật</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} CVGen. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/terms" className="hover:text-foreground">Điều khoản</Link>
            <Link href="/privacy" className="hover:text-foreground">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
