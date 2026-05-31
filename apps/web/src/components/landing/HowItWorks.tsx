"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, Download } from "lucide-react";

const steps = [
  {
    icon: <Upload className="w-6 h-6 text-foreground" />,
    title: "1. Tải lên Thông Tin & JD",
    description: "Nhập thông tin cá nhân của bạn và dán Job Description của vị trí bạn muốn ứng tuyển."
  },
  {
    icon: <Sparkles className="w-6 h-6 text-foreground" />,
    title: "2. AI Xử Lý Thông Minh",
    description: "Gemini AI sẽ phân tích, tinh chỉnh kinh nghiệm của bạn để khớp nhất với yêu cầu công việc."
  },
  {
    icon: <Download className="w-6 h-6 text-foreground" />,
    title: "3. Tải PDF Sẵn Sàng",
    description: "Nhận ngay CV và Cover Letter chuẩn ATS, định dạng đẹp mắt chỉ sau vài giây."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hoạt Động Như Thế Nào?</h2>
          <p className="text-muted-foreground text-lg">
            3 bước đơn giản để có một bộ hồ sơ xin việc hoàn hảo.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center bg-background px-6 py-8 rounded-2xl border border-border md:border-none shadow-sm md:shadow-none"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6 shadow-sm border border-border">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
