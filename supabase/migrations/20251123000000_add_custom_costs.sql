/*
  # Add Custom Costs Support
  
  This migration adds support for custom/additional cost items per product.
  Users can add unlimited custom cost line items (e.g., Delivery, Packaging, Installation).
  
  ## New Table: product_custom_costs
  - Links to products table
  - Stores label (description) and amount for each custom cost
*/

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
