-- Tạo bucket 'avatars' công khai (public = true)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Cho phép MỌI NGƯỜI được XEM ảnh (để Load hiển thị lên Web)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Cho phép người dùng ĐÃ ĐĂNG NHẬP được TẢI ẢNH LÊN
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Cho phép người dùng ĐÃ ĐĂNG NHẬP được CẬP NHẬT/GHI ĐÈ ảnh
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
