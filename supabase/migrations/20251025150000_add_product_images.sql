-- Add image_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment
COMMENT ON COLUMN products.image_url IS 'URL or base64 encoded image of the product';
