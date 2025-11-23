/*
  # COMPLETE MIGRATION - WoodCurls Costing System
  
  This is a COMPLETE migration that sets up your entire database from scratch.
  Run this ONCE in your Supabase SQL Editor.
  
  Includes:
  1. Create base schema (materials, products, components, product_extras)
  2. Add product images support
  3. Add size-based pricing for materials
  4. Populate sample materials with pricing tiers
*/

-- =====================================================
-- MIGRATION 1: Create WoodCurls Base Schema
-- =====================================================

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  rate_per_cft numeric(10, 2) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_type text NOT NULL,
  overall_length numeric(10, 2),
  overall_width numeric(10, 2),
  overall_height numeric(10, 2),
  designer_name text,
  reference_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  description text NOT NULL,
  length numeric(10, 2),
  width numeric(10, 2),
  height numeric(10, 2),
  pieces integer DEFAULT 1,
  cft numeric(10, 4),
  rate numeric(10, 2) NOT NULL,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create product_extras table
CREATE TABLE IF NOT EXISTS product_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  labour numeric(10, 2) DEFAULT 0,
  polish numeric(10, 2) DEFAULT 0,
  hardware numeric(10, 2) DEFAULT 0,
  cnc numeric(10, 2) DEFAULT 0,
  foam numeric(10, 2) DEFAULT 0,
  iron_weight numeric(10, 2) DEFAULT 0,
  iron_rate numeric(10, 2) DEFAULT 0,
  ma_percentage numeric(5, 2) DEFAULT 20,
  profit_percentage numeric(5, 2) DEFAULT 20,
  gst_percentage numeric(5, 2) DEFAULT 18,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_components_product_id ON components(product_id);
CREATE INDEX IF NOT EXISTS idx_product_extras_product_id ON product_extras(product_id);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_components_sort_order ON components(product_id, sort_order);

-- Enable Row Level Security
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_extras ENABLE ROW LEVEL SECURITY;

-- RLS Policies for materials (public read)
CREATE POLICY "Materials are viewable by everyone"
  ON materials FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Materials can be inserted by anyone"
  ON materials FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Materials can be updated by anyone"
  ON materials FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Materials can be deleted by anyone"
  ON materials FOR DELETE
  TO public
  USING (true);

-- RLS Policies for products (public access for demo)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products can be inserted by anyone"
  ON products FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Products can be updated by anyone"
  ON products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Products can be deleted by anyone"
  ON products FOR DELETE
  TO public
  USING (true);

-- RLS Policies for components
CREATE POLICY "Components are viewable by everyone"
  ON components FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Components can be inserted by anyone"
  ON components FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Components can be updated by anyone"
  ON components FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Components can be deleted by anyone"
  ON components FOR DELETE
  TO public
  USING (true);

-- RLS Policies for product_extras
CREATE POLICY "Product extras are viewable by everyone"
  ON product_extras FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Product extras can be inserted by anyone"
  ON product_extras FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Product extras can be updated by anyone"
  ON product_extras FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Product extras can be deleted by anyone"
  ON product_extras FOR DELETE
  TO public
  USING (true);

-- Insert default materials
INSERT INTO materials (name, rate_per_cft, description, is_active) VALUES
  ('Teak', 1150.00, 'Premium hardwood', true),
  ('Pine', 650.00, 'Softwood for general use', true),
  ('Oak', 980.00, 'Durable hardwood', true),
  ('Plywood', 450.00, 'Engineered wood', true),
  ('MDF', 320.00, 'Medium density fiberboard', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MIGRATION 2: Add Product Images Support
-- =====================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN products.image_url IS 'URL or base64 encoded image of the product';

-- =====================================================
-- MIGRATION 3: Add Size-Based Material Pricing
-- =====================================================

CREATE TABLE IF NOT EXISTS material_price_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  min_size numeric(10, 2) NOT NULL,
  max_size numeric(10, 2) NOT NULL,
  thickness numeric(10, 2) NOT NULL,
  rate_per_cft numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_size_range CHECK (max_size >= min_size),
  CONSTRAINT valid_thickness CHECK (thickness > 0),
  CONSTRAINT unique_material_tier UNIQUE (material_id, min_size, max_size, thickness)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_material_price_tiers_material_id ON material_price_tiers(material_id);
CREATE INDEX IF NOT EXISTS idx_material_price_tiers_size_lookup ON material_price_tiers(material_id, min_size, max_size, thickness);

-- Enable Row Level Security
ALTER TABLE material_price_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for demo)
CREATE POLICY "Material price tiers are viewable by everyone"
  ON material_price_tiers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Material price tiers can be inserted by anyone"
  ON material_price_tiers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Material price tiers can be updated by anyone"
  ON material_price_tiers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Material price tiers can be deleted by anyone"
  ON material_price_tiers FOR DELETE
  TO public
  USING (true);

-- Add table comments
COMMENT ON TABLE material_price_tiers IS 'Stores size and thickness-based pricing tiers for materials. Allows different rates for different size ranges (e.g., 1.5-2", 2.5-3") and thicknesses (1", 1.5", 2").';
COMMENT ON COLUMN material_price_tiers.min_size IS 'Minimum size in the range (in inches)';
COMMENT ON COLUMN material_price_tiers.max_size IS 'Maximum size in the range (in inches)';
COMMENT ON COLUMN material_price_tiers.thickness IS 'Material thickness (in inches)';
COMMENT ON COLUMN material_price_tiers.rate_per_cft IS 'Rate per cubic foot for this size/thickness combination';

-- =====================================================
-- MIGRATION 4: Populate Wood Pricing Data
-- =====================================================

-- Ensure we have the materials
INSERT INTO materials (name, rate_per_cft, description, is_active) VALUES
  ('ACACIA', 600, 'Acacia wood with size-based pricing', true),
  ('MANGO', 672, 'Mango wood with size-based pricing', true),
  ('SHEESHAM', 850, 'Sheesham wood with size-based pricing', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = true;

-- Populate price tiers
DO $$
DECLARE
  acacia_id uuid;
  mango_id uuid;
  sheesham_id uuid;
BEGIN
  SELECT id INTO acacia_id FROM materials WHERE name = 'ACACIA';
  SELECT id INTO mango_id FROM materials WHERE name = 'MANGO';
  SELECT id INTO sheesham_id FROM materials WHERE name = 'SHEESHAM';

  -- =====================================================
  -- ACACIA PRICING (21 tiers)
  -- =====================================================
  
  -- 1.5-2 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 1.5, 2.0, 1.0, 564),
    (acacia_id, 1.5, 2.0, 1.5, 564),
    (acacia_id, 1.5, 2.0, 2.0, 612)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 2.5 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 2.5, 2.5, 1.0, 600),
    (acacia_id, 2.5, 2.5, 1.5, 600),
    (acacia_id, 2.5, 2.5, 2.0, 648)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 3-3.5 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 3.0, 3.5, 1.0, 636),
    (acacia_id, 3.0, 3.5, 1.5, 636),
    (acacia_id, 3.0, 3.5, 2.0, 684)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 4-4.5 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 4.0, 4.5, 1.0, 660),
    (acacia_id, 4.0, 4.5, 1.5, 708),
    (acacia_id, 4.0, 4.5, 2.0, 744)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 5 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 5.0, 5.0, 1.0, 696),
    (acacia_id, 5.0, 5.0, 1.5, 696),
    (acacia_id, 5.0, 5.0, 2.0, 744)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 5.5-6 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 5.5, 6.0, 1.0, 756),
    (acacia_id, 5.5, 6.0, 1.5, 756),
    (acacia_id, 5.5, 6.0, 2.0, 804)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 6.5 and above
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (acacia_id, 6.5, 999.0, 1.0, 816),
    (acacia_id, 6.5, 999.0, 1.5, 816),
    (acacia_id, 6.5, 999.0, 2.0, 864)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- =====================================================
  -- MANGO PRICING (9 tiers)
  -- =====================================================
  
  -- 1.5-2 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (mango_id, 1.5, 2.0, 1.0, 552),
    (mango_id, 1.5, 2.0, 1.5, 552),
    (mango_id, 1.5, 2.0, 2.0, 588)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 2.5-4.5 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (mango_id, 2.5, 4.5, 1.0, 672),
    (mango_id, 2.5, 4.5, 1.5, 672),
    (mango_id, 2.5, 4.5, 2.0, 708)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 5 and up
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (mango_id, 5.0, 999.0, 1.0, 756),
    (mango_id, 5.0, 999.0, 1.5, 756),
    (mango_id, 5.0, 999.0, 2.0, 792)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- =====================================================
  -- SHEESHAM PRICING (18 tiers)
  -- =====================================================
  
  -- 1.5-2 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (sheesham_id, 1.5, 2.0, 1.0, 750),
    (sheesham_id, 1.5, 2.0, 1.5, 750),
    (sheesham_id, 1.5, 2.0, 2.0, 850)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 2.5-3 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (sheesham_id, 2.5, 3.0, 1.0, 850),
    (sheesham_id, 2.5, 3.0, 1.5, 850),
    (sheesham_id, 2.5, 3.0, 2.0, 950)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 3.5-4 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (sheesham_id, 3.5, 4.0, 1.0, 950),
    (sheesham_id, 3.5, 4.0, 1.5, 950),
    (sheesham_id, 3.5, 4.0, 2.0, 1050)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 4.5-5 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (sheesham_id, 4.5, 5.0, 1.0, 1050),
    (sheesham_id, 4.5, 5.0, 1.5, 1050),
    (sheesham_id, 4.5, 5.0, 2.0, 1150)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 5.5-6 range
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (sheesham_id, 5.5, 6.0, 1.0, 1250),
    (sheesham_id, 5.5, 6.0, 1.5, 1250),
    (sheesham_id, 5.5, 6.0, 2.0, 1350)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

  -- 6.5 and above
  INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft) VALUES
    (sheesham_id, 6.5, 999.0, 1.0, 1350),
    (sheesham_id, 6.5, 999.0, 1.5, 1350),
    (sheesham_id, 6.5, 999.0, 2.0, 1450)
  ON CONFLICT (material_id, min_size, max_size, thickness) DO UPDATE SET rate_per_cft = EXCLUDED.rate_per_cft;

END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify everything worked:
/*
SELECT 'Materials Created' as check_type, COUNT(*)::text as result FROM materials
UNION ALL
SELECT 'Price Tiers - ACACIA', COUNT(*)::text FROM material_price_tiers mpt 
  JOIN materials m ON m.id = mpt.material_id WHERE m.name = 'ACACIA'
UNION ALL
SELECT 'Price Tiers - MANGO', COUNT(*)::text FROM material_price_tiers mpt 
  JOIN materials m ON m.id = mpt.material_id WHERE m.name = 'MANGO'
UNION ALL
SELECT 'Price Tiers - SHEESHAM', COUNT(*)::text FROM material_price_tiers mpt 
  JOIN materials m ON m.id = mpt.material_id WHERE m.name = 'SHEESHAM';
*/

-- Expected results:
-- Materials Created: 8 (5 default + 3 wood types)
-- ACACIA: 21 tiers
-- MANGO: 9 tiers
-- SHEESHAM: 18 tiers

-- =====================================================
-- MIGRATION 5: Add Custom Costs Support
-- =====================================================

-- Create product_custom_costs table
CREATE TABLE IF NOT EXISTS product_custom_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_custom_costs_product_id ON product_custom_costs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_custom_costs_sort_order ON product_custom_costs(product_id, sort_order);

-- Enable Row Level Security
ALTER TABLE product_custom_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for demo)
CREATE POLICY "Custom costs are viewable by everyone"
  ON product_custom_costs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Custom costs can be inserted by anyone"
  ON product_custom_costs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Custom costs can be updated by anyone"
  ON product_custom_costs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Custom costs can be deleted by anyone"
  ON product_custom_costs FOR DELETE
  TO public
  USING (true);

-- Add comments
COMMENT ON TABLE product_custom_costs IS 'Stores custom/additional cost items for products (e.g., Delivery, Packaging, Installation)';
COMMENT ON COLUMN product_custom_costs.label IS 'Description of the cost item';
COMMENT ON COLUMN product_custom_costs.amount IS 'Cost amount in currency';
COMMENT ON COLUMN product_custom_costs.sort_order IS 'Display order of cost items';
