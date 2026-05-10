import OpenAI from 'openai';

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export const getAICompletion = async (messages: any[], model?: string) => {
  try {
    const response = await nvidiaClient.chat.completions.create({
      model: model || process.env.MODEL_NAME || "deepseek-ai/deepseek-v3",
      messages: messages,
      temperature: 0.7,
      max_tokens: 4096,
    });

    return response.choices[0].message;
  } catch (error) {
    console.error('Error from NVIDIA NIM:', error);
    throw error;
  }
};

export default nvidiaClient;
