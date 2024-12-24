import React from 'react';
import { CategoryRecommendation } from '@/types/sales';
import { ExportButton } from './ExportButton';

interface RecommendationsTableProps {
  recommendations: CategoryRecommendation[];
}

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({ recommendations }) => {
  if (!recommendations.length) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Stock Level Recommendations</h3>
        <ExportButton 
          data={recommendations} 
          label="Export Stock Level Recommendation Data"
          filename="stock-recommendations"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recommended Days</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg. Daily Sales</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recommended Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recommendations.map((rec, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{rec.category}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{rec.recommendedDays}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {rec.averageDailySales.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{rec.recommendedStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};