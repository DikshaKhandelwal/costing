import { Download, FileText } from 'lucide-react';
import { Component, Extras, CostSummary, formatNumber, formatCurrency, calculateCFT, calculateFeet } from '../lib/calculations';
import { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ExportReportProps {
  product: Product;
  components: Component[];
  extras: Extras;
  summary: CostSummary;
}

export default function ExportReport({ product, components, extras, summary }: ExportReportProps) {
  function generatePrintView() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cost Sheet - ${product.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .doc-title {
            font-size: 20px;
            color: #374151;
            margin-top: 10px;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .info-item {
            display: flex;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            color: #374151;
          }
          .info-value {
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #2563eb;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
          }
          td {
            font-size: 12px;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row {
            background: #f3f4f6;
            font-weight: bold;
          }
          .summary-section {
            margin-top: 30px;
            max-width: 500px;
            margin-left: auto;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-label {
            color: #374151;
          }
          .summary-value {
            font-weight: bold;
            font-family: 'Courier New', monospace;
          }
          .summary-subtotal {
            background: #f3f4f6;
            font-weight: bold;
            margin-top: 8px;
          }
          .grand-total {
            background: #dbeafe;
            border: 2px solid #2563eb;
            font-size: 18px;
            padding: 12px;
            margin-top: 12px;
          }
          .grand-total .summary-value {
            color: #1e40af;
            font-size: 20px;
          }
          .extras-section {
            margin-top: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .extras-title {
            font-weight: bold;
            margin-bottom: 12px;
            color: #374151;
            font-size: 14px;
          }
          .extras-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">WoodCurls</div>
          <div class="doc-title">Furniture Cost Estimation Sheet</div>
        </div>

        <div class="info-section">
          <div>
            <div class="info-item">
              <span class="info-label">Product Name:</span>
              <span class="info-value">${product.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Product Type:</span>
              <span class="info-value">${product.product_type}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Reference No:</span>
              <span class="info-value">${product.reference_number || 'N/A'}</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">Overall Size (L×W×H):</span>
              <span class="info-value">${product.overall_length || 0} × ${product.overall_width || 0} × ${product.overall_height || 0} inches</span>
            </div>
            <div class="info-item">
              <span class="info-label">Designer:</span>
              <span class="info-value">${product.designer_name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        <h3 style="margin-bottom: 15px; color: #374151;">Component Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">L</th>
              <th class="text-center">W</th>
              <th class="text-center">H</th>
              <th class="text-center">Pcs</th>
              <th class="text-center">Feet</th>
              <th class="text-center">CFT</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${components.map(comp => {
              const cft = comp.cft !== null ? comp.cft : calculateCFT(comp.length, comp.width, comp.height, comp.pieces);
              const feet = calculateFeet(comp.length, comp.width, comp.pieces);
              const total = cft * comp.rate;
              return `
                <tr>
                  <td>${comp.description}</td>
                  <td class="text-center">${comp.length || '-'}</td>
                  <td class="text-center">${comp.width || '-'}</td>
                  <td class="text-center">${comp.height || '-'}</td>
                  <td class="text-center">${comp.pieces}</td>
                  <td class="text-center">${formatNumber(feet, 2)}</td>
                  <td class="text-center">${formatNumber(cft, 4)}</td>
                  <td class="text-right">₹${formatNumber(comp.rate, 2)}</td>
                  <td class="text-right">₹${formatNumber(total, 2)}</td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="5">COMPONENT TOTAL</td>
              <td class="text-center">${formatNumber(components.reduce((sum, c) => sum + calculateFeet(c.length, c.width, c.pieces), 0), 2)}</td>
              <td class="text-center">${formatNumber(components.reduce((sum, c) => sum + (c.cft !== null ? c.cft : calculateCFT(c.length, c.width, c.height, c.pieces)), 0), 4)}</td>
              <td></td>
              <td class="text-right">₹${formatNumber(summary.componentTotal, 2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="extras-section">
          <div class="extras-title">Additional Costs</div>
          <div class="extras-grid">
            <div class="summary-row" style="border: none;">
              <span>Labour:</span>
              <span style="font-family: 'Courier New', monospace;">${formatCurrency(extras.labour)}</span>
            </div>
            <div class="summary-row" style="border: none;">
              <span>Polish:</span>
              <span style="font-family: 'Courier New', monospace;">${formatCurrency(extras.polish)}</span>
            </div>
            <div class="summary-row" style="border: none;">
              <span>Hardware:</span>
              <span style="font-family: 'Courier New', monospace;">${formatCurrency(extras.hardware)}</span>
            </div>
            <div class="summary-row" style="border: none;">
              <span>CNC:</span>
              <span style="font-family: 'Courier New', monospace;">${formatCurrency(extras.cnc)}</span>
            </div>
            <div class="summary-row" style="border: none;">
              <span>Foam:</span>
              <span style="font-family: 'Courier New', monospace;">${formatCurrency(extras.foam)}</span>
            </div>
            <div class="summary-row" style="border: none;">
              <span>Iron (${formatNumber(extras.iron_weight, 2)} kg @ ₹${formatNumber(extras.iron_rate, 2)}/kg):</span>
              <span style="font-family: 'Courier New', monospace;">${formatCurrency(summary.iron)}</span>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-label">Base Subtotal:</span>
            <span class="summary-value">${formatCurrency(summary.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Manufacturing Add-on (${extras.ma_percentage}%):</span>
            <span class="summary-value" style="color: #2563eb;">+${formatCurrency(summary.ma)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Profit (${extras.profit_percentage}%):</span>
            <span class="summary-value" style="color: #2563eb;">+${formatCurrency(summary.profit)}</span>
          </div>
          <div class="summary-row summary-subtotal">
            <span class="summary-label">Subtotal with Margins:</span>
            <span class="summary-value">${formatCurrency(summary.subtotalWithMargins)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">GST (${extras.gst_percentage}%):</span>
            <span class="summary-value" style="color: #059669;">+${formatCurrency(summary.gst)}</span>
          </div>
          <div class="summary-row grand-total">
            <span class="summary-label">GRAND TOTAL:</span>
            <span class="summary-value">${formatCurrency(summary.grandTotal)}</span>
          </div>
        </div>

        <div class="footer">
          <p>WoodCurls Furniture - Professional Cost Estimation System</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  function generateCSV() {
    let csv = 'WoodCurls Furniture Cost Sheet\n\n';
    csv += `Product Name:,${product.name}\n`;
    csv += `Product Type:,${product.product_type}\n`;
    csv += `Reference No:,${product.reference_number || 'N/A'}\n`;
    csv += `Overall Size:,${product.overall_length} x ${product.overall_width} x ${product.overall_height} inches\n`;
    csv += `Designer:,${product.designer_name || 'N/A'}\n`;
    csv += `Date:,${new Date().toLocaleDateString('en-IN')}\n\n`;

    csv += 'Component Breakdown\n';
    csv += 'Description,L,W,H,Pcs,Feet,CFT,Rate,Total\n';

    components.forEach(comp => {
      const cft = comp.cft !== null ? comp.cft : calculateCFT(comp.length, comp.width, comp.height, comp.pieces);
      const feet = calculateFeet(comp.length, comp.width, comp.pieces);
      const total = cft * comp.rate;
      csv += `"${comp.description}",${comp.length || ''},${comp.width || ''},${comp.height || ''},${comp.pieces},${formatNumber(feet, 2)},${formatNumber(cft, 4)},${formatNumber(comp.rate, 2)},${formatNumber(total, 2)}\n`;
    });

    csv += `\nAdditional Costs\n`;
    csv += `Labour,${extras.labour}\n`;
    csv += `Polish,${extras.polish}\n`;
    csv += `Hardware,${extras.hardware}\n`;
    csv += `CNC,${extras.cnc}\n`;
    csv += `Foam,${extras.foam}\n`;
    csv += `Iron,${summary.iron}\n`;

    csv += `\nCost Summary\n`;
    csv += `Component Total,${summary.componentTotal}\n`;
    csv += `Extras Total,${summary.extrasTotal}\n`;
    csv += `Base Subtotal,${summary.subtotal}\n`;
    csv += `Manufacturing Add-on (${extras.ma_percentage}%),${summary.ma}\n`;
    csv += `Profit (${extras.profit_percentage}%),${summary.profit}\n`;
    csv += `Subtotal with Margins,${summary.subtotalWithMargins}\n`;
    csv += `GST (${extras.gst_percentage}%),${summary.gst}\n`;
    csv += `Grand Total,${summary.grandTotal}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name.replace(/\s+/g, '_')}_cost_sheet.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={generatePrintView}
        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors font-medium"
      >
        <FileText className="w-4 h-4" />
        Print / PDF
      </button>
      <button
        onClick={generateCSV}
        className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
}
