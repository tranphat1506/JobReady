# CV Generator (AI-Powered)

Dự án tạo CV và Cover Letter tự động bằng AI, sử dụng cấu trúc AST (Abstract Syntax Tree) và xuất file PDF chuẩn ATS.

## Tổng quan
Dự án được xây dựng theo kiến trúc **Monorepo**, tách biệt hoàn toàn phần Lõi xử lý (Core) và giao diện. Mục tiêu ban đầu là chạy Local MVP.
- **`packages/core`**: Chứa logic gọi AI, định nghĩa chuẩn JSON AST và render bản PDF (sử dụng `@react-pdf/renderer`).
- **`apps/cli`**: Ứng dụng chạy trên Terminal để kiểm thử hệ thống.

## Tài liệu Hệ thống (Docs)
Vui lòng tham khảo thư mục `docs/` để hiểu rõ về luồng hoạt động:
- [Kiến trúc Hệ thống (Architecture)](docs/ARCHITECTURE.md)
- [Cấu trúc Dữ liệu (AST Schema)](docs/AST_SCHEMA.md)
- [Cẩm nang Prompt AI (Prompts)](docs/PROMPTS.md)
- [Lộ trình Phát triển (Roadmap)](docs/ROADMAP.md)

## Bắt đầu cài đặt
*(Đang cập nhật hướng dẫn cho pnpm workspace...)*
