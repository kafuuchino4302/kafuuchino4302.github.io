import * as store from './store.js';
import * as ui from './ui.js';
import { analyzeImage } from './api.js';
import { getRatingLabel } from './config.js';

/**
 * Compresses an image.
 * @param {string} imageDataUrl The base64 data URL of the original image.
 * @param {object} options Compression options.
 * @param {number} options.maxWidth Maximum width of the compressed image.
 * @param {number} options.quality Compression quality (0 to 1).
 * @returns {Promise<string>} The base64 data URL of the compressed image.
 */
function compressImage(imageDataUrl, options = { maxWidth: 800, quality: 0.7 }) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            
            let width = img.width;
            let height = img.height;

            // Scale down the image if its width exceeds the max width
            if (width > options.maxWidth) {
                height = (options.maxWidth / width) * height;
                width = options.maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert canvas content to a JPEG data URL with the specified quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', options.quality);
            
            resolve(compressedDataUrl);
        };
        img.onerror = (error) => {
            console.error("Image failed to load, cannot compress", error);
            // If compression fails, we can either reject or resolve with the original URL.
            // Rejecting is better to show a specific error message.
            reject(new Error('Image compression failed'));
        };
        img.src = imageDataUrl;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
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
    let selectedImageDataUrl = null; // Store the original, uncompressed image URL

    // --- Initialization ---
    function initialize() {
        setupEventListeners();
        ui.initializeTheme();
    }

    // --- Event Handlers ---
    function handleFileSelect() {
        if (!elements.fileInput.files.length) return;

        const file = elements.fileInput.files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
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
            // --- NEW: Compress the image before sending ---
            console.log(`Original image size: ${(selectedImageDataUrl.length * 0.75 / 1024).toFixed(2)} KB`);
            const compressedImageDataUrl = await compressImage(selectedImageDataUrl, { maxWidth: 800, quality: 0.7 });
            console.log(`Compressed image size: ${(compressedImageDataUrl.length * 0.75 / 1024).toFixed(2)} KB`);
            // --- End of compression step ---

            const aiType = document.querySelector('input[name="ai-type"]:checked').value;
            
            // MODIFIED: Use the compressed image for analysis
            const response = await analyzeImage(compressedImageDataUrl, aiType);
            
            // MODIFIED: Save the compressed image to save local storage space
            currentAnalysisResult = { ...response, image: compressedImageDataUrl, aiType };
            
            // A short delay to make the loading feel more deliberate
            setTimeout(() => {
                ui.displayResult(currentAnalysisResult);
                ui.createSaveButton(handleSaveResult);
                ui.createShareButton(handleShareResult);
            }, 500);

        } catch (error) {
            console.error('Error during analysis:', error);
            if (error.message === 'Image compression failed') {
                ui.displayError('Image compression failed. Please try another image.');
            } else {
                ui.displayError('An error occurred. Please try uploading again or refresh the page. Check console for details.');
            }
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
        // Note: The rating scale in your config seems to be 0-100, but the text here says 0-10.
        // You might want to align these. I'll keep the text as is.
        const textToCopy = `My AI image rating:\n\nVerdict: ${verdict}\nRating: ${ratingLabel} (${rating}/10)\nExplanation: "${explanation}"\n\nTry it yourself!`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('Result copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy');
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
            elements.viewSavedBtn.textContent = '📁 View Saved Results';
            isSavedResultsVisible = false;
        } else {
            renderSaved();
            elements.viewSavedBtn.textContent = '📁 Hide Saved Results';
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

    // --- Event Listeners Setup ---
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

    // --- Start Application ---
    initialize();
});
