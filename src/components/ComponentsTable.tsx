import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Component, calculateCFT, calculateFeet, calculateComponentTotal, formatNumber, calculateActualDimensions } from '../lib/calculations';

type Material = Database['public']['Tables']['materials']['Row'];
type PriceTier = Database['public']['Tables']['material_price_tiers']['Row'];

interface ComponentsTableProps {
  components: Component[];
  onChange: (components: Component[]) => void;
}

export default function ComponentsTable({ components, onChange }: ComponentsTableProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);

  useEffect(() => {
    loadMaterials();
    loadPriceTiers();
  }, []);

  async function loadMaterials() {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setMaterials(data);
    }
  }

  async function loadPriceTiers() {
    const { data } = await supabase
      .from('material_price_tiers')
      .select('*');

    if (data) {
      setPriceTiers(data);
    }
  }

  // Helper function to find the appropriate rate based on ACTUAL size (after wastage)
  function findRateForComponent(materialId: string, component: Component): number {
    // If any dimension missing, return default material rate
    if (!component.length || !component.width || !component.height) {
      const material = materials.find(m => m.id === materialId);
      return material ? material.rate_per_cft : 0;
    }

    // Calculate ACTUAL dimensions considering wastage and wood availability
    const { actualLength, actualWidth, actualHeight } = calculateActualDimensions(
      component.length,
      component.width,
      component.height,
      component // Pass component for manual overrides
    );

    // Use the longest face dimension (length or width) to pick the size bracket
    // NOTE: price tiers store sizes in FEET, while our dimensions are in INCHES.
    const maxFaceDimensionInches = Math.max(actualLength, actualWidth);
    const maxFaceDimensionFeet = maxFaceDimensionInches / 12;

    // Thickness is the actual height (inches)
    const thicknessInches = actualHeight;

    // Find matching price tier (match size on max face dimension in FEET and thickness in inches)
    // Allow small tolerance on thickness matching (0.5")
    const matchingTier = priceTiers.find(tier =>
      tier.material_id === materialId &&
      maxFaceDimensionFeet >= (tier.min_size ?? 0) &&
      maxFaceDimensionFeet <= (tier.max_size ?? Number.POSITIVE_INFINITY) &&
      Math.abs((thicknessInches ?? 0) - (tier.thickness ?? 0)) < 0.5
    );

    if (matchingTier) return matchingTier.rate_per_cft;

    // No tier found — fall back to material default
    const material = materials.find(m => m.id === materialId);
    return material ? material.rate_per_cft : 0;
  }

  function addRow() {
    const newComponent: Component = {
      description: '',
      length: null,
      width: null,
      height: null,
      pieces: 1,
      cft: null,
      rate: 0,
      material_id: null
    };
    onChange([...components, newComponent]);
  }

  function updateComponent(index: number, field: keyof Component, value: string | number | null) {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };

    // Update rate when material changes
    if (field === 'material_id' && value && typeof value === 'string') {
      updated[index].rate = findRateForComponent(value, updated[index]);
    }

    // Update rate when dimensions change (if material is already selected)
    if ((field === 'length' || field === 'width' || field === 'height') && updated[index].material_id) {
      updated[index].rate = findRateForComponent(updated[index].material_id!, updated[index]);
    }

    onChange(updated);
  }

  function removeComponent(index: number) {
    onChange(components.filter((_, i) => i !== index));
  }

  function getCalculatedCFT(component: Component): number {
    if (component.cft !== null) {
      return component.cft;
    }
    return calculateCFT(component.length, component.width, component.height, component.pieces);
  }

  function getCalculatedFeet(component: Component): number {
    return calculateFeet(component.length, component.width, component.pieces);
  }

  // Helper to show wastage info as tooltip
  function getWastageInfo(component: Component): string {
    if (!component.length || !component.width || !component.height) return '';
    
    const { actualLength, actualWidth, actualHeight } = calculateActualDimensions(
      component.length,
      component.width,
      component.height,
      component
    );

    const hasWastage = 
      Math.abs(actualLength - component.length) > 0.01 ||
      Math.abs(actualWidth - component.width) > 0.01 ||
      Math.abs(actualHeight - component.height) > 0.01;

    if (!hasWastage) return '';

    return `📏 Actual Dimensions Used:
L: ${component.length}" → ${formatNumber(actualLength, 1)}" (rounded to available size)
W: ${component.width}" → ${formatNumber(actualWidth, 1)}" (+20% wastage)
H: ${component.height}" (thickness as-is)`;
  }

  const totalCFT = components.reduce((sum, comp) => sum + getCalculatedCFT(comp), 0);
  const totalAmount = components.reduce((sum, comp) => sum + calculateComponentTotal(comp), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Components</h3>
            <p className="text-sm text-gray-500 mt-1">Add and configure product components</p>
          </div>
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase">Description</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase">L</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase">W</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase">H</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase">Pcs</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase" title="Actual length after wastage">Act L</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase" title="Actual width after wastage">Act W</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase" title="Actual thickness">Act H</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase">Feet</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase">CFT</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase">Material</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 uppercase">Rate</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 uppercase">Total</th>
              <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700 uppercase w-10"></th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={component.description}
                    onChange={(e) => updateComponent(index, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    placeholder="Component name"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.length || ''}
                    onChange={(e) => updateComponent(index, 'length', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    disabled={component.cft !== null}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.width || ''}
                    onChange={(e) => updateComponent(index, 'width', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    disabled={component.cft !== null}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.height || ''}
                    onChange={(e) => updateComponent(index, 'height', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    disabled={component.cft !== null}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    min="1"
                    value={component.pieces}
                    onChange={(e) => updateComponent(index, 'pieces', parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.actualLength || ''}
                    onChange={(e) => updateComponent(index, 'actualLength', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={component.length ? formatNumber(calculateActualDimensions(component.length, component.width, component.height, component).actualLength, 1) : ''}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
                    title="Override calculated actual length"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.actualWidth || ''}
                    onChange={(e) => updateComponent(index, 'actualWidth', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={component.width ? formatNumber(calculateActualDimensions(component.length, component.width, component.height, component).actualWidth, 1) : ''}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
                    title="Override calculated actual width"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.actualHeight || ''}
                    onChange={(e) => updateComponent(index, 'actualHeight', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={component.height ? formatNumber(component.height, 1) : ''}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
                    title="Override calculated actual thickness"
                  />
                </td>
                <td className="py-2 px-3 text-sm text-center text-gray-700 font-mono">
                  {formatNumber(getCalculatedFeet(component), 2)}
                </td>
                <td className="py-2 px-3">
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.0001"
                      value={component.cft !== null ? component.cft : ''}
                      onChange={(e) => updateComponent(index, 'cft', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder={formatNumber(calculateCFT(component.length, component.width, component.height, component.pieces), 4)}
                      className="w-24 px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500 font-mono"
                      title={getWastageInfo(component) || "Leave empty for auto-calculation or enter manual CFT"}
                    />
                    {getWastageInfo(component) && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" title="Wastage applied"></span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3">
                  <select
                    value={component.material_id || ''}
                    onChange={(e) => updateComponent(index, 'material_id', e.target.value || null)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  >
                    <option value="">Select material</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={component.rate}
                    onChange={(e) => updateComponent(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1.5 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500 font-mono"
                  />
                </td>
                <td className="py-2 px-3 text-sm text-right text-gray-900 font-semibold font-mono">
                  ₹{formatNumber(calculateComponentTotal(component), 2)}
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => removeComponent(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {components.length === 0 && (
              <tr>
                <td colSpan={13} className="py-8 text-center text-gray-500">
                  No components added yet. Click "Add Row" to start.
                </td>
              </tr>
            )}
          </tbody>
          {components.length > 0 && (
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={8} className="py-3 px-3 text-right text-sm text-gray-900">
                  TOTALS:
                </td>
                <td className="py-3 px-3 text-sm text-center text-gray-900 font-mono">
                  {formatNumber(totalCFT, 4)}
                </td>
                <td colSpan={2}></td>
                <td className="py-3 px-3 text-sm text-right text-gray-900 font-mono">
                  ₹{formatNumber(totalAmount, 2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
