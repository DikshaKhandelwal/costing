# Custom Costs Database Setup

## Overview
Added support for custom cost items (e.g., Delivery, Packaging, Installation) that can be added/removed dynamically per product.

## Database Migration Required

### Option 1: Run Individual Migration (Recommended for existing databases)
Run this SQL in your Supabase SQL Editor:
```sql
-- Copy contents from: supabase/migrations/20251123000000_add_custom_costs.sql
```

### Option 2: Run Complete Migration (For new databases)
If setting up from scratch, run the updated:
```sql
-- Copy contents from: supabase/COMPLETE_MIGRATION.sql
-- This now includes the custom costs table (Migration 5)
```

## What Changed

### 1. New Database Table: `product_custom_costs`
```sql
- id (uuid, primary key)
- product_id (uuid, foreign key to products)
- label (text) - Description like "Delivery", "Packaging"
- amount (numeric) - Cost amount
- sort_order (integer) - Display order
- created_at, updated_at (timestamps)
```

### 2. Updated Files

**Frontend:**
- `src/lib/database.types.ts` - Added `product_custom_costs` types
- `src/components/ExtrasForm.tsx` - Now loads/saves custom costs from DB
- `src/pages/ProductEditor.tsx` - Passes `productId` to ExtrasForm

**Database:**
- `supabase/migrations/20251123000000_add_custom_costs.sql` - New migration
- `supabase/COMPLETE_MIGRATION.sql` - Updated with Migration 5

### 3. Features

**Add Custom Costs:**
- Click "Add Cost Item" button in Additional Costs section
- Enter description (e.g., "Delivery Charges")
- Enter amount
- Saves to database automatically (if product is saved)

**Delete Custom Costs:**
- Click trash icon next to any cost item
- Deletes from database immediately

**Auto-calculated Total:**
- Shows sum of all custom costs
- Updates in real-time

## How to Use

1. **Run the migration** in Supabase SQL Editor (see above)
2. **Refresh your app**
3. **Open any product** in the editor
4. **Scroll to "Additional Costs & Margins"**
5. **Click "Add Cost Item"** to add custom costs
6. **Enter description and amount**
7. **Custom costs are saved automatically!**

## Verification

After running migration, verify with this query:
```sql
-- Check table exists
SELECT COUNT(*) FROM product_custom_costs;

-- Should return 0 (no custom costs yet)
```

## Example Usage

Product: King Size Bed
Custom Costs:
- Delivery Charges: ₹2,000
- Packaging Material: ₹500
- Installation: ₹1,500

Total Custom Costs: ₹4,000

## Notes

- Custom costs are product-specific (not global)
- Can add unlimited custom cost items
- Custom costs are included in the total but shown separately from fixed costs (Labour, Polish, etc.)
- Works with both new and existing products
- If editing a product that hasn't been saved yet, custom costs are stored temporarily and will be saved when product is saved

## Troubleshooting

**Error: "relation product_custom_costs does not exist"**
→ Run the migration SQL in Supabase SQL Editor

**Custom costs not showing:**
→ Make sure productId is being passed to ExtrasForm
→ Check browser console for errors

**Changes not saving:**
→ Verify RLS policies are enabled (they're in the migration)
→ Check that product has been saved (has an ID)
