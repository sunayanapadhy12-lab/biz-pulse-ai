import type { FC } from 'react';
import type { InventoryItem } from '../types';
import { Badge } from '../components/common/Badge';
import { Package, AlertTriangle, ShoppingCart } from 'lucide-react';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onDraftPurchaseOrder: (item: InventoryItem) => void;
}

export const InventoryPage: FC<InventoryPageProps> = ({
  inventory,
  onDraftPurchaseOrder,
}) => {
  const lowStockCount = inventory.filter((i) => i.status === 'low-stock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-600">
            <Package className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Stock & Inventory Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Raw Materials & Perishables Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock buffers, consumption velocity, and automated reorder points.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{lowStockCount} items below safety reorder threshold</span>
          </div>
        )}
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
          Ingredient & Packaging Stock Levels
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Item / SKU</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Current Stock</th>
                <th className="py-2.5 px-3 text-center">Safety Reorder Level</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Reorder Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => {
                const isLow = item.status === 'low-stock';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.sku}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {item.stock}
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-500">
                      {item.reorderLevel}
                    </td>

                    <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                      ${item.costPrice.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {isLow ? (
                        <Badge variant="warning" size="sm" dot>
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>
                          In Stock
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onDraftPurchaseOrder(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                          isLow
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Draft PO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
