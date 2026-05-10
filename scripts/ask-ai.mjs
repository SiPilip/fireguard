import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function main() {
  const prompt = process.argv.slice(2).join(' ');
  
  if (!prompt) {
    console.log('Usage: node scripts/ask-ai.mjs "Your question here"');
    process.exit(1);
  }

  console.log('🤖 Menghubungi DeepSeek via NVIDIA NIM...');

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "deepseek-ai/deepseek-v3",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    process.stdout.write('\nAI: ');
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
    process.stdout.write('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
