// Currency patterns for detection
const CURRENCY_PATTERNS = {
    USD: /\$|USD|Dollar/i,
    EUR: /€|EUR|Euro/i,
    GBP: /£|GBP|Pound/i,
    JPY: /¥|JPY|Yen/i,
    GHS: /₵|GHS|Cedi/i,
    NGN: /₦|NGN|Naira/i,
    CNY: /¥|CNY|Yuan/i,
    INR: /₹|INR|Rupee/i,
};

let imageCapture = null;
let scanning = false;

// Check if device is mobile
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

async function captureCurrency() {
    try {
        if (!document.getElementById('scanner-container')) {
            createScannerUI();
        }

        // Configure video constraints based on device
        const videoConstraints = {
            facingMode: isMobile() ? 'environment' : 'user',
            width: { ideal: isMobile() ? window.innerWidth : 1280 },
            height: { ideal: isMobile() ? window.innerHeight : 720 }
        };

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: videoConstraints
        });

        const videoElement = document.getElementById('scanner-video');
        videoElement.srcObject = stream;
        
        document.getElementById('scanner-container').style.display = 'flex';
        
        const track = stream.getVideoTracks()[0];
        imageCapture = new ImageCapture(track);

        // Enable capture button
        document.getElementById('capture-button').disabled = false;

        // Add orientation change handler for mobile
        if (isMobile()) {
            window.addEventListener('orientationchange', handleOrientationChange);
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Camera access failed. Please check permissions and try again.');
    }
}

function createScannerUI() {
    const scannerContainer = document.createElement('div');
    scannerContainer.id = 'scanner-container';
    scannerContainer.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: ${isMobile() ? '10px' : '20px'};
    `;

    // Responsive tab interface
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
        display: flex;
        gap: ${isMobile() ? '5px' : '10px'};
        margin-bottom: ${isMobile() ? '10px' : '20px'};
        width: 100%;
        max-width: 600px;
        justify-content: center;
    `;

    const createTab = (text, onClick) => {
        const tab = document.createElement('button');
        tab.textContent = text;
        tab.onclick = onClick;
        tab.style.cssText = `
            padding: ${isMobile() ? '8px 15px' : '10px 20px'};
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: ${isMobile() ? '14px' : '16px'};
            flex: 1;
            max-width: 200px;
        `;
        return tab;
    };

    const cameraTab = createTab('📷 Camera', () => switchTab('camera'));
    const uploadTab = createTab('📤 Upload', () => switchTab('upload'));

    tabContainer.appendChild(cameraTab);
    tabContainer.appendChild(uploadTab);

    // Responsive camera view
    const cameraView = document.createElement('div');
    cameraView.id = 'camera-view';
    cameraView.style.cssText = `
        position: relative;
        width: 100%;
        max-width: ${isMobile() ? '100%' : '800px'};
        display: flex;
        justify-content: center;
    `;
    
    const video = document.createElement('video');
    video.id = 'scanner-video';
    video.autoplay = true;
    video.style.cssText = `
        max-width: 100%;
        max-height: ${isMobile() ? '80vh' : '70vh'};
        border: 2px solid #fff;
        border-radius: 8px;
        object-fit: contain;
    `;

    // Responsive upload view
    const uploadView = document.createElement('div');
    uploadView.id = 'upload-view';
    uploadView.style.cssText = `
        display: none;
        width: 100%;
        max-width: ${isMobile() ? '100%' : '600px'};
        padding: ${isMobile() ? '10px' : '20px'};
    `;

    const uploadArea = document.createElement('div');
    uploadArea.style.cssText = `
        width: 100%;
        height: ${isMobile() ? '150px' : '200px'};
        border: 2px dashed #fff;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        padding: 15px;
        text-align: center;
    `;

    uploadArea.innerHTML = `
        <div style="font-size: ${isMobile() ? '14px' : '16px'}">📤 Drop image here or tap to upload</div>
        <div style="margin-top: 10px; font-size: ${iMobile() ? '12px' : '14px'}">Supported: JPG, PNG, GIF</div>
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.onchange = handleFileSelect;

    // Setup upload handlers
    uploadArea.onclick = () => fileInput.click();
    uploadArea.ondragover = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007bff';
    };
    uploadArea.ondragleave = () => uploadArea.style.borderColor = '#fff';
    uploadArea.ondrop = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#fff';
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) {
            processUploadedFile(file);
        }
    };

    uploadView.appendChild(uploadArea);
    uploadView.appendChild(fileInput);

    // Responsive button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        margin-top: ${isMobile() ? '10px' : '20px'};
        display: flex;
        gap: ${isMobile() ? '5px' : '10px'};
        width: 100%;
        max-width: 600px;
        justify-content: center;
    `;

    const createButton = (id, text, onClick, color = '#007bff') => {
        const button = document.createElement('button');
        if (id) button.id = id;
        button.textContent = text;
        button.onclick = onClick;
        button.style.cssText = `
            padding: ${isMobile() ? '8px 15px' : '10px 20px'};
            background: ${color};
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: ${isMobile() ? '14px' : '16px'};
            flex: 1;
            max-width: 200px;
        `;
        return button;
    };

    const captureButton = createButton('capture-button', '📸 Capture', processImage);
    const closeButton = createButton(null, '❌ Close', closeScannerUI, '#dc3545');
    captureButton.disabled = true;

    buttonContainer.appendChild(captureButton);
    buttonContainer.appendChild(closeButton);

    // Assemble all elements
    cameraView.appendChild(video);
    scannerContainer.appendChild(tabContainer);
    scannerContainer.appendChild(cameraView);
    scannerContainer.appendChild(uploadView);
    scannerContainer.appendChild(buttonContainer);
    document.body.appendChild(scannerContainer);
}

// Handle orientation changes on mobile devices
function handleOrientationChange() {
    const video = document.getElementById('scanner-video');
    if (video) {
        setTimeout(() => {
            const isPortrait = window.innerHeight > window.innerWidth;
            video.style.maxHeight = isPortrait ? '80vh' : '60vh';
        }, 100);
    }
}

// Rest of the functions remain the same but with added error handling
async function processImage() {
    if (!imageCapture || scanning) return;

    scanning = true;
    showProcessingUI();
    const captureButton = document.getElementById('capture-button');
    captureButton.disabled = true;

    try {
        const bitmap = await imageCapture.grabFrame();
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        const result = await Tesseract.recognize(
            imageData,
            'eng',
            { logger: m => console.log(m) }
        );

        const { amount, currency } = extractCurrencyInfo(result.data.text);
        
        if (amount) {
            document.getElementById('amount').value = amount;
            if (currency) {
                document.getElementById('fromCurrency').value = currency;
            }
            closeScannerUI();
        } else {
            alert('No valid amount detected. Please try again.');
        }
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    } finally {
        scanning = false;
        hideProcessingUI();
        captureButton.disabled = false;
    }
}

// Clean up event listeners on close
function closeScannerUI() {
    const container = document.getElementById('scanner-container');
    if (container) {
        closeCameraStream();
        if (isMobile()) {
            window.removeEventListener('orientationchange', handleOrientationChange);
        }
        container.style.display = 'none';
    }
    scanning = false;
}