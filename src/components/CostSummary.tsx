import { CostSummary as CostSummaryType, formatCurrency } from '../lib/calculations';

interface CostSummaryProps {
  summary: CostSummaryType;
}

export default function CostSummary({ summary }: CostSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Cost Summary</h3>
        <p className="text-sm text-gray-500 mt-1">Complete breakdown with margins and tax</p>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Component Materials</span>
            <span className="text-sm font-semibold text-gray-900 font-mono">
              {formatCurrency(summary.componentTotal)}
            </span>
          </div>

          <div className="space-y-2 py-2 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Costs</div>
            <div className="flex justify-between pl-4">
              <span className="text-sm text-gray-600">Labour</span>
              <span className="text-sm text-gray-900 font-mono">{formatCurrency(summary.labour)}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-sm text-gray-600">Polish</span>
              <span className="text-sm text-gray-900 font-mono">{formatCurrency(summary.polish)}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-sm text-gray-600">Hardware</span>
              <span className="text-sm text-gray-900 font-mono">{formatCurrency(summary.hardware)}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-sm text-gray-600">CNC</span>
              <span className="text-sm text-gray-900 font-mono">{formatCurrency(summary.cnc)}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-sm text-gray-600">Foam</span>
              <span className="text-sm text-gray-900 font-mono">{formatCurrency(summary.foam)}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-sm text-gray-600">Iron</span>
              <span className="text-sm text-gray-900 font-mono">{formatCurrency(summary.iron)}</span>
            </div>
            <div className="flex justify-between pl-4 pt-2 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">Extras Subtotal</span>
              <span className="text-sm font-semibold text-gray-900 font-mono">
                {formatCurrency(summary.extrasTotal)}
              </span>
            </div>
          </div>

          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
            <span className="text-sm font-semibold text-gray-900">Base Subtotal</span>
            <span className="text-sm font-bold text-gray-900 font-mono">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Manufacturing Add-on (MA)</span>
            <span className="text-sm font-semibold text-stone-700 font-mono">
              +{formatCurrency(summary.ma)}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Profit (PRO)</span>
            <span className="text-sm font-semibold text-stone-700 font-mono">
              +{formatCurrency(summary.profit)}
            </span>
          </div>

          <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
            <span className="text-sm font-semibold text-gray-900">Subtotal with Margins</span>
            <span className="text-sm font-bold text-gray-900 font-mono">
              {formatCurrency(summary.subtotalWithMargins)}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-sm font-medium text-gray-700">GST</span>
            <span className="text-sm font-semibold text-stone-700 font-mono">
              +{formatCurrency(summary.gst)}
            </span>
          </div>

          <div className="flex justify-between py-4 bg-stone-200 px-4 rounded-lg border-2 border-stone-300 mt-4">
            <span className="text-lg font-bold text-gray-900">Grand Total</span>
            <span className="text-xl font-bold text-stone-900 font-mono">
              {formatCurrency(summary.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
