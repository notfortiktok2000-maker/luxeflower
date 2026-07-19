-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    barcode TEXT UNIQUE,
    category TEXT,
    supplier TEXT,
    purchase_price NUMERIC,
    selling_price NUMERIC,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT,
    type TEXT CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_name TEXT
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
    total_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT,
    quantity INTEGER,
    price NUMERIC
);

-- Activer Row Level Security (RLS) mais autoriser l'accès pour l'instant (à configurer plus tard pour plus de sécurité)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to perform all actions on products" ON products;
CREATE POLICY "Allow authenticated users to perform all actions on products" ON products FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to perform all actions on stock_movements" ON stock_movements;
CREATE POLICY "Allow authenticated users to perform all actions on stock_movements" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to perform all actions on orders" ON orders;
CREATE POLICY "Allow authenticated users to perform all actions on orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to perform all actions on order_items" ON order_items;
CREATE POLICY "Allow authenticated users to perform all actions on order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- Activer Realtime pour les tables (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'stock_movements') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
