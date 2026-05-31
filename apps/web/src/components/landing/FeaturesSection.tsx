"use client";

import { motion } from "framer-motion";
import { BrainCircuit, FileSignature, Target, Zap } from "lucide-react";

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "Phân Tích JD Thông Minh",
    description: "AI tự động trích xuất từ khóa và kỹ năng từ Job Description, giúp CV của bạn vượt qua vòng quét ATS dễ dàng."
  },
  {
    icon: <FileSignature className="w-8 h-8 text-primary" />,
    title: "Tự Động Viết Cover Letter",
    description: "Sinh ra thư xin việc được cá nhân hóa cao độ, phù hợp hoàn hảo với kinh nghiệm của bạn và yêu cầu công việc."
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Chuẩn ATS Quốc Tế",
    description: "Xuất file PDF với định dạng và cấu trúc được tối ưu hóa cho các hệ thống quét hồ sơ (ATS) phổ biến nhất."
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Tốc Độ Siêu Tốc",
    description: "Chỉ tốn vài giây để từ một JD trống trơn có ngay trọn bộ hồ sơ ứng tuyển chuyên nghiệp."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính Năng Ưu Việt</h2>
          <p className="text-muted-foreground text-lg">
            Sức mạnh của trí tuệ nhân tạo được gói gọn trong một công cụ, giúp bạn chinh phục mọi nhà tuyển dụng khó tính nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-6 p-4 bg-muted rounded-xl inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
