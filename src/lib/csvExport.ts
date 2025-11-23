import { Database } from './database.types';
import { calculateCostSummary, calculateCFT, Component, Extras } from './calculations';

type Product = Database['public']['Tables']['products']['Row'];
type DBComponent = Database['public']['Tables']['components']['Row'];
type DBExtras = Database['public']['Tables']['product_extras']['Row'];

export interface ProductWithDetails extends Product {
  components?: DBComponent[];
  extras?: DBExtras;
  totalCost?: number;
}

export async function exportProductsWithDetailsToCSV(products: ProductWithDetails[]) {
  if (products.length === 0) {
    alert('No products selected for export');
    return;
  }

  // Create detailed CSV with cost breakdowns
  const csvRows: string[] = [];

  // Add header
  csvRows.push([
    'Product Name',
    'Product Type',
    'Reference Number',
    'Designer',
    'Dimensions (L×W×H)',
    'Total Components',
    'Component Total (₹)',
    'Labour (₹)',
    'Polish (₹)',
    'Hardware (₹)',
    'CNC (₹)',
    'Foam (₹)',
    'Iron (₹)',
    'Extras Total (₹)',
    'Subtotal (₹)',
    'M&A (₹)',
    'Profit (₹)',
    'Subtotal with Margins (₹)',
    'GST (₹)',
    'Grand Total (₹)',
    'M&A %',
    'Profit %',
    'GST %',
    'Created Date'
  ].join(','));

  // Add product rows with calculations
  for (const product of products) {
    const dimensions = [
      product.overall_length || 0,
      product.overall_width || 0,
      product.overall_height || 0
    ].join(' × ');

    let costSummary = {
      componentTotal: 0,
      labour: 0,
      polish: 0,
      hardware: 0,
      cnc: 0,
      foam: 0,
      iron: 0,
      extrasTotal: 0,
      subtotal: 0,
      ma: 0,
      profit: 0,
      subtotalWithMargins: 0,
      gst: 0,
      grandTotal: 0
    };

    let ma_percentage = 20;
    let profit_percentage = 20;
    let gst_percentage = 18;

    // Calculate costs if components and extras exist
    if (product.components && product.extras) {
      const components: Component[] = product.components.map(c => ({
        id: c.id,
        description: c.description,
        length: c.length,
        width: c.width,
        height: c.height,
        pieces: c.pieces,
        cft: c.cft,
        rate: c.rate,
        material_id: c.material_id
      }));

      const extras: Extras = {
        labour: product.extras.labour,
        polish: product.extras.polish,
        hardware: product.extras.hardware,
        cnc: product.extras.cnc,
        foam: product.extras.foam,
        iron_weight: product.extras.iron_weight,
        iron_rate: product.extras.iron_rate,
        ma_percentage: product.extras.ma_percentage,
        profit_percentage: product.extras.profit_percentage,
        gst_percentage: product.extras.gst_percentage
      };

      ma_percentage = product.extras.ma_percentage;
      profit_percentage = product.extras.profit_percentage;
      gst_percentage = product.extras.gst_percentage;

      costSummary = calculateCostSummary(components, extras);
    }

    const row = [
      `"${product.name}"`,
      `"${product.product_type}"`,
      `"${product.reference_number || ''}"`,
      `"${product.designer_name || ''}"`,
      `"${dimensions}"`,
      product.components?.length || 0,
      costSummary.componentTotal.toFixed(2),
      costSummary.labour.toFixed(2),
      costSummary.polish.toFixed(2),
      costSummary.hardware.toFixed(2),
      costSummary.cnc.toFixed(2),
      costSummary.foam.toFixed(2),
      costSummary.iron.toFixed(2),
      costSummary.extrasTotal.toFixed(2),
      costSummary.subtotal.toFixed(2),
      costSummary.ma.toFixed(2),
      costSummary.profit.toFixed(2),
      costSummary.subtotalWithMargins.toFixed(2),
      costSummary.gst.toFixed(2),
      costSummary.grandTotal.toFixed(2),
      ma_percentage.toFixed(2),
      profit_percentage.toFixed(2),
      gst_percentage.toFixed(2),
      `"${product.created_at ? new Date(product.created_at).toLocaleDateString('en-IN') : ''}"`
    ];

    csvRows.push(row.join(','));
  }

  // Add a blank row
  csvRows.push('');

  // Add component details section
  csvRows.push('');
  csvRows.push('COMPONENT DETAILS');
  csvRows.push('');

  for (const product of products) {
    if (product.components && product.components.length > 0) {
      csvRows.push(`"Product: ${product.name}"`);
      csvRows.push([
        'Component Description',
        'Length',
        'Width',
        'Height',
        'Pieces',
        'CFT',
        'Rate per CFT',
        'Total Cost'
      ].join(','));

      for (const component of product.components) {
        const cft = component.cft !== null
          ? component.cft
          : calculateCFT(component.length, component.width, component.height, component.pieces);
        
        const total = cft * component.rate;

        csvRows.push([
          `"${component.description}"`,
          component.length?.toFixed(2) || '0',
          component.width?.toFixed(2) || '0',
          component.height?.toFixed(2) || '0',
          component.pieces,
          cft.toFixed(4),
          component.rate.toFixed(2),
          total.toFixed(2)
        ].join(','));
      }
      csvRows.push('');
    }
  }

  const csvContent = csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `woodcurls_products_detailed_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
