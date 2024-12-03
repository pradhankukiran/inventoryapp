import { IntegratedStockData } from '@/types/stock';
import { 
  ProcessedInternalStock,
  ProcessedFBAStock,
  ProcessedZFSStock,
  SKUEANMapping
} from '@/types/processors';

export function integrateStockData(
  internalStock: ProcessedInternalStock[],
  fbaStock: ProcessedFBAStock[],
  zfsStock: ProcessedZFSStock[],
  skuEanMapping: SKUEANMapping[],
  zfsPendingShipments: Map<string, number>,
  fbaShippedQuantities: Map<string, number>
): IntegratedStockData[] {
  const skuToEanMap = new Map(skuEanMapping.map(item => [item.SKU, item.EAN]));
  const eanToSkuMap = new Map(skuEanMapping.map(item => [item.EAN, item.SKU]));
  const integratedMap = new Map<string, IntegratedStockData>();

  // Process internal stock
  internalStock.forEach(item => {
    const ean = skuToEanMap.get(item.SKU) || "";
    integratedMap.set(item.SKU, {
      SKU: item.SKU,
      EAN: ean,
      "Product Name": item["Product Name"],
      "Internal Stock Quantity": item["Internal Stock Quantity"],
      "FBA Quantity": 0,
      "FBA Pending Shipment": 0,
      "ZFS Quantity": 0,
      "ZFS Pending Shipment": 0
    });
  });

  // Process FBA stock
  fbaStock.forEach(item => {
    if (integratedMap.has(item.SKU)) {
      const record = integratedMap.get(item.SKU)!;
      record["FBA Quantity"] = item["FBA Quantity"];
      record["FBA Pending Shipment"] = fbaShippedQuantities.get(item.SKU) || 0;
      integratedMap.set(item.SKU, record);
    }
  });

  // Process ZFS stock
  zfsStock.forEach(item => {
    const sku = eanToSkuMap.get(item.EAN);
    if (sku && integratedMap.has(sku)) {
      const record = integratedMap.get(sku)!;
      record["ZFS Quantity"] = item["ZFS Quantity"];
      record["ZFS Pending Shipment"] = zfsPendingShipments.get(item.EAN) || 0;
      if (!record["Product Name"]) {
        record["Product Name"] = item["Product Name"];
      }
      integratedMap.set(sku, record);
    }
  });

  return Array.from(integratedMap.values()).sort((a, b) => 
    a.SKU.localeCompare(b.SKU)
  );
}