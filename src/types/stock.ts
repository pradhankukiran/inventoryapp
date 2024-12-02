export interface IntegratedStockData {
  SKU: string;
  EAN: string;
  "Product Name": string;
  "Internal Stock Quantity": number;
  "FBA Quantity": number;
  "FBA Pending Shipment": number;
  "ZFS Quantity": number;
  "ZFS Pending Shipment": number;
}

export interface ParsedData {
  internal: any[];
  fba: any[];
  zfs: any[];
  fbaShipments: any[];
  zfsShipments: any[];
  zfsShipmentsReceived: any[];
  skuEanMapper: any[];
  integrated: IntegratedStockData[];
}

export interface FileState {
  internal: File | null;
  fba: File | null;
  zfs: File | null;
  fbaShipments: File[];
  zfsShipments: File[];
  zfsShipmentsReceived: File[];
  skuEanMapper: File | null;
}