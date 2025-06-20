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
          { text: systemPrompt + "\n请分析这张图片并决定的：上还是不上？" },
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
    console.log("🎯 即将发送请求到 Gemini Worker");
    const response = await fetch("https://wispy-base-1388.1454385662.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 错误，状态码: ${response.status}`);
    }

    const result = await response.json();
    console.log("🔍 Gemini 返回原始数据:", result);

    // 尝试提取文本内容
    let explanation = "无法解析 AI 响应";
    try {
      const parts = result?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        explanation = typeof parts[0]?.text === "string"
          ? parts[0].text
          : JSON.stringify(parts[0]);
      }
    } catch (e) {
      explanation = "AI 响应格式异常";
    }

    const verdict = /不上/.test(explanation) ? "PASS" : "SMASH";
    const rating = verdict === "PASS"
      ? Math.floor(Math.random() * 5) + 1
      : Math.floor(Math.random() * 4) + 7;

    console.log("✅ 分析完成:", { rating, verdict, explanation });

    return {
      rating,
      verdict,
      explanation,
    };
  } catch (error) {
    console.error("❌ 分析图片时出错:", error);

    // 尝试打印原始响应（如果有）
    try {
      const rawText = await error?.response?.text?.();
      console.log("⚠️ Gemini 返回的原始文本:", rawText);
    } catch {}

    return {
      rating: 0,
      verdict: "ERROR",
      explanation: "😢 AI 没能成功分析图片，可能是响应格式异常或模型无响应",
    };
  }
}
