function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 3;

  const amountInput = document.getElementById('amount');
  const fromCurrencySelect = document.getElementById('fromCurrency');
  const toCurrencySelect = document.getElementById('toCurrency');
  const convertButton = document.getElementById('convertButton');
  const originalPlaceholder = amountInput.placeholder;
  let isListening = false;
  let timeoutId = null;

  // Enhanced currency patterns with more variations
  const currencyMap = {
      // Major currencies with common variations
      'usd': 'USD', 'dollar': 'USD', 'dollars': 'USD', 'us dollars': 'USD', 'american': 'USD', 'us': 'USD',
      'eur': 'EUR', 'euro': 'EUR', 'euros': 'EUR', 'european': 'EUR',
      'gbp': 'GBP', 'pound': 'GBP', 'pounds': 'GBP', 'sterling': 'GBP', 'british': 'GBP', 'uk': 'GBP',
      'jpy': 'JPY', 'yen': 'JPY', 'japanese': 'JPY', 'japan': 'JPY',
      'cny': 'CNY', 'yuan': 'CNY', 'rmb': 'CNY', 'chinese': 'CNY', 'china': 'CNY',
      'ghs': 'GHS', 'cedi': 'GHS', 'cedis': 'GHS', 'ghana': 'GHS', 'ghanaian': 'GHS',
      'ngn': 'NGN', 'naira': 'NGN', 'nigeria': 'NGN', 'nigerian': 'NGN',
      'zar': 'ZAR', 'rand': 'ZAR', 'south african': 'ZAR', 'african': 'ZAR',
      'inr': 'INR', 'rupee': 'INR', 'rupees': 'INR', 'indian': 'INR', 'india': 'INR',
      'aud': 'AUD', 'australian': 'AUD', 'aussie': 'AUD', 'australia': 'AUD',
      'cad': 'CAD', 'canadian': 'CAD', 'canada': 'CAD'
  };

  // Common phrases that indicate conversion intent
  const conversionTriggers = [
      'how much', 'what is', 'convert', 'change', 'switch', 'transform',
      'equals', 'worth', 'value', 'price', 'cost', 'rate'
  ];

  function updateInputStatus(message, type) {
      amountInput.placeholder = message;
      
      const styles = {
          listening: { color: '#4CAF50', animation: 'pulse 1.5s infinite' },
          error: { color: '#ff4444', animation: 'none' },
          processing: { color: '#2196F3', animation: 'none' },
          success: { color: '#4CAF50', animation: 'none' }
      };

      Object.assign(amountInput.style, {
          borderColor: styles[type]?.color || '',
          boxShadow: `0 0 5px ${styles[type]?.color || 'none'}`,
          animation: styles[type]?.animation || 'none'
      });

      if (timeoutId) clearTimeout(timeoutId);
      
      if (type !== 'listening') {
          timeoutId = setTimeout(() => {
              if (!isListening) {
                  amountInput.style.borderColor = '';
                  amountInput.style.boxShadow = '';
                  amountInput.style.animation = 'none';
                  amountInput.placeholder = originalPlaceholder;
              }
          }, 3000);
      }
  }

  function extractAmount(transcript) {
      // Enhanced number extraction with decimal handling
      const numberWords = {
          'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
          'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
          'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
          'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
          'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
          'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
          'hundred': 100, 'thousand': 1000, 'million': 1000000
      };

      // Try to find decimal numbers first
      const decimalMatch = transcript.match(/\d+\s*point\s*\d+|\d+\s*\.\s*\d+|\d+/);
      if (decimalMatch) {
          return parseFloat(decimalMatch[0].replace(/\s+/g, ''));
      }

      // Parse written numbers
      const words = transcript.toLowerCase().split(' ');
      let amount = 0;
      let tempAmount = 0;

      for (let i = 0; i < words.length; i++) {
          const word = words[i];
          if (numberWords[word] !== undefined) {
              if (numberWords[word] === 100) {
                  tempAmount = tempAmount === 0 ? 100 : tempAmount * 100;
              } else if (numberWords[word] >= 1000) {
                  tempAmount = (tempAmount === 0 ? 1 : tempAmount) * numberWords[word];
                  amount += tempAmount;
                  tempAmount = 0;
              } else {
                  tempAmount += numberWords[word];
              }
          }
      }

      return amount + tempAmount || null;
  }

  function detectCurrencies(transcript) {
      const text = transcript.toLowerCase();
      let fromCurrency = null;
      let toCurrency = null;
      let hasConversionIntent = false;

      // Check for conversion intent
      conversionTriggers.forEach(trigger => {
          if (text.includes(trigger)) {
              hasConversionIntent = true;
          }
      });

      // Scan for currency mentions
      const words = text.split(' ');
      let foundCurrencies = [];

      for (let i = 0; i < words.length; i++) {
          const word = words[i];
          // Check single words and combinations (e.g., "us dollars")
          const possiblePhrases = [
              word,
              i < words.length - 1 ? `${word} ${words[i + 1]}` : '',
              i < words.length - 2 ? `${word} ${words[i + 1]} ${words[i + 2]}` : ''
          ];

          possiblePhrases.forEach(phrase => {
              if (currencyMap[phrase]) {
                  foundCurrencies.push(currencyMap[phrase]);
              }
          });
      }

      // Remove duplicates
      foundCurrencies = [...new Set(foundCurrencies)];

      // Assign currencies based on order and context
      if (foundCurrencies.length >= 2) {
          fromCurrency = foundCurrencies[0];
          toCurrency = foundCurrencies[1];
      } else if (foundCurrencies.length === 1) {
          // If only one currency is mentioned, make it the source currency
          fromCurrency = foundCurrencies[0];
          // Set USD as default target if not specified
          toCurrency = 'USD';
      }

      return { fromCurrency, toCurrency, hasConversionIntent };
  }

  function processVoiceInput(transcript) {
      console.log('Processing transcript:', transcript);
      updateInputStatus('Processing: ' + transcript, 'processing');

      const amount = extractAmount(transcript);
      const { fromCurrency, toCurrency, hasConversionIntent } = detectCurrencies(transcript);

      // Auto-detect conversion intent even without explicit commands
      if (amount) {
          amountInput.value = amount;
          
          if (fromCurrency) {
              fromCurrencySelect.value = fromCurrency;
              
              if (toCurrency) {
                  toCurrencySelect.value = toCurrency;
                  updateInputStatus(
                      `Converting ${amount} ${fromCurrency} to ${toCurrency}`,
                      'success'
                  );
                  
                  // Automatic conversion
                  setTimeout(() => {
                      convertButton.click();
                      stopRecognition();
                  }, 1000);
              } else {
                  // If no target currency specified, use USD as default
                  toCurrencySelect.value = 'USD';
                  updateInputStatus(
                      `Converting ${amount} ${fromCurrency} to USD`,
                      'success'
                  );
                  setTimeout(() => {
                      convertButton.click();
                      stopRecognition();
                  }, 1000);
              }
          } else {
              // If no currency specified, assume USD
              fromCurrencySelect.value = 'USD';
              updateInputStatus(
                  'Amount detected, assuming USD. Say a different currency if needed.',
                  'processing'
              );
          }
      } else {
          updateInputStatus(
              'Please say an amount (e.g., "50 dollars" or "twenty euros")',
              'error'
          );
      }
  }

  recognition.onstart = () => {
      isListening = true;
      updateInputStatus('Listening... Just say an amount and currency', 'listening');
      
      const micButton = document.querySelector('.voice-btn');
      if (micButton) {
          micButton.style.backgroundColor = '#ff4444';
          micButton.innerHTML = '🎤 Listening...';
          micButton.style.animation = 'pulse 1.5s infinite';
      }
  };

  recognition.onend = () => {
      isListening = false;
      const micButton = document.querySelector('.voice-btn');
      if (micButton) {
          micButton.style.backgroundColor = '';
          micButton.innerHTML = '🎤 Voice Input';
          micButton.style.animation = 'none';
      }
  };

  recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
          .map(result => result[0].transcript.toLowerCase())
          .join(' ');

      if (event.results[event.results.length - 1].isFinal) {
          processVoiceInput(transcript);
      } else {
          updateInputStatus('Hearing: ' + transcript, 'processing');
      }
  };

  recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      let errorMessage = 'Error with voice recognition';
      
      switch (event.error) {
          case 'no-speech':
              errorMessage = 'No speech was detected. Please try again.';
              break;
          case 'audio-capture':
              errorMessage = 'No microphone was found. Ensure it is plugged in.';
              break;
          case 'not-allowed':
              errorMessage = 'Microphone permission was denied. Please allow access.';
              break;
          case 'network':
              errorMessage = 'Network error occurred. Please check your connection.';
              break;
      }
      
      updateInputStatus(errorMessage, 'error');
      stopRecognition();
  };

  function stopRecognition() {
      if (isListening) {
          isListening = false;
          recognition.stop();
      }
  }

  try {
      recognition.start();
  } catch (error) {
      console.error('Failed to start voice recognition:', error);
      updateInputStatus('Failed to start voice recognition. Please try again.', 'error');
  }

  // Add click anywhere to stop listening
  document.addEventListener('click', (event) => {
      if (!event.target.classList.contains('voice-btn') && isListening) {
          stopRecognition();
      }
  });
}

// Add necessary CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
  }
  
  .voice-btn {
      transition: all 0.3s ease;
      position: relative;
  }
  
  .voice-btn:hover {
      transform: scale(1.05);
  }
  
  #amount {
      transition: all 0.3s ease;
  }
`;
document.head.appendChild(style);