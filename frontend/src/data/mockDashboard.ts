// [AI-Agent: Skills] Dashboard mock verisi — backend hazır olana kadar görsel demo için
// Bu dosya ileride kaldırılacak ve gerçek API verisi kullanılacak

export const MOCK_STATS = {
  totalSales: 147,
  totalRevenue: 8_245.50,
  totalProducts: 12,
  totalIngredients: 18,
  criticalStockCount: 3,
  warningStockCount: 5,
};

export const MOCK_SALES_TREND = [
  { date: '01 May', amount: 1120 },
  { date: '02 May', amount: 980 },
  { date: '03 May', amount: 1340 },
  { date: '04 May', amount: 1560 },
  { date: '05 May', amount: 1210 },
  { date: '06 May', amount: 1890 },
  { date: '07 May', amount: 2145 },
];

export const MOCK_CRITICAL_STOCKS = [
  { id: 1, name: 'Süt', current: 2, min: 10, unit: 'lt', status: 'red' as const },
  { id: 2, name: 'Un', current: 3, min: 15, unit: 'kg', status: 'red' as const },
  { id: 3, name: 'Tereyağı', current: 1.5, min: 5, unit: 'kg', status: 'red' as const },
  { id: 4, name: 'Şeker', current: 8, min: 10, unit: 'kg', status: 'yellow' as const },
  { id: 5, name: 'Yumurta', current: 20, min: 30, unit: 'adet', status: 'yellow' as const },
  { id: 6, name: 'Kakao', current: 2, min: 3, unit: 'kg', status: 'yellow' as const },
  { id: 7, name: 'Krema', current: 4, min: 6, unit: 'lt', status: 'yellow' as const },
  { id: 8, name: 'Vanilya', current: 0.3, min: 0.5, unit: 'lt', status: 'yellow' as const },
];

export const MOCK_PROFIT_LEAK = [
  { name: 'Süt', theoretical: 8, actual: 11, leak_amount: 45 },
  { name: 'Un', theoretical: 12, actual: 15, leak_amount: 22.5 },
  { name: 'Tereyağı', theoretical: 3, actual: 4.5, leak_amount: 67.5 },
  { name: 'Şeker', theoretical: 5, actual: 5.5, leak_amount: 7.5 },
  { name: 'Kakao', theoretical: 1, actual: 1.8, leak_amount: 56 },
];

export const MOCK_STOCK_DISTRIBUTION = [
  { name: 'Kritik', value: 3, status: 'red' as const },
  { name: 'Dikkat', value: 5, status: 'yellow' as const },
  { name: 'Normal', value: 10, status: 'green' as const },
];

export const MOCK_PURCHASE_SUGGESTIONS = [
  { ingredient: 'Süt', current: 2, needed: 15, order: 13, unit: 'lt', estimatedCost: 195 },
  { ingredient: 'Un', current: 3, needed: 20, order: 17, unit: 'kg', estimatedCost: 85 },
  { ingredient: 'Tereyağı', current: 1.5, needed: 8, order: 6.5, unit: 'kg', estimatedCost: 455 },
  { ingredient: 'Şeker', current: 8, needed: 15, order: 7, unit: 'kg', estimatedCost: 84 },
  { ingredient: 'Yumurta', current: 20, needed: 50, order: 30, unit: 'adet', estimatedCost: 120 },
];
