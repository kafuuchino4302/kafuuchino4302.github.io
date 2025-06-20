import { systemPrompts, getRatingLabel, PROMPT_VERSION } from './config.js';

const WORKER_URL = 'https://wispy-base-1388.1454385662.workers.dev/';

export async function analyzeImage(imageDataUrl, aiType) {
  try {
    // 从config.js获取系统提示词
    const systemPrompt = systemPrompts[aiType] || systemPrompts.brief;
    
    // 压缩图片以减少传输大小
    const compressedImage = await compressImage(imageDataUrl, 800, 0.8);
    
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageData: compressedImage,
        systemPrompt, // 传递提示词
        version: PROMPT_VERSION // 传递版本号用于调试
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

// 图片压缩函数
async function compressImage(dataUrl, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
  });
}
