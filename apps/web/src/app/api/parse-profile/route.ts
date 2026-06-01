import { NextResponse } from 'next/server';
import { AIParser } from '@cv-generator/ai';

const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    let contentToParse = '';

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      contentToParse = pdfData.text;
    } else if (text) {
      contentToParse = text;
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const aiParser = new AIParser(process.env.GEMINI_API_KEY);
    const parsedData = await aiParser.parseMasterProfile(contentToParse);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('AI Parse Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
