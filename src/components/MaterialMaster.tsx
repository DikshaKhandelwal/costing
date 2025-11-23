import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Plus, Edit2, Trash2, Check, X, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/calculations';
import MaterialPriceTiers from './MaterialPriceTiers';

type Material = Database['public']['Tables']['materials']['Row'];

export default function MaterialMaster() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rate_per_cft: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading materials:', error);
    } else {
      setMaterials(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter a material name');
      return;
    }

    const materialData = {
      name: formData.name,
      rate_per_cft: formData.rate_per_cft ? parseFloat(formData.rate_per_cft) : 0,
      description: formData.description || null,
      is_active: formData.is_active
    };

    if (editingId) {
      // @ts-ignore
      const { error } = await supabase
        .from('materials')
        // @ts-ignore
        .update({ ...materialData, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating material:', error);
      } else {
        setEditingId(null);
        resetForm();
        loadMaterials();
      }
    } else {
      // @ts-ignore
      const { data, error } = await supabase
        .from('materials')
        // @ts-ignore
        .insert([materialData])
        .select();

      if (error) {
        console.error('Error adding material:', error);
      } else {
        setIsAdding(false);
        resetForm();
        await loadMaterials();
        
        // Automatically open price tiers modal for the newly created material
        if (data && data[0]) {
          const askToPriceTiers = confirm(
            `Material "${materialData.name}" created successfully!\n\n` +
            'Would you like to set up size-based pricing tiers now?\n' +
            '(e.g., different rates for 1.5-2", 2.5-3" ranges)'
          );
          
          if (askToPriceTiers) {
            setSelectedMaterial(data[0]);
          }
        }
      }
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      rate_per_cft: '',
      description: '',
      is_active: true
    });
  }

  function handleEdit(material: Material) {
    setEditingId(material.id);
    setFormData({
      name: material.name,
      rate_per_cft: material.rate_per_cft.toString(),
      description: material.description || '',
      is_active: material.is_active
    });
    setIsAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this material?')) return;

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting material:', error);
    } else {
      loadMaterials();
    }
  }

  function handleCancel() {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  }

  return (
    <>
    <div className="bg-white rounded-2xl shadow-lg border-2 border-stone-300">
      <div className="p-8 border-b-2 border-stone-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">Material Master</h2>
            <p className="text-lg text-stone-700 mt-2">Manage material rates and pricing</p>
          </div>
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-all shadow-lg text-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Material
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-stone-100 rounded-xl border-2 border-stone-300 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-semibold text-stone-900 mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  required
                  disabled={!!editingId}
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-stone-900 mb-2">
                  Default Rate per CFT (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rate_per_cft}
                  onChange={(e) => setFormData({ ...formData, rate_per_cft: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="Optional - used as fallback"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Leave empty if using size-based pricing only. Used as fallback rate if no size tier matches.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-stone-900 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-stone-800 rounded focus:ring-2 focus:ring-stone-500"
                />
                <label htmlFor="is_active" className="text-base font-semibold text-stone-900">
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-stone-700 text-white rounded-xl hover:bg-stone-800 transition-all shadow-md text-base font-semibold"
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-stone-200 text-stone-900 rounded-xl hover:bg-stone-300 transition-all shadow-md text-base font-semibold"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
            
            {/* Helper text for size-based pricing */}
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm text-blue-900 mb-2">
                <strong>💡 Size-Based Pricing Workflow:</strong>
              </p>
              <ol className="text-sm text-blue-900 list-decimal list-inside space-y-1">
                <li>Enter material name (required)</li>
                <li>Leave "Default Rate" empty or enter a fallback rate</li>
                <li>Click <strong>Save</strong> → You'll be prompted to add size-based pricing tiers</li>
                <li>Add your size ranges (e.g., 1.5-2", 2.5-3") with specific rates</li>
              </ol>
              <p className="text-xs text-blue-800 mt-2">
                ℹ️ After saving, you can also click the <strong>$ (dollar)</strong> icon in the table to manage pricing tiers.
              </p>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-200">
                <th className="text-left py-4 px-6 text-base font-bold text-stone-900">Material</th>
                <th className="text-left py-4 px-6 text-base font-bold text-stone-900">Rate/CFT</th>
                <th className="text-left py-4 px-6 text-base font-bold text-stone-900">Description</th>
                <th className="text-center py-4 px-6 text-base font-bold text-stone-900">Status</th>
                <th className="text-right py-4 px-6 text-base font-bold text-stone-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-b border-stone-200 hover:bg-stone-100 transition-colors">
                  <td className="py-4 px-6 text-base font-semibold text-stone-900">{material.name}</td>
                  <td className="py-4 px-6 text-base text-stone-800">{formatCurrency(material.rate_per_cft)}</td>
                  <td className="py-4 px-6 text-base text-stone-700">{material.description || '-'}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full ${
                        material.is_active
                          ? 'bg-stone-700 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {material.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedMaterial(material)}
                        className="p-2 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                        title="Manage Size-Based Pricing"
                      >
                        <DollarSign className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(material)}
                        className="p-2 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Price Tiers Modal */}
    {selectedMaterial && (
      <MaterialPriceTiers
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />
    )}
    </>
  );
}
