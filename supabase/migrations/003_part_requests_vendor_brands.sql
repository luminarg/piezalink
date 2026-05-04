-- ============================================================
-- Migración 003: Solicitudes de compradores + marcas por vendedor
-- ============================================================

-- Solicitudes de compradores ("busco pieza")
CREATE TABLE IF NOT EXISTS public.part_requests (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_name    text NOT NULL,
  buyer_email   text NOT NULL,
  buyer_phone   text NOT NULL,
  brand         text NOT NULL,
  model         text NOT NULL,
  year          integer,
  chassis       text,
  part_number   text,
  description   text NOT NULL,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_part_requests_brand ON public.part_requests(brand);
CREATE INDEX IF NOT EXISTS idx_part_requests_status ON public.part_requests(status);

-- RLS: cualquiera puede insertar, solo vendedores Premium leen (se filtra en app)
ALTER TABLE public.part_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requests_public_insert" ON public.part_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "requests_authenticated_read" ON public.part_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Marcas por vendedor
CREATE TABLE IF NOT EXISTS public.vendor_brands (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id   uuid REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  brand       text NOT NULL, -- 'ALL' o nombre específico
  created_at  timestamptz DEFAULT now(),
  UNIQUE(vendor_id, brand)
);

ALTER TABLE public.vendor_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_brands_public_read" ON public.vendor_brands
  FOR SELECT USING (true);

CREATE POLICY "vendor_brands_owner_all" ON public.vendor_brands
  FOR ALL USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );
