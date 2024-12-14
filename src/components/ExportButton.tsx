import React from "react";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IntegratedStockData } from "@/types/stock";
import { exportData } from "@/utils/exporters";
import type { ExportFormat } from "@/utils/exporters/types";

interface ExportButtonProps {
  data: IntegratedStockData[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const handleExport = (format: ExportFormat) => {
    exportData(data, format, {
      filename: "zfs-stock-data",
      timestamp: true,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
        <Download className="w-4 h-4" />
        Export Data
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("tsv")}>
          Export as TSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
