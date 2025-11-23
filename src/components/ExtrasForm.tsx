import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Extras } from '../lib/calculations';
import type { Database } from '../lib/database.types';

type CustomCostRow = Database['public']['Tables']['product_custom_costs']['Row'];

interface CustomCost {
  id?: string;
  label: string;
  amount: number;
  sort_order?: number;
}

interface ExtrasFormProps {
  productId?: string;
  extras: Extras;
  onChange: (extras: Extras) => void;
}

export default function ExtrasForm({ productId, extras, onChange }: ExtrasFormProps) {
  const [customCosts, setCustomCosts] = useState<CustomCost[]>([]);

  useEffect(() => {
    if (productId) {
      loadCustomCosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadCustomCosts() {
    if (!productId) return;

    // @ts-ignore - Supabase types need regeneration after migration
    const { data } = await supabase
      .from('product_custom_costs')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');

    if (data) {
      // @ts-ignore
      setCustomCosts((data as CustomCostRow[]).map((row) => ({
        id: row.id,
        label: row.label,
        amount: row.amount,
        sort_order: row.sort_order
      })));
    }
  }

  function updateField(field: keyof Extras, value: number) {
    onChange({ ...extras, [field]: value });
  }

  async function addCustomCost() {
    const newCost: CustomCost = {
      label: '',
      amount: 0,
      sort_order: customCosts.length
    };

    if (productId) {
      // Save to database
      // @ts-ignore - Supabase types need regeneration after migration
      const { data, error } = await supabase
        .from('product_custom_costs')
        // @ts-ignore
        .insert({
          product_id: productId,
          label: newCost.label,
          amount: newCost.amount,
          sort_order: newCost.sort_order
        })
        .select()
        .single();

      if (data && !error) {
        // @ts-ignore
        const row: CustomCostRow = data;
        setCustomCosts([...customCosts, {
          id: row.id,
          label: row.label,
          amount: row.amount,
          sort_order: row.sort_order
        }]);
      }
    } else {
      // Temporary ID for unsaved product
      setCustomCosts([...customCosts, { ...newCost, id: Date.now().toString() }]);
    }
  }

  async function updateCustomCost(id: string | undefined, field: 'label' | 'amount', value: string | number) {
    if (!id) return;
    
    const updated = customCosts.map(cost =>
      cost.id === id ? { ...cost, [field]: value } : cost
    );
    setCustomCosts(updated);

    // Update in database if product exists
    if (productId) {
      const cost = updated.find(c => c.id === id);
      if (cost && cost.id) {
        const updateData = field === 'label' 
          ? { label: value as string }
          : { amount: value as number };
        
        // @ts-ignore - Supabase types need regeneration after migration
        await supabase
          .from('product_custom_costs')
          // @ts-ignore
          .update(updateData)
          .eq('id', cost.id);
      }
    }
  }

  async function deleteCustomCost(id: string | undefined) {
    if (!id) return;
    
    setCustomCosts(customCosts.filter(cost => cost.id !== id));

    // Delete from database if product exists
    if (productId && id) {
      await supabase
        .from('product_custom_costs')
        .delete()
        .eq('id', id);
    }
  }

  const ironTotal = extras.iron_weight * extras.iron_rate;
  const customCostsTotal = customCosts.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Additional Costs & Margins</h3>
        <p className="text-sm text-gray-500 mt-1">Enter labour, materials, and overhead costs</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Labour Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={extras.labour}
              onChange={(e) => updateField('labour', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Polish Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={extras.polish}
              onChange={(e) => updateField('polish', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hardware Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={extras.hardware}
              onChange={(e) => updateField('hardware', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CNC Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={extras.cnc}
              onChange={(e) => updateField('cnc', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foam Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={extras.foam}
              onChange={(e) => updateField('foam', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Iron Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              value={extras.iron_weight}
              onChange={(e) => updateField('iron_weight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Iron Rate (₹/kg)</label>
            <input
              type="number"
              step="0.01"
              value={extras.iron_rate}
              onChange={(e) => updateField('iron_rate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Iron Total (₹)</label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono">
              ₹{ironTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Custom Cost Items */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900">Custom Costs</h4>
            <button
              onClick={addCustomCost}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Cost Item
            </button>
          </div>

          {customCosts.length > 0 ? (
            <div className="space-y-3">
              {customCosts.map((cost) => (
                <div key={cost.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Cost description (e.g., Delivery, Packaging)"
                      value={cost.label}
                      onChange={(e) => updateCustomCost(cost.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    />
                  </div>
                  <div className="w-40">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={cost.amount || ''}
                      onChange={(e) => updateCustomCost(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    />
                  </div>
                  <button
                    onClick={() => deleteCustomCost(cost.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove cost item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <div className="text-sm font-semibold text-gray-700">
                  Custom Costs Total: <span className="font-mono">₹{customCostsTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No custom costs added. Click "Add Cost Item" to add additional expenses.</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Margins & Tax</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturing Add-on (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={extras.ma_percentage}
                onChange={(e) => updateField('ma_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profit Margin (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={extras.profit_percentage}
                onChange={(e) => updateField('profit_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={extras.gst_percentage}
                onChange={(e) => updateField('gst_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
