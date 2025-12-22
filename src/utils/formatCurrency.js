export function formatCurrency(amount, currency = 'USDT') {
  // Handle non-ISO 4217 currency codes
  const customCurrencies = ['NOVA', 'USDT'];
  
  // Check if currency is a custom currency
  if (customCurrencies.includes(currency?.toUpperCase())) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + currency.toUpperCase();
  }
  
  // Handle valid ISO 4217 currencies
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback if currency is invalid
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + currency;
  }
}

