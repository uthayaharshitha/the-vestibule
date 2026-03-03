-- Add box_color column to contributions table
-- This allows users to customize the background color of their contribution boxes

ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS box_color TEXT DEFAULT '#F5F5F5';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'contributions' AND column_name = 'box_color';
