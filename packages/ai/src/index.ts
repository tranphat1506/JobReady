import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { CVSchema } from '@cv-generator/schema';
import { buildCVPrompt } from './prompts/cv.prompt';
import { buildCoverLetterPrompt } from './prompts/coverLetter.prompt';
import { buildMasterProfilePrompt } from './prompts/masterProfile.prompt';

export class AIParser {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async parseAndTailorCV(jobDescription: string, rawCV?: string, targetLanguage: string = 'English', masterProfile?: object): Promise<CVSchema> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model: ${modelName}`);

    const prompt = buildCVPrompt(jobDescription, rawCV, targetLanguage, masterProfile);

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
    };

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      // In thông số Token tiêu hao
      if (result.response.usageMetadata) {
        console.log('\n📊 THỐNG KÊ TOKEN SỬ DỤNG (Gemini):');
        console.log(`- Prompt Tokens (đầu vào): ${result.response.usageMetadata.promptTokenCount}`);
        console.log(`- Output Tokens (đầu ra):  ${result.response.usageMetadata.candidatesTokenCount}`);
        console.log(`- Tổng Tokens:             ${result.response.usageMetadata.totalTokenCount}\n`);
      }

      let responseText = result.response.text();
      // Dự phòng xóa markdown block nếu có
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(responseText) as CVSchema;
    } catch (error) {
      console.error('Error parsing CV with AI:', error);
      throw error;
    }
  }

  public async parseAndTailorCoverLetter(jobDescription: string, rawCV: string, targetLanguage: string = 'English'): Promise<any> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model cho Cover Letter: ${modelName}`);

    const prompt = buildCoverLetterPrompt(jobDescription, rawCV, targetLanguage);

    const config: GenerationConfig = {
      temperature: 0.7,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: config,
    });

    const response = await result.response;
    const text = response.text();

    try {
      const jsonStrMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonStrMatch ? jsonStrMatch[1] : text;
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse Cover Letter Gemini response as JSON. Raw response:', text);
      throw error;
    }
  }

  public async parseMasterProfile(rawCV: string): Promise<any> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model cho Master Profile: ${modelName}`);

    const prompt = buildMasterProfilePrompt(rawCV);

    const config: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.2,
    };

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config,
      });

      let jsonText = result.response.text().trim();

      // Clean up markdown if the model still outputs it
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error parsing Master Profile with AI:', error);
      throw error;
    }
  }
}
