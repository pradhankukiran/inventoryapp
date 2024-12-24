export interface ZFSSaleEntry {
  orderId: string;
  articleId: string;
  ean: string;
  quantity: number;
  orderTime: string;
  category: string;
}

export interface CategoryRecommendation {
  category: string;
  recommendedDays: number;
  averageDailySales: number;
  recommendedStock: number;
}