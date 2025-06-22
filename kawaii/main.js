import * as store from './store.js';
import * as ui from './ui.js';
import { analyzeImage } from './api.js';
import { getRatingLabel } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        previewContainer: document.getElementById('preview-container'),
        startAnalysisBtn: document.getElementById('start-analysis-btn'),
        changeImageBtn: document.getElementById('change-image-btn'),
        disclaimer: document.getElementById('disclaimer'),
        closeDisclaimerBtn: document.getElementById('close-disclaimer'),
        themeToggle: document.getElementById('theme-toggle'),
        tryAgainBtn: document.getElementById('try-again'),
        viewSavedBtn: document.getElementById('view-saved'),
        container: document.querySelector('.container'),
        resultContainer: document.getElementById('result-container'),
        imagePreviewContainerResult: document.getElementById('image-preview-container-result'),
        imagePreviewContainer: document.querySelector('.image-preview-container')
    };

    let currentAnalysisResult = null;
    let isSavedResultsVisible = false;
    let selectedImageDataUrl = null;

    function initialize() {
        setupEventListeners();
        ui.initializeTheme();
    }

    function handleFileSelect() {
        if (!elements.fileInput.files.length) return;

        const file = elements.fileInput.files[0];
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件哦~');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImageDataUrl = e.target.result;
            ui.showPreview(selectedImageDataUrl);
        };
        reader.readAsDataURL(file);
    }

    async function handleStartAnalysis() {
        if (!selectedImageDataUrl) return;

        ui.showLoading(selectedImageDataUrl);

        try {
            const aiType = document.querySelector('input[name="ai-type"]:checked').value;
            const response = await analyzeImage(selectedImageDataUrl, aiType);
            currentAnalysisResult = { ...response, image: selectedImageDataUrl, aiType };
            
            setTimeout(() => {
                ui.displayResult(currentAnalysisResult);
                ui.createSaveButton(handleSaveResult);
                ui.createShareButton(handleShareResult);
            }, 800);

        } catch (error) {
            console.error('分析萌度时出错:', error);
            ui.displayError('萌度分析失败，请重新上传图片~');
        }
    }
    
    function handleSaveResult() {
        if (currentAnalysisResult) {
            store.addSavedResult({ ...currentAnalysisResult, timestamp: new Date().toISOString() });
            if (isSavedResultsVisible) {
                renderSaved();
            }
        }
    }

    function handleShareResult() {
        if (!currentAnalysisResult) return;
        const { rating, verdict, explanation } = currentAnalysisResult;
        const ratingLabel = getRatingLabel(rating);
        const textToCopy = `我的萌度评分结果:\n\n萌度: ${ratingLabel} (${rating}/100)\n评语: "${explanation}"\n\n你也来试试吧！`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('萌度结果已复制');
        }).catch(err => {
            console.error('复制失败: ', err);
            alert('复制失败，请手动复制哦~');
        });
    }
    
    function handleDeleteResult(index) {
        store.deleteSavedResult(index);
        renderSaved();
    }

    function handleViewSavedResult(index) {
        const result = store.getSavedResults()[index];
        ui.showPopup(result);
    }
    
    async function handleTryAgain() {
        if (selectedImageDataUrl) {
            await handleStartAnalysis();
        } else {
            ui.resetToUpload();
            currentAnalysisResult = null;
        }
    }

    function handleChangeImage() {
        elements.fileInput.click();
    }
    
    function toggleSavedResults() {
        const existingContainer = document.querySelector('.saved-results');
        if (existingContainer) {
            existingContainer.remove();
            elements.viewSavedBtn.textContent = '📚 查看萌度记录';
            isSavedResultsVisible = false;
        } else {
            renderSaved();
            elements.viewSavedBtn.textContent = '📚 隐藏萌度记录';
            isSavedResultsVisible = true;
        }
    }
    
    function renderSaved() {
        const results = store.getSavedResults();
        const savedContainer = ui.createSavedResultsContainer(results, {
            onDelete: handleDeleteResult,
            onView: handleViewSavedResult,
        });
        
        const existingContainer = document.querySelector('.saved-results');
        if (existingContainer) existingContainer.remove();
        
        elements.container.appendChild(savedContainer);
    }

    function setupEventListeners() {
        const imageDropZones = [elements.uploadArea, elements.imagePreviewContainer, elements.imagePreviewContainerResult];
        
        imageDropZones.forEach(zone => {
            zone.addEventListener('click', () => elements.fileInput.click());
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                if (e.dataTransfer.files.length) {
                    elements.fileInput.files = e.dataTransfer.files;
                    handleFileSelect();
                }
            });
        });

        elements.fileInput.addEventListener('change', handleFileSelect);
        
        elements.startAnalysisBtn.addEventListener('click', handleStartAnalysis);
        elements.changeImageBtn.addEventListener('click', handleChangeImage);
        elements.closeDisclaimerBtn.addEventListener('click', () => ui.hideDisclaimer());
        elements.themeToggle.addEventListener('click', ui.toggleTheme);
        elements.tryAgainBtn.addEventListener('click', handleTryAgain);
        elements.viewSavedBtn.addEventListener('click', toggleSavedResults);
    }

    initialize();
});
