import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { CVSchema } from '@cv-generator/schema';
import { buildCVPrompt } from './prompts/cv.prompt';
import { buildCoverLetterPrompt } from './prompts/coverLetter.prompt';
import { buildMasterProfilePrompt } from './prompts/masterProfile.prompt';
import { mapProviderError } from './errors';

export * from './errors';

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class AIParser {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async parseAndTailorCV(jobDescription: string, rawCV?: string, targetLanguage: string = 'English', masterProfile?: object, toneOfVoice?: string): Promise<{ data: CVSchema; usage: AIUsage }> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model: ${modelName}`);

    const prompt = buildCVPrompt(jobDescription, rawCV, targetLanguage, masterProfile, toneOfVoice);

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
    };

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      let usage: AIUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      // In thông số Token tiêu hao
      if (result.response.usageMetadata) {
        usage = {
          promptTokens: result.response.usageMetadata.promptTokenCount,
          completionTokens: result.response.usageMetadata.candidatesTokenCount,
          totalTokens: result.response.usageMetadata.totalTokenCount,
        };
        console.log('\n📊 THỐNG KÊ TOKEN SỬ DỤNG (Gemini):');
        console.log(`- Prompt Tokens (đầu vào): ${usage.promptTokens}`);
        console.log(`- Output Tokens (đầu ra):  ${usage.completionTokens}`);
        console.log(`- Tổng Tokens:             ${usage.totalTokens}\n`);
      }

      let responseText = result.response.text();
      // Dự phòng xóa markdown block nếu có
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      return { data: JSON.parse(responseText) as CVSchema, usage };
    } catch (error) {
      console.error('Error parsing CV with AI:', error);
      mapProviderError(error);
    }
  }

  public async parseAndTailorCoverLetter(jobDescription: string, rawCV: string, targetLanguage: string = 'English'): Promise<{ data: any; usage: AIUsage }> {
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

    let usage: AIUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    if (response.usageMetadata) {
      usage = {
        promptTokens: response.usageMetadata.promptTokenCount,
        completionTokens: response.usageMetadata.candidatesTokenCount,
        totalTokens: response.usageMetadata.totalTokenCount,
      };
    }

    try {
      const jsonStrMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonStrMatch ? jsonStrMatch[1] : text;
      return { data: JSON.parse(jsonText), usage };
    } catch (error) {
      console.error('Failed to parse Cover Letter Gemini response as JSON. Raw response:', text);
      mapProviderError(error);
    }
  }

  public async parseMasterProfile(rawCV: string): Promise<{ data: any; usage: AIUsage }> {
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

      let usage: AIUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      if (result.response.usageMetadata) {
        usage = {
          promptTokens: result.response.usageMetadata.promptTokenCount,
          completionTokens: result.response.usageMetadata.candidatesTokenCount,
          totalTokens: result.response.usageMetadata.totalTokenCount,
        };
      }

      let jsonText = result.response.text().trim();

      // Clean up markdown if the model still outputs it
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      return { data: JSON.parse(jsonText), usage };
    } catch (error) {
      console.error('Error parsing Master Profile with AI:', error);
      mapProviderError(error);
    }
  }
}
