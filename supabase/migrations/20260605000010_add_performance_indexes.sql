-- Index cho bảng resumes để query user_id nhanh hơn (áp dụng cho hầu hết các hàm fetch của dashboard)
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

-- Index 복합 (Composite Index) cho status và updated_at để tăng tốc câu query lấy danh sách tài liệu
-- .or('status.eq.completed,and(status.eq.draft,updated_at.gte.yesterday)')
CREATE INDEX IF NOT EXISTS idx_resumes_status_updated_at ON public.resumes(status, updated_at);

-- Index cho resume_versions.resume_id để tăng tốc độ JOIN khi fetch version history hoặc lấy latest version
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);

-- Index cho ai_generation_logs.user_id để Realtime listener hứng sự kiện nhanh hơn
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user_id ON public.ai_generation_logs(user_id);
