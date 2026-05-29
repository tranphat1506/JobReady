# Cấu trúc Dữ liệu (AST Schema)

Đây là tài liệu cực kỳ quan trọng. Nó định nghĩa "Hợp đồng dữ liệu" giữa AI và phần mềm của chúng ta. 
Khi gửi Job Description và CV thô cho AI, ta sẽ ép AI trả về dữ liệu đúng chuẩn JSON này.

## Định dạng JSON Mẫu (Sơ bộ)

```json
{
  "personal": {
    "fullName": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "location": "Ho Chi Minh City, Vietnam",
    "links": [
      { "name": "LinkedIn", "url": "https://linkedin.com/in/nguyenvana" },
      { "name": "GitHub", "url": "https://github.com/nguyenvana" }
    ]
  },
  "summary": "Một đoạn tóm tắt khoảng 2-3 câu làm nổi bật điểm mạnh phù hợp với Job Description...",
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "startDate": "2021-05",
      "endDate": "Present",
      "description": [
        "Phát triển hệ thống A giúp tăng 20% hiệu suất.",
        "Thiết kế kiến trúc B theo chuẩn Microservices."
      ]
    }
  ],
  "education": [
    {
      "institution": "University of Science",
      "degree": "Bachelor of Information Technology",
      "startDate": "2017",
      "endDate": "2021"
    }
  ],
  "skills": [
    {
      "category": "Programming Languages",
      "items": ["JavaScript", "TypeScript", "Python"]
    },
    {
      "category": "Frameworks",
      "items": ["React", "Node.js"]
    }
  ]
}
```

*Lưu ý: Schema này sẽ được hiện thực hóa bằng TypeScript Interfaces trong `packages/core/types` ở giai đoạn code.*
