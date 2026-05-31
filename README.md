# CV Generator (AI-Powered) SaaS

Dự án tạo CV và Cover Letter tự động bằng AI, sử dụng cấu trúc AST (Abstract Syntax Tree) và xuất file PDF chuẩn ATS.

## Tổng quan
Dự án được xây dựng theo kiến trúc **Lego-style Monorepo**, tách biệt hoàn toàn phần Lõi xử lý (Core) thành các module độc lập. Điều này giúp tối ưu hóa Tree Shaking và tránh lỗi môi trường khi chạy trên Frontend/Backend.

- **`packages/schema`**: Core interfaces (Zod/Typescript definitions), Data Models chuẩn của AST. Không phụ thuộc thư viện ngoài.
- **`packages/ai`**: Logic gọi Gemini API để xử lý CV Parsing và Tailoring.
- **`packages/renderer`**: Các component React vẽ file PDF (`@react-pdf/renderer`).
- **`apps/cli`**: Ứng dụng chạy trên Terminal để kiểm thử hệ thống.
- **`apps/web`**: Giao diện chính của nền tảng SaaS xây dựng bằng Next.js 15, TailwindCSS 4, và shadcn/ui.

## Tài liệu Hệ thống (Docs)
Vui lòng tham khảo thư mục `docs/` để hiểu rõ về luồng hoạt động:
- [Kiến trúc Hệ thống (Architecture)](docs/ARCHITECTURE.md)
- [Cấu trúc Dữ liệu (AST Schema)](docs/AST_SCHEMA.md)
- [Cẩm nang Prompt AI (Prompts)](docs/PROMPTS.md)
- [Lộ trình Phát triển (Roadmap)](docs/ROADMAP.md)

## Bắt đầu cài đặt
Cài đặt các gói bằng pnpm:
```bash
pnpm install
```

Kiểm tra CLI (build packages & chạy sinh PDF mẫu từ cache):
```bash
pnpm run start:cli:cache
```

Khởi chạy Web App:
```bash
cd apps/web
pnpm run dev
```
