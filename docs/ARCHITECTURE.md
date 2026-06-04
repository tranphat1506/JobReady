# Kiến trúc Hệ thống SaaS

Dự án sử dụng phương pháp **Lego-style Monorepo** để đảm bảo khả năng tái sử dụng code tốt nhất, hỗ trợ Next.js App Router (phân chia Server/Client rõ ràng) và tránh các lỗi Tree-Shaking.

## 1. Cấu trúc Thư mục

```text
CV-Generator/
├── packages/              # Lõi hệ thống (Tách thành các khối Lego)
│   ├── schema/            # Định nghĩa AST Schema (Zod/Interfaces). Độc lập hoàn toàn.
│   ├── ai/                # Logic gọi Google Gemini API (Chỉ chạy trên Server). Phụ thuộc schema.
│   └── renderer/          # Các component React vẽ file PDF (@react-pdf). Phụ thuộc schema.
├── apps/
│   ├── cli/               # App Node.js gọi các packages để chạy test ở môi trường Local.
│   └── web/               # Next.js Web App SaaS UI (App Router, shadcn/ui).
└── docs/                  # Tài liệu hệ thống
```

## 2. Sơ đồ Luồng (Data Flow) - Kiến trúc SaaS

```mermaid
flowchart TD
    subgraph Client ["Next.js Client (Browser)"]
        UI["UI (Form / Dashboard)"]
        Preview["PDF Viewer Preview"]
    end
    
    subgraph Server ["Next.js Server / API Routes"]
        AI_Pkg["@cv-generator/ai (Gemini)"]
        Schema["@cv-generator/schema"]
    end
    
    subgraph Renderer ["@cv-generator/renderer"]
        PDF["React-PDF Engine"]
    end
    
    UI -->|"1. User Input (Profile/JD)"| Server
    Server -->|"2. Parse / Tailor (Gemini)"| AI_Pkg
    AI_Pkg -->|"3. Dữ liệu chuẩn"| Schema
    Schema -->|"4. Trả JSON AST"| UI
    
    UI -->|"5. Truyền JSON AST"| Renderer
    Renderer -->|"6. Vẽ Component PDF"| PDF
    PDF -->|"7. Hiển thị/Tải xuống"| Preview
```

## 3. Lý do Tách Gói (Lego-style)
Kiến trúc nguyên khối `packages/core` (cũ) gặp vấn đề khi Next.js cố gắng compile các thư viện Backend (như `@google/generative-ai` hoặc `fs`, `path`) vào Client bundle khi sử dụng chung với `@react-pdf/renderer` (chạy trên Client).

Bằng cách tách thành 3 gói riêng biệt:
- Giao diện Client chỉ việc import `@cv-generator/schema` (nhẹ) và `@cv-generator/renderer` (chỉ phụ thuộc React).
- API Server sẽ import `@cv-generator/schema` và `@cv-generator/ai` để gọi Gemini một cách an toàn.
- Ngăn chặn hoàn toàn lỗi môi trường và rò rỉ API Keys.

## 4. Kiến trúc Async (Background Jobs & Realtime)

Để giải quyết giới hạn Timeout của Vercel (10s - 60s) khi gọi AI và xử lý các tác vụ nặng (Sinh CV, Parse PDF), hệ thống sẽ áp dụng mô hình Queue & Realtime chuẩn Enterprise:

```mermaid
flowchart TD
    subgraph Client ["Next.js Client"]
        UI["UI (Loading / Editor)"]
    end
    
    subgraph Server ["Next.js API"]
        API["API Route (VD: /api/generate-cv)"]
    end

    subgraph Queue ["Inngest (Background Jobs)"]
        Worker["Inngest Worker (Chạy ngầm)"]
    end

    subgraph Database ["Supabase"]
        DB["PostgreSQL (resumes / profiles)"]
        Realtime["Supabase Realtime (WebSockets)"]
    end

    UI -->|"1. Gửi request"| API
    API -->|"2. Bắn sự kiện (Event)"| Queue
    API -.->|"3. Trả về 202 Accepted liền"| UI
    UI -->|"4. Subscribe lắng nghe DB"| Realtime
    
    Queue -->|"5. Chạy AI / Xử lý"| Worker
    Worker -->|"6. Lưu kết quả"| DB
    DB -->|"7. Bắn Event chèn dữ liệu mới"| Realtime
    Realtime -->|"8. Push Notification qua Socket"| UI
```

### Ưu điểm của mô hình này:
- **Chống Timeout:** API không còn phải đợi (await) AI gen xong. Trình duyệt nhận được phản hồi ngay lập tức (Non-blocking).
- **Trải nghiệm Realtime (UX):** Không sử dụng Short-polling (Fetch liên tục gây quá tải). Trình duyệt kết nối Socket tới Supabase và nhận thông báo ngay đúng giây phút CV được tạo xong.
- **Tính khả thi mở rộng (Scalability & Prioritization):** Khi lưu lượng truy cập lớn, Queue (Inngest) sẽ giúp xếp hàng các yêu cầu. Dễ dàng triển khai logic: User Premium được ưu tiên xử lý trước, User Free chờ khi rảnh rỗi.
