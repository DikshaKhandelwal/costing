/*
  # Populate Size-Based Pricing for Wood Types
  
  This script adds price tiers for ACACIA, MANGO, and SHEESHAM wood types
  based on the pricing table provided.
*/

-- First, ensure we have the materials
INSERT INTO materials (name, rate_per_cft, description, is_active) VALUES
  ('ACACIA', 600, 'Acacia wood with size-based pricing', true),
  ('MANGO', 672, 'Mango wood with size-based pricing', true),
  ('SHEESHAM', 850, 'Sheesham wood with size-based pricing', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = true;

-- Get material IDs
DO $$
DECLARE
  acacia_id uuid;
  mango_id uuid;
  sheesham_id uuid;
BEGIN
  SELECT id INTO acacia_id FROM materials WHERE name = 'ACACIA';
  SELECT id INTO mango_id FROM materials WHERE name = 'MANGO';
  SELECT id INTO sheesham_id FROM materials WHERE name = 'SHEESHAM';

  -- ACACIA PRICING
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

  -- MANGO PRICING
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

  -- SHEESHAM PRICING
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
