// === Upload Image for OCR ===
function captureCurrency() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) recognizeCurrencyText(file);
    };
    input.click();
}

// === Live Camera View with Capture and Cancel ===
function captureFromCamera() {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const overlay = document.createElement('div');

    const captureBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    const switchCameraBtn = document.createElement('button');

    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex;
        flex-direction: column; justify-content: center;
        align-items: center; z-index: 9999;
    `;

    video.autoplay = true;
    video.style = `
        max-width: 90%; border-radius: 10px;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
    `;
    overlay.appendChild(video);

    // Camera controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        align-items: center;
    `;

    captureBtn.textContent = '📸 Capture';
    captureBtn.style = `
        padding: 12px 24px;
        font-size: 18px; font-weight: bold;
        border: none; border-radius: 10px;
        background-color: #28a745; color: white;
        cursor: pointer; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    `;

    switchCameraBtn.textContent = '🔄 Switch Camera';
    switchCameraBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none; border-radius: 8px;
        background-color: #007bff;
        color: white; cursor: pointer;
    `;

    cancelBtn.textContent = '✖ Cancel';
    cancelBtn.style = `
        padding: 10px 20px;
        font-size: 16px; background-color: #dc3545;
        color: white; border: none; border-radius: 8px;
        cursor: pointer;
    `;

    controlsContainer.appendChild(captureBtn);
    controlsContainer.appendChild(switchCameraBtn);
    controlsContainer.appendChild(cancelBtn);
    overlay.appendChild(controlsContainer);
    document.body.appendChild(overlay);

    let currentFacingMode = 'environment'; // Start with back camera
    let stream = null;

    async function startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: currentFacingMode
                }
            });
            video.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
            document.body.removeChild(overlay);
        }
    }

    // Start with back camera
    startCamera();

    switchCameraBtn.onclick = () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        startCamera();
    };

    captureBtn.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        document.body.removeChild(overlay);

        canvas.toBlob(blob => recognizeCurrencyText(blob));
    };

    cancelBtn.onclick = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        document.body.removeChild(overlay);
    };
}

// === OCR Processing with Enhanced Currency Extraction ===
function recognizeCurrencyText(imageBlob) {
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = '<span class="loading-spinner"></span> Processing...';

    Tesseract.recognize(imageBlob, 'eng')
        .then(({ data: { text } }) => {
            console.log("Recognized text:", text);
            const result = extractCurrencyAmount(text);

            if (result) {
                document.getElementById('amount').value = result.amount;
                resultElement.innerHTML = `Recognized: ${result.currency || ''} ${result.amount}`;

                // Set the source currency if detected
                if (result.currency) {
                    const fromSelect = document.getElementById('fromCurrency');
                    for (let option of fromSelect.options) {
                        if (option.value.toUpperCase() === result.currency.toUpperCase()) {
                            fromSelect.value = option.value;
                            break;
                        }
                    }
                }
                
                // Set the target currency if detected
                if (result.targetCurrency) {
                    const toSelect = document.getElementById('toCurrency');
                    for (let option of toSelect.options) {
                        if (option.value.toUpperCase() === result.targetCurrency.toUpperCase()) {
                            toSelect.value = option.value;
                            break;
                        }
                    }
                    
                    // Trigger the conversion automatically
                    document.getElementById('convertButton').click();
                }
            } else {
                resultElement.innerHTML = 'No recognizable currency amount found.';
            }
        })
        .catch(error => {
            resultElement.innerHTML = 'Error recognizing text.';
            console.error(error);
        });
}

// === Enhanced Function to Extract Amount and Currency from Text ===
function extractCurrencyAmount(text) {
    // Basic pattern to match simple currency amounts
    const basicRegex = /(GHS|USD|EUR|GBP|NGN|CAD|AUD|CHF|JPY|CNY|ZAR|INR|₵|\$|€|£)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i;
    
    // Advanced pattern to match phrases like "convert 100$ to cedis"
    const advancedRegex = /(?:convert\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?:\s*)([$€£₵]|USD|EUR|GBP|GHS|NGN|CAD|AUD|CHF|JPY|CNY|ZAR|INR|cedis|dollars|euros|pounds)/i;
    
    // Pattern to capture "to [currency]" phrases
    const toRegex = /to\s+([a-zA-Z]+)/i;

    // First try the advanced pattern for complex phrases
    let match = text.match(advancedRegex);
    let toMatch = text.match(toRegex);
    
    // If advanced pattern fails, try the basic pattern
    if (!match) {
        match = text.match(basicRegex);
    }

    if (match) {
        // Handle amount
        let amount = match[1] ? match[1].replace(/,/g, '') : match[2].replace(/,/g, '');
        
        // Handle currency
        let currencySymbol = match[1] && match[1].length === 1 ? match[1] : 
                            (match[2] && match[2].length === 1 ? match[2] : null);
        
        let currencyCode = currencySymbol ? null : 
                          (match[1] && match[1].length > 1 ? match[1] : 
                          (match[2] && match[2].length > 1 ? match[2] : null));
        
        // Map common symbols to currency codes
        const symbolToCurrency = {
            '$': 'USD',
            '₵': 'GHS',
            '€': 'EUR',
            '£': 'GBP'
        };
        
        // Determine the currency
        let currency = null;
        if (currencySymbol && symbolToCurrency[currencySymbol]) {
            currency = symbolToCurrency[currencySymbol];
        } else if (currencyCode) {
            // Handle currency names
            const currencyNames = {
                'CEDIS': 'GHS',
                'DOLLARS': 'USD',
                'EUROS': 'EUR',
                'POUNDS': 'GBP',
                'NAIRA': 'NGN'
            };
            
            currencyCode = currencyCode.toUpperCase();
            currency = currencyNames[currencyCode] || currencyCode;
        }
        
        // Extract target currency from "to [currency]" phrase
        let targetCurrency = null;
        if (toMatch) {
            const targetText = toMatch[1].toUpperCase();
            const targetMap = {
                'CEDIS': 'GHS',
                'DOLLARS': 'USD',
                'EUROS': 'EUR',
                'POUNDS': 'GBP',
                'NAIRA': 'NGN'
            };
            targetCurrency = targetMap[targetText] || targetText;
        }
        
        return { amount, currency, targetCurrency };
    }
    
    return null;
}

// === Unified Capture Option Menu ===
function openCaptureOptions() {
    const menu = document.createElement('div');
    menu.style = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white; border-radius: 10px;
        padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000; display: flex;
        flex-direction: column; gap: 10px; align-items: center;
    `;

    const uploadBtn = document.createElement('button');
    uploadBtn.innerText = '📁 Upload Image';
    uploadBtn.onclick = () => {
        document.body.removeChild(menu);
        captureCurrency();
    };

    const cameraBtn = document.createElement('button');
    cameraBtn.innerText = '📷 Capture From Camera';
    cameraBtn.onclick = () => {
        document.body.removeChild(menu);
        captureFromCamera();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = '✖ Cancel';
    cancelBtn.style = 'background: #ccc;';
    cancelBtn.onclick = () => {
        document.body.removeChild(menu);
    };

    [uploadBtn, cameraBtn, cancelBtn].forEach(btn => {
        btn.style = `
            padding: 10px 20px; border: none;
            border-radius: 5px; font-size: 16px;
            cursor: pointer;
        `;
    });

    menu.appendChild(uploadBtn);
    menu.appendChild(cameraBtn);
    menu.appendChild(cancelBtn);
    document.body.appendChild(menu);
}