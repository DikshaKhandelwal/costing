import { useState } from 'react';
import { Database } from '../lib/database.types';
import { Upload, X } from 'lucide-react';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

interface ProductFormProps {
  onSubmit: (product: ProductInsert) => void;
  onCancel: () => void;
  initialData?: ProductInsert;
}

const PRODUCT_TYPES = [
  'Bed',
  'Wardrobe',
  'Sofa',
  'Table',
  'Chair',
  'Cabinet',
  'Shelf',
  'Other'
];

export default function ProductForm({ onSubmit, onCancel, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductInsert>(
    initialData || {
      name: '',
      product_type: 'Bed',
      overall_length: null,
      overall_width: null,
      overall_height: null,
      designer_name: null,
      reference_number: null,
      image_url: null
    }
  );
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image_url: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setFormData({ ...formData, image_url: null });
    setImagePreview(null);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          {imagePreview ? (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-stone-300">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-100 hover:bg-stone-200 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-stone-700 mb-3" />
                <p className="mb-2 text-base font-semibold text-stone-900">
                  <span className="text-stone-700">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-stone-700">PNG, JPG, JPEG (MAX. 2MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Type *
          </label>
          <select
            value={formData.product_type}
            onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            required
          >
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={formData.reference_number || ''}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Dimensions (inches)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Length</label>
              <input
                type="number"
                step="0.01"
                value={formData.overall_length || ''}
                onChange={(e) =>
                  setFormData({ ...formData, overall_length: e.target.value ? parseFloat(e.target.value) : null })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                placeholder="L"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                step="0.01"
                value={formData.overall_width || ''}
                onChange={(e) =>
                  setFormData({ ...formData, overall_width: e.target.value ? parseFloat(e.target.value) : null })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                placeholder="W"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                step="0.01"
                value={formData.overall_height || ''}
                onChange={(e) =>
                  setFormData({ ...formData, overall_height: e.target.value ? parseFloat(e.target.value) : null })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                placeholder="H"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designer Name
          </label>
          <input
            type="text"
            value={formData.designer_name || ''}
            onChange={(e) => setFormData({ ...formData, designer_name: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors font-medium"
        >
          Continue to Components
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
