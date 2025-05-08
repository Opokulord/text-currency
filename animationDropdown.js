// currency.js

// Currency Mappings: symbols and words
export const currencyMappings = {
    symbols: {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₦': 'NGN',
      '₹': 'INR',
      '₽': 'RUB',
      '₿': 'BTC',
      'Kč': 'CZK',
      'zł': 'PLN',
      '₺': 'TRY'
    },
    words: {
      'dollar': 'USD',
      'dollars': 'USD',
      'usd': 'USD',
      'euro': 'EUR',
      'euros': 'EUR',
      'pound': 'GBP',
      'pounds': 'GBP',
      'gbp': 'GBP',
      'yen': 'JPY',
      'naira': 'NGN',
      'ngn': 'NGN',
      'rupee': 'INR',
      'rupees': 'INR',
      'inr': 'INR',
      'ruble': 'RUB',
      'rubles': 'RUB',
      'bitcoin': 'BTC',
      'btc': 'BTC',
      'czk': 'CZK',
      'koruna': 'CZK',
      'pln': 'PLN',
      'zloty': 'PLN',
      'lira': 'TRY',
      'try': 'TRY'
    }
  };
  
  // Function to detect currency in text using the mappings above
  export function detectCurrency(text) {
    // Check for currency symbols
    for (const [symbol, code] of Object.entries(currencyMappings.symbols)) {
      if (text.includes(symbol)) {
        return code;
      }
    }
  
    // Check for currency words (case-insensitive)
    const lowerText = text.toLowerCase();
    for (const [word, code] of Object.entries(currencyMappings.words)) {
      if (lowerText.includes(word)) {
        return code;
      }
    }
  
    return null;
  }
  