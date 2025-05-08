const convertButton = document.getElementById('convertButton');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const amountInput = document.getElementById('amount');
const resultDiv = document.getElementById('result');

convertButton.addEventListener('click', async () => {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        resultDiv.textContent = "Please enter a valid amount.";
        return;
    }

    // AI Analysis Functionality
    async function analyzeTrends(fromCurrency) {
        const simulatedData = {
            USD: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            EUR: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            GBP: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            JPY: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            CNY: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            GHS: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            NGN: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            ZAR: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            INR: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            BRL: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            RUB: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            MXN: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            KRW: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            SGD: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            NZD: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            TRY: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            HKD: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            SEK: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            NOK: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            DKK: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            PLN: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            THB: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            IDR: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            PHP: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            MYR: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            PKR: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            ILS: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            AED: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            SAR: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            QAR: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            KWD: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            DOGE: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            USDT: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            TRX: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            BSV: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            ETC: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            QTUM: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' },
            VET: { trend: 'Bullish', prediction: 'Expected to rise in the next week.' },
            ZIL: { trend: 'Bearish', prediction: 'Expected to decline in the next week.' },
            WAVES: { trend: 'Stable', prediction: 'Expected to remain stable in the next week.' }
        };

        const analysis = simulatedData[fromCurrency] || { trend: 'Unknown', prediction: 'No data available.' };
        document.getElementById('trendResult').textContent = `Trend: ${analysis.trend}. ${analysis.prediction}`;
    }

    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const data = await response.json();
        const rate = data.rates[to];
        if (rate) {
            const convertedAmount = (amount * rate).toFixed(2);
            resultDiv.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
            await analyzeTrends(to); // Call AI analysis after conversion
        } else {
            resultDiv.textContent = "Currency conversion not available.";
        }
    } catch (error) {
        resultDiv.textContent = "Error fetching exchange rates.";
    }
});

function logout() {
    localStorage.removeItem('isLoggedIn'); // Clear the login state
    window.location.href = 'auth.html'; // Redirect to the login page
}