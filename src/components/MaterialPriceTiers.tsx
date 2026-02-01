import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Plus, Trash2, Save, X } from 'lucide-react';

type Material = Database['public']['Tables']['materials']['Row'];
type PriceTier = Database['public']['Tables']['material_price_tiers']['Row'];

interface MaterialPriceTiersProps {
  material: Material;
  onClose: () => void;
}

export default function MaterialPriceTiers({ material, onClose }: MaterialPriceTiersProps) {
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [newTier, setNewTier] = useState({
    min_size: '',
    max_size: '',
    thickness: '',
    rate_per_cft: ''
  });

  useEffect(() => {
    loadTiers();
    checkTableExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  async function checkTableExists() {
    // Quick check to see if table exists
    const { error } = await supabase
      .from('material_price_tiers')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('relation')) {
      console.error('⚠️ Table material_price_tiers does not exist! Run migrations first.');
      alert(
        '⚠️ Database Setup Required\n\n' +
        'The material_price_tiers table has not been created yet.\n\n' +
        'Please run the database migrations:\n' +
        '1. Open your Supabase Dashboard\n' +
        '2. Go to SQL Editor\n' +
        '3. Run: supabase/migrations/20251025160000_add_size_based_pricing.sql\n\n' +
        'See MIGRATION_GUIDE.md for detailed instructions.'
      );
    }
  }

  async function loadTiers() {
    const { data, error } = await supabase
      .from('material_price_tiers')
      .select('*')
      .eq('material_id', material.id)
      .order('min_size', { ascending: true })
      .order('thickness', { ascending: true });

    if (error) {
      console.error('Error loading price tiers:', error);
    } else {
      setTiers(data || []);
    }
  }

  async function handleAddTier(e: React.FormEvent) {
    e.preventDefault();

    if (!newTier.min_size || !newTier.max_size || !newTier.thickness || !newTier.rate_per_cft) {
      alert('Please fill in all fields');
      return;
    }

    const tierData = {
      material_id: material.id,
      min_size: parseFloat(newTier.min_size),
      max_size: parseFloat(newTier.max_size),
      thickness: parseFloat(newTier.thickness),
      rate_per_cft: parseFloat(newTier.rate_per_cft)
    };

    if (tierData.min_size > tierData.max_size) {
      alert('Min size cannot be greater than max size');
      return;
    }

    const { error } = await supabase
      .from('material_price_tiers')
      // @ts-ignore
      .insert([tierData]);

    if (error) {
      console.error('Error adding price tier:', error);
      
      // Show detailed error message
      if (error.code === '23505') {
        alert('This size/thickness combination already exists for this material.\n\n' + 
              `Trying to add: ${tierData.min_size}-${tierData.max_size}", ${tierData.thickness}" thickness`);
      } else {
        alert(`Error adding price tier: ${error.message}\n\nDetails: ${error.hint || error.details || 'Unknown error'}`);
      }
    } else {
      setNewTier({ min_size: '', max_size: '', thickness: '', rate_per_cft: '' });
      loadTiers();
    }
  }

  async function handleDeleteTier(id: string) {
    if (!confirm('Delete this price tier?')) return;

    const { error } = await supabase
      .from('material_price_tiers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tier:', error);
    } else {
      loadTiers();
    }
  }

  // Bulk import function for CSV data
  async function handleBulkImport() {
    const csvText = prompt('Paste CSV data (format: min_size,max_size,thickness,rate):\nExample: 1.5,2,1,564');
    if (!csvText) return;

    const lines = csvText.trim().split('\n');
    const tiersToInsert = [];

    for (const line of lines) {
      const [min, max, thick, rate] = line.split(',').map(s => parseFloat(s.trim()));
      if (min && max && thick && rate) {
        tiersToInsert.push({
          material_id: material.id,
          min_size: min,
          max_size: max,
          thickness: thick,
          rate_per_cft: rate
        });
      }
    }

    if (tiersToInsert.length === 0) {
      alert('No valid data to import');
      return;
    }

    const { error } = await supabase
      .from('material_price_tiers')
      // @ts-ignore
      .insert(tiersToInsert);

    if (error) {
      console.error('Error bulk importing:', error);
      alert('Error importing tiers. Some entries may already exist.');
    } else {
      alert(`Successfully imported ${tiersToInsert.length} price tiers`);
      loadTiers();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-stone-300 bg-stone-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Size-Based Pricing</h2>
              <p className="text-lg text-stone-700 mt-1">{material.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-stone-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add New Tier Form */}
          <form onSubmit={handleAddTier} className="mb-6 p-6 bg-stone-100 rounded-xl border-2 border-stone-300">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Add Price Tier</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Size (feet)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTier.min_size}
                  onChange={(e) => setNewTier({ ...newTier, min_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="1.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Size (feet)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTier.max_size}
                  onChange={(e) => setNewTier({ ...newTier, max_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (inches)</label>
                <input
                  type="number"
                  step="0.25"
                  value={newTier.thickness}
                  onChange={(e) => setNewTier({ ...newTier, thickness: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate/CFT (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTier.rate_per_cft}
                  onChange={(e) => setNewTier({ ...newTier, rate_per_cft: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  placeholder="564"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Tier
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="flex items-center gap-2 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Bulk Import (CSV)
              </button>
            </div>
          </form>

          {/* Price Tiers Table */}
          <div className="bg-white rounded-lg border-2 border-stone-300 overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-bold text-stone-900">Size Range</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-stone-900">Thickness</th>
                  <th className="text-right py-3 px-4 text-sm font-bold text-stone-900">Rate/CFT</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-stone-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No price tiers defined. Add tiers above or use bulk import.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier) => (
                    <tr key={tier.id} className="border-b border-stone-200 hover:bg-stone-50">
                      <td className="py-3 px-4 text-sm font-semibold text-stone-900">
                        {tier.min_size}' - {tier.max_size}'
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-stone-800">
                        {tier.thickness}"
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-stone-900">
                        ₹{tier.rate_per_cft.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Helper Text */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> For bulk import, use CSV format: <code className="bg-blue-100 px-1 py-0.5 rounded">min_size,max_size,thickness,rate</code>
              <br />
              Example: <code className="bg-blue-100 px-1 py-0.5 rounded">1.5,2,1,564</code> or paste multiple lines for batch import.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
