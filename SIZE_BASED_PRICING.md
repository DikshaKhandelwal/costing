# Size-Based Material Pricing Implementation

## Overview
Successfully implemented size and thickness-based pricing system for materials (e.g., ACACIA, MANGO, SHEESHAM) where rates vary based on component dimensions.

## Changes Made

### 1. Database Schema (`20251025160000_add_size_based_pricing.sql`)
- Created `material_price_tiers` table with columns:
  - `material_id` (foreign key to materials)
  - `min_size` (minimum size in inches)
  - `max_size` (maximum size in inches)
  - `thickness` (material thickness in inches)
  - `rate_per_cft` (rate per cubic foot for this tier)
- Added constraints for valid ranges and unique combinations
- Set up RLS policies for public access

### 2. Sample Data (`20251025161000_populate_wood_pricing.sql`)
Populated pricing tiers for three wood types:

**ACACIA:**
- 1.5-2": 564/564/612 (1"/1.5"/2")
- 2.5": 600/600/648
- 3-3.5": 636/636/684
- 4-4.5": 660/708/744
- 5": 696/696/744
- 5.5-6": 756/756/804
- 6.5+": 816/816/864

**MANGO:**
- 1.5-2": 552/552/588
- 2.5-4.5": 672/672/708
- 5+": 756/756/792

**SHEESHAM:**
- 1.5-2": 750/750/850
- 2.5-3": 850/850/950
- 3.5-4": 950/950/1050
- 4.5-5": 1050/1050/1150
- 5.5-6": 1250/1250/1350
- 6.5+": 1350/1350/1450

### 3. TypeScript Types (`database.types.ts`)
Added `material_price_tiers` table definition with Row/Insert/Update types.

### 4. New Component (`MaterialPriceTiers.tsx`)
Modal component for managing size-based pricing:
- Add individual price tiers
- Bulk CSV import functionality
- View/delete existing tiers
- Format: `min_size,max_size,thickness,rate`

### 5. Updated MaterialMaster (`MaterialMaster.tsx`)
- Added "Manage Size-Based Pricing" button ($ icon) in actions column
- Opens MaterialPriceTiers modal for selected material
- Maintains backward compatibility with default rate_per_cft

### 6. Smart Rate Calculation (`ComponentsTable.tsx`)
Implemented `findRateForComponent()` function:
- Calculates max dimension (size) from L/W/H
- Determines thickness (min non-zero dimension)
- Finds matching price tier based on:
  - Material ID
  - Size within min/max range
  - Thickness (with 0.5" tolerance)
- Falls back to default material rate if no tier matches
- **Auto-updates rate when:**
  - Material is selected
  - Dimensions (L/W/H) are changed

## How It Works

1. **Adding Materials:**
   - Go to Material Master
   - Add material with default rate
   - Click $ button to manage size-based pricing
   - Add price tiers manually or bulk import

2. **Automatic Rate Selection:**
   - When user selects a material in ComponentsTable
   - System calculates component's max dimension and thickness
   - Looks up matching price tier
   - Applies appropriate rate automatically
   - Rate updates dynamically as dimensions change

3. **Example:**
   ```
   Component: L=4", W=2", H=1.5"
   Material: ACACIA
   
   Max dimension: 4"
   Thickness: 1.5"
   
   Matches tier: 4-4.5", 1.5" → Rate: ₹708/CFT
   ```

## Benefits

- ✅ Accurate pricing based on actual size ranges
- ✅ Supports lumber industry pricing standards
- ✅ Automatic rate updates when dimensions change
- ✅ Bulk import for easy data entry
- ✅ Backward compatible (falls back to default rate)
- ✅ No manual rate selection needed

## Testing

To test:
1. Run migrations in Supabase
2. Go to Material Master → Click $ on ACACIA/MANGO/SHEESHAM
3. Verify price tiers are loaded
4. Create product with components
5. Select material and enter dimensions
6. Verify rate changes based on size/thickness

## Files Modified

- `supabase/migrations/20251025160000_add_size_based_pricing.sql`
- `supabase/migrations/20251025161000_populate_wood_pricing.sql`
- `src/lib/database.types.ts`
- `src/components/MaterialPriceTiers.tsx` (new)
- `src/components/MaterialMaster.tsx`
- `src/components/ComponentsTable.tsx`
