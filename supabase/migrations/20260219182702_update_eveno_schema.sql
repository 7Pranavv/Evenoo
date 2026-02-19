
/*
  # Update Eveno schema for new Supabase instance
  Adds icon column to categories and re-seeds data.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE categories ADD COLUMN icon text DEFAULT NULL;
  END IF;
END $$;

INSERT INTO categories (id, name, icon) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Music', 'music'),
  ('a1000000-0000-0000-0000-000000000002', 'Sports', 'trophy'),
  ('a1000000-0000-0000-0000-000000000003', 'Technology', 'cpu'),
  ('a1000000-0000-0000-0000-000000000004', 'Food', 'utensils'),
  ('a1000000-0000-0000-0000-000000000005', 'Art', 'palette'),
  ('a1000000-0000-0000-0000-000000000006', 'Networking', 'users'),
  ('a1000000-0000-0000-0000-000000000007', 'Gaming', 'gamepad-2'),
  ('a1000000-0000-0000-0000-000000000008', 'Health', 'heart'),
  ('a1000000-0000-0000-0000-000000000009', 'Cultural', 'globe'),
  ('a1000000-0000-0000-0000-000000000010', 'Literary', 'book-open')
ON CONFLICT (id) DO UPDATE SET icon = EXCLUDED.icon;
