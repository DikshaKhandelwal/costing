/*
  # Add Size-Based Material Pricing

  ## Changes
  This migration adds support for size-based pricing tiers for materials.
  Different size ranges (like 1.5-2", 2.5-3", etc.) can have different rates.

  ## New Table: material_price_tiers
  - Links to materials table
  - Stores min_size, max_size, thickness, and rate_per_cft
  - Allows multiple price tiers per material

  ## Migration Strategy
  - Create new table for price tiers
  - Keep existing materials table structure for backward compatibility
  - Materials without price tiers will use the default rate_per_cft
*/

-- Create material_price_tiers table
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

-- Create index for faster lookups
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

-- Insert sample data for ACACIA
INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft)
SELECT id, 1.5, 2.0, 1.0, 564 FROM materials WHERE name = 'Teak'
ON CONFLICT (material_id, min_size, max_size, thickness) DO NOTHING;

INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft)
SELECT id, 1.5, 2.0, 1.5, 564 FROM materials WHERE name = 'Teak'
ON CONFLICT (material_id, min_size, max_size, thickness) DO NOTHING;

INSERT INTO material_price_tiers (material_id, min_size, max_size, thickness, rate_per_cft)
SELECT id, 1.5, 2.0, 2.0, 612 FROM materials WHERE name = 'Teak'
ON CONFLICT (material_id, min_size, max_size, thickness) DO NOTHING;

-- Add comment explaining the table purpose
COMMENT ON TABLE material_price_tiers IS 'Stores size and thickness-based pricing tiers for materials. Allows different rates for different size ranges (e.g., 1.5-2", 2.5-3") and thicknesses (1", 1.5", 2").';
COMMENT ON COLUMN material_price_tiers.min_size IS 'Minimum size in the range (in inches)';
COMMENT ON COLUMN material_price_tiers.max_size IS 'Maximum size in the range (in inches)';
COMMENT ON COLUMN material_price_tiers.thickness IS 'Material thickness (in inches)';
COMMENT ON COLUMN material_price_tiers.rate_per_cft IS 'Rate per cubic foot for this size/thickness combination';
