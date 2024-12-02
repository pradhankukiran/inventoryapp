import React, { useState, useEffect } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FileUploadSection } from "./FileUploadSection";
import { StockTable } from "./StockTable";
import { parseCSVFile } from "@/utils/fileParser";
import { calculateZFSPendingShipments } from "@/utils/stockCalculations";
import { integrateStockData } from "@/utils/dataIntegration";
import { ParsedData, FileState } from "@/types/stock";
import { ArrowLeft } from "lucide-react";

const IntegratedStockParser = () => {
  const [files, setFiles] = useState<FileState>({
    internal: null,
    fba: null,
    zfs: null,
    fbaShipments: [],
    zfsShipments: [],
    zfsShipmentsReceived: [],
    skuEanMapper: null,
  });

  const [parsedData, setParsedData] = useState<ParsedData>({
    internal: [],
    fba: [],
    zfs: [],
    fbaShipments: [],
    zfsShipments: [],
    zfsShipmentsReceived: [],
    skuEanMapper: [],
    integrated: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof FileState
  ) => {
    if (!event.target.files?.length) return;

    setLoading(true);
    setErrors([]);
    const uploadedFiles = Array.from(event.target.files);

    try {
      if (
        fileType === "fbaShipments" ||
        fileType === "zfsShipments" ||
        fileType === "zfsShipmentsReceived"
      ) {
        setFiles((prev) => ({
          ...prev,
          [fileType]: [...prev[fileType], ...uploadedFiles],
        }));

        const parsedResults = await Promise.all(
          uploadedFiles.map((file) => parseCSVFile(file))
        );
        const flattenedResults = parsedResults.flat();

        setParsedData((prev) => ({
          ...prev,
          [fileType]: [...prev[fileType], ...flattenedResults],
        }));
      } else {
        setFiles((prev) => ({ ...prev, [fileType]: uploadedFiles[0] }));
        const results = await parseCSVFile(uploadedFiles[0]);
        setParsedData((prev) => ({
          ...prev,
          [fileType]: results,
        }));
      }
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        `Error parsing ${uploadedFiles[0].name}: ${error}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (fileType: keyof FileState, fileName: string) => {
    if (Array.isArray(files[fileType])) {
      const updatedFiles = (files[fileType] as File[]).filter(
        (file) => file.name !== fileName
      );
      setFiles((prev) => ({ ...prev, [fileType]: updatedFiles }));

      // Update parsed data by removing the corresponding entries
      const updatedParsedData = parsedData[fileType].filter((_, index) => {
        const fileIndex = (files[fileType] as File[]).findIndex(
          (file) => file.name === fileName
        );
        return index !== fileIndex;
      });
      setParsedData((prev) => ({ ...prev, [fileType]: updatedParsedData }));
    } else {
      setFiles((prev) => ({ ...prev, [fileType]: null }));
      setParsedData((prev) => ({ ...prev, [fileType]: [] }));
    }
  };

  const handleProcessFiles = () => {
    const allRequiredFilesUploaded =
      files.internal && files.fba && files.zfs && files.skuEanMapper;

    if (!allRequiredFilesUploaded) {
      setErrors((prev) => [...prev, "Please upload all required files first"]);
      return;
    }

    setShowTable(true);
  };

  useEffect(() => {
    if (Object.values(parsedData).some((data) => data.length > 0)) {
      const zfsPendingShipments = calculateZFSPendingShipments(
        parsedData.zfsShipments,
        parsedData.zfsShipmentsReceived
      );

      const integratedData = integrateStockData(
        parsedData.internal,
        parsedData.fba,
        parsedData.zfs,
        parsedData.fbaShipments,
        parsedData.skuEanMapper,
        zfsPendingShipments
      );

      setParsedData((prev) => ({
        ...prev,
        integrated: integratedData,
      }));
    }
  }, [
    parsedData.internal,
    parsedData.fba,
    parsedData.zfs,
    parsedData.fbaShipments,
    parsedData.zfsShipments,
    parsedData.zfsShipmentsReceived,
    parsedData.skuEanMapper,
  ]);

  return (
    <div className="max-w-full p-4">
      <Card>
        {showTable ? (
          <>
            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
              <button
                onClick={() => setShowTable(false)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Files
              </button>
              <CardTitle>Integrated Stock Data</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <StockTable data={parsedData.integrated} />
              )}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Upload Files Here: </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errors.length > 0 &&
                  errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTitle>{error}</AlertTitle>
                    </Alert>
                  ))}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FileUploadSection
                    title="Internal Stock"
                    onChange={(e) => handleFileUpload(e, "internal")}
                    onRemove={(fileName) =>
                      handleRemoveFile("internal", fileName)
                    }
                    files={files.internal ? [files.internal] : []}
                  />
                  <FileUploadSection
                    title="FBA Stock"
                    onChange={(e) => handleFileUpload(e, "fba")}
                    onRemove={(fileName) => handleRemoveFile("fba", fileName)}
                    files={files.fba ? [files.fba] : []}
                  />
                  <FileUploadSection
                    title="ZFS Stock"
                    onChange={(e) => handleFileUpload(e, "zfs")}
                    onRemove={(fileName) => handleRemoveFile("zfs", fileName)}
                    files={files.zfs ? [files.zfs] : []}
                  />
                  <FileUploadSection
                    title="FBA Shipments"
                    onChange={(e) => handleFileUpload(e, "fbaShipments")}
                    onRemove={(fileName) =>
                      handleRemoveFile("fbaShipments", fileName)
                    }
                    files={files.fbaShipments}
                    multiple
                  />
                  <FileUploadSection
                    title="ZFS Shipments"
                    onChange={(e) => handleFileUpload(e, "zfsShipments")}
                    onRemove={(fileName) =>
                      handleRemoveFile("zfsShipments", fileName)
                    }
                    files={files.zfsShipments}
                    multiple
                  />
                  <FileUploadSection
                    title="ZFS Shipments Received"
                    onChange={(e) =>
                      handleFileUpload(e, "zfsShipmentsReceived")
                    }
                    onRemove={(fileName) =>
                      handleRemoveFile("zfsShipmentsReceived", fileName)
                    }
                    files={files.zfsShipmentsReceived}
                    multiple
                  />
                  <FileUploadSection
                    title="SKU-EAN Mapper"
                    onChange={(e) => handleFileUpload(e, "skuEanMapper")}
                    onRemove={(fileName) =>
                      handleRemoveFile("skuEanMapper", fileName)
                    }
                    files={files.skuEanMapper ? [files.skuEanMapper] : []}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <button
                onClick={handleProcessFiles}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Process Files
              </button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default IntegratedStockParser;
