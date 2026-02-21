import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import ProductForm from '../components/ProductForm';
import ComponentsTable from '../components/ComponentsTable';
import ExtrasForm from '../components/ExtrasForm';
import CostSummary from '../components/CostSummary';
import ExportReport from '../components/ExportReport';
import { Component, Extras, calculateCostSummary } from '../lib/calculations';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

interface ProductEditorProps {
  productId?: string;
  onBack: () => void;
}

export default function ProductEditor({ productId, onBack }: ProductEditorProps) {
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [extras, setExtras] = useState<Extras>({
    labour: 0,
    polish: 0,
    hardware: 0,
    cnc: 0,
    foam: 0,
    iron_weight: 0,
    iron_rate: 0,
    ma_percentage: 20,
    profit_percentage: 20,
    gst_percentage: 18
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadProduct() {
    if (!productId) return;

    // @ts-ignore
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productData) {
      setProduct(productData);
      setStep(2);

      // @ts-ignore
      const { data: componentsData } = await supabase
        .from('components')
        .select('*')
        // @ts-ignore
        .eq('product_id', productData.id)
        .order('sort_order');

      if (componentsData) {
        // @ts-ignore
        const components: any[] = componentsData;
        setComponents(components.map(c => ({
          id: c.id,
          description: c.description,
          length: c.length,
          width: c.width,
          height: c.height,
          pieces: c.pieces,
          cft: c.cft,
          rate: c.rate,
          material_id: c.material_id
        })));
      }

      // @ts-ignore
      const { data: extrasData } = await supabase
        .from('product_extras')
        .select('*')
        // @ts-ignore
        .eq('product_id', productData.id)
        .maybeSingle();

      if (extrasData) {
        // @ts-ignore
        const extras: any = extrasData;
        setExtras({
          labour: extras.labour,
          polish: extras.polish,
          hardware: extras.hardware,
          cnc: extras.cnc,
          foam: extras.foam,
          iron_weight: extras.iron_weight,
          iron_rate: extras.iron_rate,
          ma_percentage: extras.ma_percentage,
          profit_percentage: extras.profit_percentage,
          gst_percentage: extras.gst_percentage
        });
      }
    }
  }

  async function handleProductSubmit(productData: ProductInsert) {
    setSaving(true);

    if (product) {
      // @ts-ignore
      const { error } = await supabase
        .from('products')
        // @ts-ignore
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (!error) {
        setProduct({ ...product, ...productData } as Product);
        setStep(2);
      }
    } else {
      // @ts-ignore
      const { data, error } = await supabase
        .from('products')
        // @ts-ignore
        .insert([productData])
        .select()
        .single();

      if (!error && data) {
        setProduct(data);
        setStep(2);
      }
    }

    setSaving(false);
  }

  async function saveComponents() {
    if (!product) return;

    setSaving(true);

    await supabase
      .from('components')
      .delete()
      .eq('product_id', product.id);

    if (components.length > 0) {
      const componentsToInsert = components.map((comp, index) => ({
        product_id: product.id,
        description: comp.description,
        length: comp.length,
        width: comp.width,
        height: comp.height,
        pieces: comp.pieces,
        cft: comp.cft,
        rate: comp.rate,
        material_id: comp.material_id,
        sort_order: index
      }));

      // @ts-ignore
      await supabase
        .from('components')
        // @ts-ignore
        .insert(componentsToInsert);
    }

    const { data: existingExtras } = await supabase
      .from('product_extras')
      .select('id')
      .eq('product_id', product.id)
      .maybeSingle();

    if (existingExtras) {
      // @ts-ignore
      await supabase
        .from('product_extras')
        // @ts-ignore
        .update({
          ...extras,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', product.id);
    } else {
      // @ts-ignore
      await supabase
        .from('product_extras')
        // @ts-ignore
        .insert([{
          product_id: product.id,
          ...extras
        }]);
    }

    setSaving(false);
  }

  const summary = calculateCostSummary(components, extras);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!isImageOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsImageOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isImageOpen]);

  function clamp(v: number) {
    return Math.min(3, Math.max(0.5, v));
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <ProductForm
          onSubmit={handleProductSubmit}
          onCancel={onBack}
          initialData={product || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit Product Info
          </button>
          <button
            onClick={saveComponents}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {product && (
        <div className="bg-stone-200 rounded-lg p-6 border border-stone-300">
          <div className="flex items-start gap-6">
            {product.image_url ? (
              <div className="w-36 h-36 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border cursor-zoom-in">
                <img
                  src={product.image_url}
                  alt={`${product.name} image`}
                  className="w-full h-full object-contain"
                  onClick={() => { setIsImageOpen(true); setZoom(1); }}
                />
              </div>
            ) : null}

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                <span className="font-medium">{product.product_type}</span>
                {product.reference_number && <span>Ref: {product.reference_number}</span>}
                {(product.overall_length || product.overall_width || product.overall_height) && (
                  <span>
                    Size: {product.overall_length || 0} × {product.overall_width || 0} × {product.overall_height || 0}"
                  </span>
                )}
                {product.designer_name && <span>Designer: {product.designer_name}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageOpen && product?.image_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="relative max-w-[95%] max-h-[95%] flex items-center">
            <button
              onClick={() => setIsImageOpen(false)}
              className="absolute top-2 right-2 z-20 p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute left-2 top-2 z-20 flex gap-2">
              <button
                onClick={() => setZoom((z) => clamp(Number((z - 0.1).toFixed(2))))}
                className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                aria-label="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => clamp(Number((z + 0.1).toFixed(2))))}
                className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                aria-label="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                aria-label="Reset zoom"
              >
                Reset
              </button>
            </div>

            <div
              className="flex items-center justify-center overflow-auto"
              onWheel={(e) => {
                e.preventDefault();
                const delta = (e.deltaY || e.detail) > 0 ? -0.1 : 0.1;
                setZoom((z) => clamp(Number((z + delta).toFixed(2))));
              }}
            >
              <img
                src={product.image_url}
                alt={`${product.name} zoom`}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 120ms linear' }}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onDoubleClick={() => setZoom(1)}
              />
            </div>
          </div>
        </div>
      )}

      <ComponentsTable components={components} onChange={setComponents} />

      <ExtrasForm productId={product?.id} extras={extras} onChange={setExtras} />

      <CostSummary summary={summary} />

      {product && components.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
          <ExportReport
            product={product}
            components={components}
            extras={extras}
            summary={summary}
          />
        </div>
      )}
    </div>
  );
}
