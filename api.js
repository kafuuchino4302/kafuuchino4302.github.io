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
    const response = await fetch("https://wispy-base-1388.1454385662.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 错误，状态码: ${response.status}`);
    }

    const result = await response.json();

    const explanation =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "无法解析 AI 响应";

    const verdict = /不上/.test(explanation) ? "PASS" : "SMASH";
    const rating = verdict === "PASS"
      ? Math.floor(Math.random() * 5) + 1
      : Math.floor(Math.random() * 4) + 7;

    return {
      rating,
      verdict,
      explanation,
    };
  } catch (error) {
    console.error("分析图片时出错:", error);
    throw error;
  }
}
