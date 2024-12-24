import { ZFSSaleEntry } from "@/types/sales";

export function processZFSSales(data: any[]): ZFSSaleEntry[] {
  return data.map(item => ({
    orderId: item.orderId,
    articleId: item.articleId,
    ean: item.ean,
    quantity: parseInt(item.quantity) || 0,
    orderTime: item.orderTime,
    category: item.category
  }));
}