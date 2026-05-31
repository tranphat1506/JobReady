"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered CV Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground">
            Tạo CV Chuẩn ATS & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Cover Letter Tự Động
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Nâng tầm hồ sơ ứng tuyển của bạn với sức mạnh từ Google Gemini. Phân tích JD, tự động viết Cover Letter và xuất PDF tuyệt đẹp chỉ trong vài giây.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full gap-2 shadow-lg hover:shadow-primary/25 transition-all">
                <FileText className="w-5 h-5" />
                Tạo CV Ngay
              </Button>
            </Link>
            
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full gap-2 bg-background/50 backdrop-blur-sm">
                Tìm hiểu thêm
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
