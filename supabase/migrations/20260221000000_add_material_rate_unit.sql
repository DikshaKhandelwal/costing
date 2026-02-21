-- Add boolean flag to materials to indicate rate unit (per-square-foot)
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS is_rate_per_sqft boolean DEFAULT false;

COMMENT ON COLUMN materials.is_rate_per_sqft IS 'If true, the material rate is interpreted as ₹ per square foot (sqft). Otherwise treated as ₹ per cubic foot (cft)';
