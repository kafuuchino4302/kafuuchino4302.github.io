import { systemPrompts } from './config.js';

const WORKER_URL = 'https://bitter-king-6ce3.1454385662.workers.dev/'; // 替换为实际地址

export async function analyzeImage(imageDataUrl, aiType) {
  try {
    const systemPrompt = systemPrompts[aiType] || systemPrompts.brief;

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageData: imageDataUrl,
        systemPrompt 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('分析失败:', error);
    throw new Error(`萌度分析失败: ${error.message}`);
  }
}
