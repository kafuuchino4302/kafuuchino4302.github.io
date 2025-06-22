import { systemPrompts } from './config.js';

export async function analyzeImage(imageDataUrl, aiType) {
    const systemPrompt = systemPrompts[aiType];

    if (!systemPrompt) {
        throw new Error(`无效的AI模式: ${aiType}`);
    }

    if (typeof websim === 'undefined' || !websim || !websim.chat) {
        throw new Error('萌度分析服务不可用');
    }

    let completion;
    try {
        completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "请分析这张图片的萌度",
                        },
                        {
                            type: "image_url",
                            image_url: { url: imageDataUrl },
                        },
                    ],
                },
            ],
            json: true,
        });

        return JSON.parse(completion.content);
    } catch (error) {
        console.error("萌度分析失败:", error);
        throw error;
    }
}