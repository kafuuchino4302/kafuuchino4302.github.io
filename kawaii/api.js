// api.js
import { systemPrompts, getRatingLabel } from './config.js';

const WORKER_URL = 'https://dark-cake-10ea.1454385662.workers.dev/';

export async function analyzeImage(imageDataUrl, aiType) {
  try {
    // 从config.js获取系统提示词
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

    const result = await response.json();
    
    // 添加评分标签
    result.ratingLabel = getRatingLabel(result.rating);
    
    return result;
  } catch (error) {
    console.error('分析图片时出错:', error);
    throw new Error(`分析失败: ${error.message}`);
  }
}
