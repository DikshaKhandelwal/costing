export interface Component {
  id?: string;
  description: string;
  length: number | null;
  width: number | null;
  height: number | null;
  pieces: number;
  cft: number | null;
  rate: number;
  material_id?: string | null;
  actualLength?: number | null;
  actualWidth?: number | null;
  actualHeight?: number | null;
}

export interface Extras {
  labour: number;
  polish: number;
  hardware: number;
  cnc: number;
  foam: number;
  iron_weight: number;
  iron_rate: number;
  ma_percentage: number;
  profit_percentage: number;
  gst_percentage: number;
}

export interface CostSummary {
  componentTotal: number;
  labour: number;
  polish: number;
  hardware: number;
  cnc: number;
  foam: number;
  iron: number;
  extrasTotal: number;
  subtotal: number;
  ma: number;
  profit: number;
  subtotalWithMargins: number;
  gst: number;
  grandTotal: number;
}

/**
 * Round up dimension to next available wood size increment
 * Wood is sold in: 1', 1.5', 2', 2.5', 3', 3.5', 4', etc.
 * Increments are 0.5 feet (6 inches)
 * 
 * Rule: If difference between input and next size is less than 2",
 * skip to the next available size (to avoid wastage on small differences)
 * 
 * Returns: { size: rounded size, skipped: whether we skipped a size }
 */
export function roundToAvailableSize(inches: number): { size: number; skipped: boolean } {
  const feet = inches / 12;
  const nextSize = Math.ceil(feet * 2) / 2 * 12; // Next 0.5' increment in inches
  
  const difference = nextSize - inches;
  
  // If difference is 0 (already at boundary) OR less than 2", skip to next size
  if (difference <= 2 && difference >= 0) {
    return { size: nextSize + 6, skipped: true }; // Skip to next 0.5 foot increment
  }
  
  return { size: nextSize, skipped: false };
}

/**
 * Apply 20% wastage margin to width
 * Simply adds 20% to the input width, no rounding to available sizes
 * 
 * Example: 15" -> 18" (15 * 1.2)
 */
export function applyWidthWastage(width: number): number {
  return width * 1.2;
}

/**
 * Calculate actual dimensions considering wastage and wood availability
 * Can accept a component object to use manual overrides if provided
 */
export function calculateActualDimensions(
  length: number | null,
  width: number | null,
  height: number | null,
  component?: Component
): { actualLength: number; actualWidth: number; actualHeight: number } {
  if (!length || !width || !height) {
    return { actualLength: 0, actualWidth: 0, actualHeight: 0 };
  }

  // Use manual overrides if provided, otherwise calculate
  const actualLength = component?.actualLength ?? roundToAvailableSize(length).size;
  const actualWidth = component?.actualWidth ?? applyWidthWastage(width);
  const actualHeight = component?.actualHeight ?? height;

  return { actualLength, actualWidth, actualHeight };
}

export function calculateFeet(
  length: number | null,
  width: number | null,
  pieces: number
): number {
  if (!length || !width) return 0;
  
  // Apply wastage calculations
  const actualLength = roundToAvailableSize(length).size;
  const actualWidth = applyWidthWastage(width);
  
  return (actualLength * actualWidth / 144) * pieces;
}

export function calculateCFT(
  length: number | null,
  width: number | null,
  height: number | null,
  pieces: number
): number {
  if (!length || !width || !height) return 0;
  
  // Apply wastage calculations
  const { actualLength, actualWidth, actualHeight } = calculateActualDimensions(length, width, height);
  
  // CFT = (Square Feet × Thickness in inches) / 12
  // Square Feet = (Length × Width) / 144
  const squareFeet = (actualLength * actualWidth) / 144;
  const cft = (squareFeet * actualHeight) / 12;
  
  return cft * pieces;
}

export function calculateComponentTotal(component: Component): number {
  const cft = component.cft !== null
    ? component.cft
    : calculateCFT(component.length, component.width, component.height, component.pieces);
  return cft * component.rate;
}

export function calculateCostSummary(
  components: Component[],
  extras: Extras
): CostSummary {
  const componentTotal = components.reduce(
    (sum, comp) => sum + calculateComponentTotal(comp),
    0
  );

  const iron = extras.iron_weight * extras.iron_rate;

  const extrasTotal =
    extras.labour +
    extras.polish +
    extras.hardware +
    extras.cnc +
    extras.foam +
    iron;

  const subtotal = componentTotal + extrasTotal;

  const ma = subtotal * (extras.ma_percentage / 100);

  const subtotalWithMA = subtotal + ma;

  const profit = subtotalWithMA * (extras.profit_percentage / 100);

  const subtotalWithMargins = subtotalWithMA + profit;

  const gst = subtotalWithMargins * (extras.gst_percentage / 100);

  const grandTotal = subtotalWithMargins + gst;

  return {
    componentTotal,
    labour: extras.labour,
    polish: extras.polish,
    hardware: extras.hardware,
    cnc: extras.cnc,
    foam: extras.foam,
    iron,
    extrasTotal,
    subtotal,
    ma,
    profit,
    subtotalWithMargins,
    gst,
    grandTotal
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}
