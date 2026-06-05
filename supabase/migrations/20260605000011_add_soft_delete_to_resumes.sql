-- Thêm cột deleted_at để hỗ trợ Soft Delete (xóa mềm)
ALTER TABLE public.resumes ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Đánh Index để tăng tốc truy vấn khi filter deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_resumes_deleted_at ON public.resumes(deleted_at);
