// 配置
const CONFIG = {
    CLOUDFLARE_WORKER_URL: "https://your-worker.your-subdomain.workers.dev",
    MAX_HISTORY: 20, // 最大历史消息数
    USER_NAME: "你",
    BOT_NAME: "DeepSeek",
    USER_AVATAR: '<i class="fas fa-user"></i>',
    BOT_AVATAR: '<i class="fas fa-robot"></i>',
    STATUS_ELEMENT: document.getElementById('status'),
    AUTO_SCROLL: true
};

// DOM元素
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const autoScrollCheckbox = document.getElementById('auto-scroll');

// 对话历史
let conversationHistory = [];

// 初始化
function init() {
    loadSettings();
    updateStatus('就绪', 'success');
    scrollToBottom();
    
    // 设置事件监听器
    sendBtn.addEventListener('click', sendMessage);
    clearBtn.addEventListener('click', clearConversation);
    userInput.addEventListener('keydown', handleKeyPress);
    autoScrollCheckbox.addEventListener('change', toggleAutoScroll);
    
    // 添加欢迎消息
    addMessage(CONFIG.BOT_NAME, "你好！我是DeepSeek代码助手，我可以帮你生成代码、解答技术问题。请问有什么可以帮您的？", 'bot');
}

// 加载设置
function loadSettings() {
    const savedAutoScroll = localStorage.getItem('autoScroll');
    if (savedAutoScroll !== null) {
        autoScrollCheckbox.checked = savedAutoScroll === 'true';
        CONFIG.AUTO_SCROLL = autoScrollCheckbox.checked;
    }
}

// 保存设置
function saveSettings() {
    localStorage.setItem('autoScroll', CONFIG.AUTO_SCROLL.toString());
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // 禁用按钮并清除输入
    sendBtn.disabled = true;
    userInput.disabled = true;
    userInput.value = '';
    
    // 添加用户消息
    addMessage(CONFIG.USER_NAME, message, 'user');
    
    try {
        updateStatus('思考中...', 'processing');
        
        // 添加到历史
        conversationHistory.push({ role: "user", content: message });
        
        // 只保留最近的MAX_HISTORY条消息
        if (conversationHistory.length > CONFIG.MAX_HISTORY) {
            conversationHistory = conversationHistory.slice(-CONFIG.MAX_HISTORY);
        }
        
        // 创建消息
        const requestData = {
            prompt: conversationHistory.map(msg => `${msg.role === 'user' ? CONFIG.USER_NAME : CONFIG.BOT_NAME}: ${msg.content}`).join('\n')
        };
        
        // 显示正在输入状态
        const messageElement = addMessage(CONFIG.BOT_NAME, '<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot', true);
        
        // 发送请求
        const response = await fetch(CONFIG.CLOUDFLARE_WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 移除正在输入状态
        messageElement.remove();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 添加AI回复
        const formattedResponse = formatCodeBlocks(data.response);
        addMessage(CONFIG.BOT_NAME, formattedResponse, 'bot');
        
        // 添加到历史
        conversationHistory.push({ role: "assistant", content: data.response });
        
        updateStatus('就绪', 'success');
    } catch (error) {
        console.error('请求出错:', error);
        addMessage(CONFIG.BOT_NAME, `抱歉，处理您的请求时出错: ${error.message}`, 'bot');
        updateStatus('错误', 'error');
    } finally {
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// 添加消息到聊天历史
function addMessage(sender, content, type, isTemp = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${type}-message`);
    
    // 添加头像和发送者名称
    const avatar = type === 'user' ? CONFIG.USER_AVATAR : CONFIG.BOT_AVATAR;
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="avatar">${avatar}</span>
            <strong>${sender}</strong>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    if (isTemp) {
        messageElement.classList.add('temp-message');
    }
    
    chatHistory.appendChild(messageElement);
    
    // 自动滚动到底部
    if (CONFIG.AUTO_SCROLL) {
        scrollToBottom();
    }
    
    return messageElement;
}

// 格式化代码块
function formatCodeBlocks(text) {
    // 检测代码块（以```开头和结尾）
    const codeBlockRegex = /```([\s\S]*?)```/g;
    
    return text.replace(codeBlockRegex, (match, code) => {
        // 移除多余的语言标识
        const cleanCode = code.replace(/^\w+\n/, '');
        return `<pre><code>${cleanCode.trim()}</code></pre>`;
    });
}

// 清空对话
function clearConversation() {
    chatHistory.innerHTML = '';
    conversationHistory = [];
    addMessage(CONFIG.BOT_NAME, "对话已重置，请问有什么可以帮助您的？", 'bot');
}

// 处理键盘事件
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// 滚动到底部
function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// 切换自动滚动
function toggleAutoScroll() {
    CONFIG.AUTO_SCROLL = autoScrollCheckbox.checked;
    saveSettings();
    if (CONFIG.AUTO_SCROLL) {
        scrollToBottom();
    }
}

// 更新状态
function updateStatus(text, type) {
    CONFIG.STATUS_ELEMENT.textContent = text;
    CONFIG.STATUS_ELEMENT.className = '';
    
    switch (type) {
        case 'success':
            CONFIG.STATUS_ELEMENT.classList.add('success');
            break;
        case 'error':
            CONFIG.STATUS_ELEMENT.classList.add('error');
            break;
        case 'processing':
            CONFIG.STATUS_ELEMENT.classList.add('processing');
            break;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
