-- Bật Realtime cho các bảng cần thiết để UI có thể nhận tín hiệu
ALTER PUBLICATION supabase_realtime ADD TABLE ai_generation_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE resumes;
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
