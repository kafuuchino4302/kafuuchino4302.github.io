import { systemPrompts } from './config.js';

export async function analyzeImage(imageDataUrl, aiType) {
  const systemPrompt = systemPrompts[aiType];

  if (!systemPrompt) {
    throw new Error(`Invalid AI type: ${aiType}`);
  }

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt + "\n请分析这张图片并给出评价：" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageDataUrl.split(",")[1],
            },
          },
        ],
      },
    ],
  };

  try {
    console.log("🎯 正在请求 Gemini 分析图片...");
    const response = await fetch("https://wispy-base-1388.1454385662.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 错误，状态码: ${response.status}`);
    }

    const result = await response.json();
    console.log("📦 Gemini 返回原始数据:", result);

    let explanation = "无法解析 AI 响应";

    if (result.error) {
      explanation = `AI 返回错误：${result.error.message || "未知错误"}`;
    } else {
      try {
        const parts = result?.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts) && parts.length > 0) {
          explanation = typeof parts[0].text === "string"
            ? parts[0].text
            : JSON.stringify(parts[0]);
        }
      } catch {
        explanation = "AI 响应格式异常";
      }
    }

    return { explanation };
  } catch (error) {
    console.error("❌ 分析过程中出错:", error);

    return {
      explanation: "😢 AI 没能成功分析图片，可能模型无响应或格式异常",
    };
  }
}
