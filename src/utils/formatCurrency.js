export function formatCurrency(amount, currency = 'USDT') {
  if (amount == null || isNaN(amount)) return '0.00';

  // 🔽 Làm tròn xuống 2 chữ số
  const flooredAmount = Math.floor(Number(amount) * 100) / 100;

  const customCurrencies = ['NOVA', 'USDT'];

  if (customCurrencies.includes(currency?.toUpperCase())) {
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(flooredAmount) +
      ' ' +
      currency.toUpperCase()
    );
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(flooredAmount);
  } catch (error) {
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(flooredAmount) +
      ' ' +
      currency
    );
  }
}


