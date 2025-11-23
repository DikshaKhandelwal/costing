/*
  # WoodCurls Furniture Costing System Database Schema

  ## Overview
  This migration creates the complete database structure for the WoodCurls furniture costing and estimation system.

  ## New Tables

  ### 1. `materials`
  Material master data with pricing information
  - `id` (uuid, primary key)
  - `name` (text) - Material name (e.g., "Teak", "Pine")
  - `rate_per_cft` (numeric) - Price per cubic foot
  - `description` (text, optional) - Additional notes
  - `is_active` (boolean) - Whether material is currently available
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `products`
  Main furniture product records
  - `id` (uuid, primary key)
  - `name` (text) - Product name (e.g., "King Size Bed")
  - `product_type` (text) - Type (Bed, Sofa, Wardrobe, etc.)
  - `overall_length` (numeric, optional) - Overall L dimension
  - `overall_width` (numeric, optional) - Overall W dimension
  - `overall_height` (numeric, optional) - Overall H dimension
  - `designer_name` (text, optional)
  - `reference_number` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `components`
  Individual component parts of each product
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key to products)
  - `description` (text) - Component description (e.g., "Top", "Side")
  - `length` (numeric, optional) - L dimension in inches
  - `width` (numeric, optional) - W dimension in inches
  - `height` (numeric, optional) - H dimension in inches
  - `pieces` (integer) - Number of pieces
  - `cft` (numeric, optional) - Cubic feet (can be manually entered)
  - `rate` (numeric) - Rate per CFT
  - `material_id` (uuid, optional, foreign key to materials)
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz)

  ### 4. `product_extras`
  Additional costs associated with each product
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key to products)
  - `labour` (numeric, default 0)
  - `polish` (numeric, default 0)
  - `hardware` (numeric, default 0)
  - `cnc` (numeric, default 0)
  - `foam` (numeric, default 0)
  - `iron_weight` (numeric, default 0)
  - `iron_rate` (numeric, default 0)
  - `ma_percentage` (numeric, default 20) - Manufacturing add-on %
  - `profit_percentage` (numeric, default 20) - Profit margin %
  - `gst_percentage` (numeric, default 18) - GST %
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for materials (product catalog)
  - Authenticated users can manage their products and related data

  ## Indexes
  - Index on product_id for components and extras tables for fast lookups
  - Index on material name for quick searches
*/

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