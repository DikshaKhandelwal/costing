import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Search, Download, CheckSquare, Square, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { exportProductsWithDetailsToCSV } from '../lib/csvExport';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductsListProps {
  onCreateNew: () => void;
  onViewProduct: (productId: string) => void;
}

export default function ProductsList({ onCreateNew, onViewProduct }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    // @ts-ignore
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
      
      // Extract unique categories
      // @ts-ignore
      const uniqueCategories = Array.from(new Set(data?.map(p => p.product_type) || []));
      setCategories(['All', ...uniqueCategories.sort()]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product? This will also delete all components and cost data.')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
    } else {
      loadProducts();
    }
  }

  function toggleProductSelection(productId: string) {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  }

  function toggleSelectAll() {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  }

  function handleExportSelected() {
    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    
    // Fetch full details for selected products including components and extras
    fetchProductsWithDetails(selectedProductsData.map(p => p.id));
  }

  async function fetchProductsWithDetails(productIds: string[]) {
    try {
      // Fetch all products with their components and extras
      const productsWithDetails = await Promise.all(
        productIds.map(async (productId) => {
          const product = products.find(p => p.id === productId);
          if (!product) return null;

          // Fetch components
          const { data: components } = await supabase
            .from('components')
            .select('*')
            .eq('product_id', productId)
            .order('sort_order');

          // Fetch extras
          const { data: extras } = await supabase
            .from('product_extras')
            .select('*')
            .eq('product_id', productId)
            .single();

          return {
            ...product,
            components: components || [],
            extras: extras || undefined
          };
        })
      );

      const validProducts = productsWithDetails.filter(p => p !== null);
      exportProductsWithDetailsToCSV(validProducts);
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('Error fetching product details for export');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-stone-800 text-xl font-semibold">Loading products...</div>
      </div>
    );
  }

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.product_type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.reference_number && product.reference_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.designer_name && product.designer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-stone-900">Products</h2>
          <p className="text-stone-700 mt-2 text-xl">Manage furniture cost estimations</p>
        </div>
        <div className="flex gap-3">
          {selectedProducts.size > 0 && (
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-2 px-6 py-4 bg-stone-700 text-white rounded-xl hover:bg-stone-800 transition-all font-semibold shadow-lg text-lg"
            >
              <Download className="w-5 h-5" />
              Export Selected ({selectedProducts.size})
            </button>
          )}
          <button
            onClick={onCreateNew}
            className="flex items-center gap-3 px-8 py-4 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-all font-semibold shadow-lg hover:shadow-xl text-lg transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            New Product
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-stone-300 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Box */}
          <div>
            <label className="block text-lg font-semibold text-stone-900 mb-3">
              Search Products:
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-600 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, type, reference, or designer..."
                className="w-full pl-12 pr-4 py-3 text-base border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-lg font-semibold text-stone-900 mb-3">
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white font-semibold text-stone-900"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t-2 border-stone-300">
          <div className="flex items-center justify-between">
            <p className="text-base text-stone-700 font-medium">
              {searchQuery || selectedCategory !== 'All' ? (
                <>
                  Showing <span className="font-bold text-stone-900">{filteredProducts.length}</span> of{' '}
                  <span className="font-bold text-stone-900">{products.length}</span> products
                  {searchQuery && <span className="ml-2">matching "{searchQuery}"</span>}
                  {selectedCategory !== 'All' && <span className="ml-2">in {selectedCategory} category</span>}
                </>
              ) : (
                <>
                  Showing all <span className="font-bold text-stone-900">{products.length}</span> products
                </>
              )}
            </p>
            {filteredProducts.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-stone-200 text-stone-900 rounded-lg hover:bg-stone-300 transition-all font-semibold"
              >
                {selectedProducts.size === filteredProducts.length ? (
                  <>
                    <CheckSquare className="w-5 h-5" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5" />
                    Select All
                  </>
                )}
              </button>
            )}
          </div>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-2 text-base text-stone-600 hover:text-stone-800 font-semibold underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-stone-300 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-stone-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">
              {products.length === 0 
                ? 'No products yet'
                : 'No products found'
              }
            </h3>
            <p className="text-stone-700 mb-8 text-lg">
              {products.length === 0 
                ? 'Start creating your first furniture cost estimation by clicking the "New Product" button above.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {products.length === 0 && (
              <button
                onClick={onCreateNew}
                className="px-8 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-all font-semibold shadow-lg text-lg"
              >
                Create First Product
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-lg border-2 hover:shadow-2xl transition-all ${
                selectedProducts.has(product.id) 
                  ? 'border-stone-700 ring-2 ring-stone-400' 
                  : 'border-stone-300 hover:border-stone-400'
              }`}
            >
              {/* Product Image */}
              <div className="w-full h-48 bg-stone-200 rounded-t-2xl overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-20 h-20 text-stone-400" />
                )}
              </div>
              
              <div className="p-8">
                {/* Selection Checkbox */}
                <div className="flex items-start justify-between mb-4">
                  <button
                    onClick={() => toggleProductSelection(product.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    {selectedProducts.has(product.id) ? (
                      <CheckSquare className="w-6 h-6 text-stone-800" />
                    ) : (
                      <Square className="w-6 h-6 text-stone-500" />
                    )}
                    <span className="text-sm font-semibold text-stone-700">
                      {selectedProducts.has(product.id) ? 'Selected' : 'Select'}
                    </span>
                  </button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">{product.name}</h3>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-semibold bg-stone-200 text-stone-900 shadow-sm">
                      {product.product_type}
                    </span>
                  </div>
                </div>

                {product.reference_number && (
                  <div className="mb-4">
                    <span className="text-sm text-stone-600 font-semibold">Ref:</span>
                    <span className="text-base text-stone-800 ml-2 font-medium">{product.reference_number}</span>
                  </div>
                )}

                {(product.overall_length || product.overall_width || product.overall_height) && (
                  <div className="mb-4">
                    <span className="text-sm text-stone-600 font-semibold">Size:</span>
                    <span className="text-base text-stone-800 ml-2 font-medium">
                      {product.overall_length || 0} × {product.overall_width || 0} × {product.overall_height || 0}"
                    </span>
                  </div>
                )}

                {product.designer_name && (
                  <div className="mb-5">
                    <span className="text-sm text-stone-600 font-semibold">Designer:</span>
                    <span className="text-base text-stone-800 ml-2 font-medium">{product.designer_name}</span>
                  </div>
                )}

                <div className="text-sm text-stone-600 mb-5 font-medium">
                  Created {new Date(product.created_at).toLocaleDateString('en-IN')}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => onViewProduct(product.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-all text-base font-semibold shadow-md"
                  >
                    <Eye className="w-5 h-5" />
                    View / Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors shadow-md"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
