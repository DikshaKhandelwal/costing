/*
  # Combined Migration: Size-Based Material Pricing
  
  Run this entire script in your Supabase SQL Editor to:
  1. Create the material_price_tiers table
  2. Add sample data for ACACIA, MANGO, and SHEESHAM woods
  
  This will give you 48 price tiers total:
  - ACACIA: 21 tiers
  - MANGO: 9 tiers  
  - SHEESHAM: 18 tiers
*/

-- =====================================================
-- STEP 1: Create material_price_tiers table
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
-- STEP 2: Create materials and add pricing tiers
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
-- VERIFICATION QUERY (run this after to check results)
-- =====================================================
-- SELECT 
--   m.name,
--   COUNT(mpt.*) as tier_count
-- FROM materials m
-- LEFT JOIN material_price_tiers mpt ON m.id = mpt.material_id
-- WHERE m.name IN ('ACACIA', 'MANGO', 'SHEESHAM')
-- GROUP BY m.name
-- ORDER BY m.name;
--
-- Expected results:
-- ACACIA: 21 tiers
-- MANGO: 9 tiers
-- SHEESHAM: 18 tiers
