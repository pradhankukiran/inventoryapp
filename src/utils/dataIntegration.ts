import { IntegratedStockData } from '@/types/stock';

export const integrateStockData = (
  internal: any[],
  fba: any[],
  zfs: any[],
  fbaShipments: any[],
  skuEanMapper: any[],
  zfsPendingShipments: Map<string, number>
): IntegratedStockData[] => {
  const skuToEanMap = new Map(skuEanMapper.map((item) => [item.SKU, item.EAN]));
  const eanToSkuMap = new Map(skuEanMapper.map((item) => [item.EAN, item.SKU]));
  const integratedMap = new Map<string, IntegratedStockData>();

  internal.forEach((item) => {
    const sku = item.articleNumber;
    const ean = skuToEanMap.get(sku) || "";

    integratedMap.set(sku, {
      SKU: sku,
      EAN: ean,
      "Product Name": item.articleName,
      "Internal Stock Quantity": parseInt(item.availableStock) || 0,
      "FBA Quantity": 0,
      "ZFS Quantity": 0,
      "ZFS Pending Shipment": 0,
      "FBA Pending Shipment": 0,
    });
  });

  fba.forEach((item) => {
    const sku = item["seller-sku"];
    if (integratedMap.has(sku)) {
      const record = integratedMap.get(sku)!;
      record["FBA Quantity"] = parseInt(item["Quantity Available"]) || 0;
      integratedMap.set(sku, record);
    }
  });

  zfs.forEach((item) => {
    const ean = item.ean;
    const sku = eanToSkuMap.get(ean);
    if (sku && integratedMap.has(sku)) {
      const record = integratedMap.get(sku)!;
      record["ZFS Quantity"] = parseInt(item.sellable_zfs_stock) || 0;
      record["ZFS Pending Shipment"] = zfsPendingShipments.get(ean) || 0;
      integratedMap.set(sku, record);
    }
  });

  const fbaShipmentMap = new Map<string, number>();
  fbaShipments.forEach((shipment) => {
    const sku = shipment["Händler-SKU"];
    const quantity = parseInt(shipment["Versendete Einheiten"]) || 0;
    fbaShipmentMap.set(sku, (fbaShipmentMap.get(sku) || 0) + quantity);
  });

  fbaShipmentMap.forEach((quantity, sku) => {
    if (integratedMap.has(sku)) {
      const record = integratedMap.get(sku)!;
      record["FBA Pending Shipment"] = quantity;
      integratedMap.set(sku, record);
    }
  });

  return Array.from(integratedMap.values()).sort((a, b) =>
    a.SKU.localeCompare(b.SKU)
  );
};