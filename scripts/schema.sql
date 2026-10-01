-- Schema for Supabase PostgreSQL
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id text REFERENCES trips(trip_id) ON DELETE CASCADE,
  order_code text NOT NULL,
  recipient_name text,
  phone text,
  address text,
  cod_amount bigint,
  actual_collected bigint,
  payment_status text DEFAULT 'UNPAID',
  delivery_status text DEFAULT 'PENDING',
  shipping_fee_payer text DEFAULT 'SENDER',
  shipping_fee_status text DEFAULT 'UNPAID',
  sequence integer,
  signature_image text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, order_code)
);

-- Function and trigger to auto-update updated_at on orders
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_modtime 
BEFORE UPDATE ON orders 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
