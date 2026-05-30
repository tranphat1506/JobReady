import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
const { PDFParse } = require('pdf-parse');
import { AIParser, generatePdfFile, CVSchema, TemplateRegistry } from '@cv-generator/core';

// Nạp biến môi trường từ thư mục gốc
config({ path: path.resolve(__dirname, '../../../.env.development') });

const main = async () => {
  // Đọc tham số dòng lệnh
  const args = process.argv.slice(2);
  const useCachedJson = args.includes('--use-cache');

  const astJsonPath = path.join(__dirname, '../output_ast.json');

  let astJSON: CVSchema;

  // --- TRƯỜNG HỢP 1: SỬ DỤNG LẠI JSON CÓ SẴN ĐỂ TIẾT KIỆM API QUOTA ---
  if (useCachedJson) {
    if (!fs.existsSync(astJsonPath)) {
      console.error('❌ LỖI: Không tìm thấy file output_ast.json. Bạn cần chạy lệnh bình thường ít nhất 1 lần để AI sinh ra file này!');
      process.exit(1);
    }
    console.log('♻️ Đang đọc dữ liệu từ output_ast.json có sẵn...');
    console.log('💡 Bỏ qua gọi API Google Gemini để tiết kiệm Token/Chi phí.');
    astJSON = JSON.parse(fs.readFileSync(astJsonPath, 'utf-8')) as CVSchema;
  } 
  // --- TRƯỜNG HỢP 2: GỌI API GEMINI MỚI ---
  else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('LỖI: Không tìm thấy GEMINI_API_KEY trong file .env.development!');
      process.exit(1);
    }

    const parser = new AIParser(apiKey);

    const jdPath = path.join(__dirname, '../jd.txt');
    const cvPdfPath = path.join(__dirname, '../cv.pdf');
    const cvTxtPath = path.join(__dirname, '../cv.txt');

    let jobDescription = '';
    let rawCV = '';

    if (fs.existsSync(jdPath)) {
      jobDescription = fs.readFileSync(jdPath, 'utf-8');
    } else {
      jobDescription = `
        Tuyển dụng Frontend Developer (ReactJS).
        Yêu cầu: Tối thiểu 2 năm kinh nghiệm làm việc với ReactJS, TypeScript.
        Hiểu biết sâu sắc về kiến trúc component, state management (Redux, Zustand).
        Kỹ năng làm việc nhóm tốt, thành thạo Git.
      `;
      fs.writeFileSync(jdPath, jobDescription.trim());
      console.log('Đã tạo file jd.txt mẫu.');
    }

    if (fs.existsSync(cvPdfPath)) {
      console.log('Phát hiện file cv.pdf. Đang tiến hành bóc tách văn bản (parse PDF)...');
      const dataBuffer = fs.readFileSync(cvPdfPath);
      const pdfParser = new PDFParse({ data: dataBuffer });
      const parsedData = await pdfParser.getText();
      rawCV = parsedData.text;
      await pdfParser.destroy();
      console.log('✅ Đã đọc thành công nội dung CV cũ từ cv.pdf');
    } else if (fs.existsSync(cvTxtPath)) {
      rawCV = fs.readFileSync(cvTxtPath, 'utf-8');
      console.log('Đã đọc nội dung CV cũ từ cv.txt');
    } else {
      console.log('Không tìm thấy cv.pdf hay cv.txt, hệ thống sẽ TỰ ĐỘNG SINH CV MẪU dựa trên JD!');
    }

    console.log('Đang phân tích và xử lý bằng AI (Vui lòng đợi vài giây)...');
    
    try {
      astJSON = await parser.parseAndTailorCV(jobDescription, rawCV, 'Vietnamese');
      console.log('✅ AI đã sinh xong dữ liệu JSON AST thành công!');
      
      // Lưu file JSON ra ổ cứng để người dùng có thể xem hoặc tái sử dụng
      fs.writeFileSync(astJsonPath, JSON.stringify(astJSON, null, 2));
    } catch (error) {
      console.error('❌ Có lỗi xảy ra khi gọi AI:', error);
      process.exit(1);
    }
  }

  // --- KẾT XUẤT PDF ---
  try {
    // Ưu tiên sử dụng file avatar.png ở thư mục cli nếu user có để sẵn và AST không có avatar
    if (!astJSON.personal.avatar) {
      const defaultAvatarPath = path.join(__dirname, '../avatar.png');
      if (fs.existsSync(defaultAvatarPath)) {
        try {
          const imageBuffer = fs.readFileSync(defaultAvatarPath);
          const base64Image = imageBuffer.toString('base64');
          
          // Detect actual image format using magic bytes
          let ext = 'png';
          if (imageBuffer.length > 2 && imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
            ext = 'jpeg';
          }
          
          astJSON.personal.avatar = `data:image/${ext};base64,${base64Image}`;
          console.log(`Đã phát hiện và nhúng ảnh local: ${defaultAvatarPath} (Format: ${ext})`);
        } catch (e) {
          console.error('Không thể đọc file avatar.png:', e);
        }
      }
    }

    const availableTemplates = TemplateRegistry.getAvailableTemplates();
    console.log(`Đã tìm thấy ${availableTemplates.length} templates: ${availableTemplates.join(', ')}`);
    
    for (const templateId of availableTemplates) {
      const outPdfPath = path.join(__dirname, `../Result_${templateId}_CV.pdf`);
      console.log(`Đang vẽ file PDF bằng template '${templateId}'...`);
      await generatePdfFile(astJSON, outPdfPath, templateId);
      console.log(`✅ Đã xuất file PDF tại: ${outPdfPath}`);
    }
    
    console.log(`🎉 HOÀN TẤT! Đã kết xuất thành công ${availableTemplates.length} file PDF.`);
  } catch (error) {
    console.error('❌ Có lỗi xảy ra khi render PDF:', error);
  }
};

main();
