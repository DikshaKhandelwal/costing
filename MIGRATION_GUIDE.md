# Running Database Migrations for Size-Based Pricing

## ⚠️ IMPORTANT: You need to run these migrations in your Supabase database!

If you're getting errors like "Error adding price tier", it's likely because the `material_price_tiers` table doesn't exist yet in your database.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Project:**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration 1 - Create Price Tiers Table:**
   - Copy the entire contents of: `supabase/migrations/20251025160000_add_size_based_pricing.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for success message ✅

4. **Run Migration 2 - Populate Sample Data:**
   - Copy the entire contents of: `supabase/migrations/20251025161000_populate_wood_pricing.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - Wait for success message ✅

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd d:\costing\project

# Link to your Supabase project (first time only)
supabase link --project-ref your-project-ref

# Run all pending migrations
supabase db push
```

## Verify Migrations Worked

After running the migrations, verify the table exists:

1. Go to Supabase Dashboard → "Table Editor"
2. Look for `material_price_tiers` table in the list
3. You should see columns: id, material_id, min_size, max_size, thickness, rate_per_cft, created_at, updated_at

## Check Sample Data

If you ran the second migration, check if materials were created:

1. Go to "Table Editor" → `materials` table
2. Look for: ACACIA, MANGO, SHEESHAM
3. Go to `material_price_tiers` table
4. You should see multiple rows with different size ranges

## Troubleshooting

### "Table already exists" error
- This is OK! It means the migration already ran
- Skip to the next migration

### "Permission denied" error
- Make sure you're using the Service Role key (for server-side operations)
- Or run migrations through the Supabase Dashboard

### "Foreign key constraint" error
- Make sure the `materials` table exists first
- Run the migrations in order (160000 before 161000)

### Still getting "Error adding price tier"
1. Open browser console (F12)
2. Look at the error details printed by `console.error`
3. Share the full error message for more specific help

## After Running Migrations

1. **Refresh your app** (Ctrl+R or F5)
2. **Go to Material Master**
3. **Click $ icon on any material**
4. **Try adding a price tier:**
   - Min Size: 1.5
   - Max Size: 2
   - Thickness: 1
   - Rate: 564
5. **Should work now!** ✅

## Migration Files

The following files need to be run in order:

1. `20251025124659_create_woodcurls_schema.sql` (already run - creates base tables)
2. `20251025150000_add_product_images.sql` (already run - adds image support)
3. **`20251025160000_add_size_based_pricing.sql`** ← Run this first
4. **`20251025161000_populate_wood_pricing.sql`** ← Run this second

## Quick Test Query

Run this in SQL Editor to check if everything is set up:

```sql
-- Check if table exists
SELECT COUNT(*) FROM material_price_tiers;

-- Check sample data
SELECT m.name, COUNT(pt.*) as tier_count
FROM materials m
LEFT JOIN material_price_tiers pt ON pt.material_id = m.id
WHERE m.name IN ('ACACIA', 'MANGO', 'SHEESHAM')
GROUP BY m.name;
```

Expected result:
```
ACACIA    21 tiers
MANGO     9 tiers
SHEESHAM  18 tiers
```

---

**Need Help?** Check the browser console for detailed error messages, or share the exact error you're seeing.
