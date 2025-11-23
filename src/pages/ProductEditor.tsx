import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
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
      .eq('product_id', productId)
      .single();

    if (productData) {
      setProduct(productData);
      setStep(2);
    }

    // @ts-ignore
    const { data: componentsData } = await supabase
      .from('components')
      .select('*')
      .eq('product_id', productId)
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
      .eq('product_id', productId)
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
