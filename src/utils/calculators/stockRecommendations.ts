import { ZFSSaleEntry, CategoryRecommendation } from "@/types/sales";
import { CATEGORY_STOCK_DAYS } from "@/constants/stockRecommendations";

export function calculateStockRecommendations(
  salesData: ZFSSaleEntry[]
): CategoryRecommendation[] {
  // Group sales by category
  const salesByCategory = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  salesData.forEach(sale => {
    const category = sale.category || 'default';
    salesByCategory.set(
      category, 
      (salesByCategory.get(category) || 0) + sale.quantity
    );
    categoryCounts.set(
      category, 
      (categoryCounts.get(category) || 0) + 1
    );
  });

  // Calculate recommendations
  return Array.from(salesByCategory.entries()).map(([category, totalSales]) => {
    const recommendedDays = CATEGORY_STOCK_DAYS[category] || CATEGORY_STOCK_DAYS.default;
    const averageDailySales = totalSales / 30; // Assuming 30 days of sales data
    
    return {
      category,
      recommendedDays,
      averageDailySales,
      recommendedStock: Math.ceil(averageDailySales * recommendedDays)
    };
  });
}