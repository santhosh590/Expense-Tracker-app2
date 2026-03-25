export const formatCurrency = (amount = 0) => {
  const num = Number(amount || 0);
  let currency = "INR";
  
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.baseCurrency) currency = user.baseCurrency;
    }
  } catch (e) {}

  let locale = "en-IN";
  if (currency === "USD") locale = "en-US";
  if (currency === "EUR") locale = "de-DE";
  if (currency === "GBP") locale = "en-GB";

  // Mock static rates relative to INR (for portfolio demo purposes)
  const rates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0094
  };

  const rate = rates[currency] || 1;
  const convertedAmount = num * rate;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(convertedAmount);
};
