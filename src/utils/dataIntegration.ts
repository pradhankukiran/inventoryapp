import { IntegratedStockData } from '@/types/stock';
import { processInternalStock } from './processors/internalStockProcessor';
import { processFBAStock } from './processors/fbaStockProcessor';
import { processZFSStock } from './processors/zfsStockProcessor';
import { processFBAShipments, processZFSShipments, processZFSReceivedShipments } from './processors/shipmentProcessors';
import { processSKUEANMapping } from './processors/skuEanProcessor';
import { calculateZFSPendingShipments } from './calculators/pendingShipments';
import { integrateStockData } from './mergers/dataIntegrator';

export function processAndIntegrateData(
  internal: any[],
  fba: any[],
  zfs: any[],
  fbaShipments: any[],
  zfsShipments: any[],
  zfsShipmentsReceived: any[],
  skuEanMapper: any[]
): IntegratedStockData[] {
  // Process individual data sources
  const processedInternal = processInternalStock(internal);
  const processedFBA = processFBAStock(fba);
  const processedZFS = processZFSStock(zfs);
  const processedFBAShipments = processFBAShipments(fbaShipments);
  const processedZFSShipments = processZFSShipments(zfsShipments);
  const processedZFSReceived = processZFSReceivedShipments(zfsShipmentsReceived);
  const processedMapping = processSKUEANMapping(skuEanMapper);

  // Calculate pending shipments
  const zfsPendingShipments = calculateZFSPendingShipments(
    processedZFSShipments,
    processedZFSReceived
  );

  // Aggregate FBA shipments by SKU
  const fbaShippedQuantities = new Map<string, number>();
  processedFBAShipments.forEach(shipment => {
    const current = fbaShippedQuantities.get(shipment.SKU) || 0;
    fbaShippedQuantities.set(shipment.SKU, current + shipment["FBA Shipped Quantity"]);
  });

  // Integrate all data
  return integrateStockData(
    processedInternal,
    processedFBA,
    processedZFS,
    processedMapping,
    zfsPendingShipments,
    fbaShippedQuantities
  );
}