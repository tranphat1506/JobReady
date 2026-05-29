# Lộ trình Phát triển (Roadmap)

Dự án CV Generator sẽ trải qua 3 giai đoạn kiến trúc, đảm bảo khả năng mở rộng bền vững:

## Giai đoạn 1: Lõi Hệ Thống & Local MVP (Hiện tại)
- Thiết lập cấu trúc Monorepo (`pnpm workspace`).
- Xây dựng `packages/core`:
  - Khai báo TypeScript Interfaces (`AST_SCHEMA`).
  - Viết module `ai-parser` gọi API Google Gemini để trích xuất text thành JSON.
  - Viết module `pdf-engine` dùng `@react-pdf/renderer` để vẽ file PDF từ JSON.
- Xây dựng `apps/cli`: Ứng dụng Node.js chạy trên dòng lệnh, dùng để gọi `core` và test quá trình tự động sinh CV PDF tại Local.

## Giai đoạn 2: Web Client (Trình duyệt)
- Xây dựng `apps/web` sử dụng Next.js hoặc Vite (React).
- Tái sử dụng `packages/core` để nhúng khung Live Preview CV vào web.
- Vì chưa có Backend, người dùng sẽ sử dụng mô hình **Bring Your Own Key (BYOK)**: Tự nhập API Key của Gemini/OpenAI của họ vào giao diện để dùng tính năng AI.

## Giai đoạn 3: SaaS Platform (Cloud Service)
- Xây dựng `apps/api` (Backend Express/NestJS) kết nối Database.
- Tái sử dụng tính năng gọi AI từ `packages/core` đưa vào Server để giấu API Key của nền tảng, đảm bảo an toàn.
- Cung cấp tính năng Lưu trữ CV, Đăng nhập, và tính phí (Billing) hoặc giới hạn lượt dùng AI.
