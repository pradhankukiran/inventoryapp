export interface IntegratedStockData {
  SKU: string;
  EAN: string;
  "Product Name": string;
  "Internal Stock Quantity": number;
  "ZFS Quantity": number;
  "ZFS Pending Shipment": number;
}

export interface ParsedData {
  internal: any[];
  zfs: any[];
  zfsShipments: any[];
  zfsShipmentsReceived: any[];
  skuEanMapper: any[];
  integrated: IntegratedStockData[];
}

export interface FileState {
  internal: File | null;
  zfs: File | null;
  zfsShipments: File[];
  zfsShipmentsReceived: File[];
  skuEanMapper: File | null;
}
