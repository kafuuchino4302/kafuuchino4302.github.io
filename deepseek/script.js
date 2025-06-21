// 替换为你的Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev";

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const generateBtn = document.getElementById('generate-btn');
    
    generateBtn.addEventListener('click', generate);
    
    async function generate() {
        const prompt = input.value.trim();
        if (!prompt) {
            alert('请输入内容');
            return;
        }
        
        // 禁用按钮并显示加载状态
        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';
        output.textContent = '';
        
        try {
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            
            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                output.textContent = `错误: ${data.error}`;
            } else {
                output.textContent = data.response;
            }
        } catch (error) {
            output.textContent = `发生错误: ${error.message}`;
        } finally {
            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.textContent = '生成';
        }
    }
});
