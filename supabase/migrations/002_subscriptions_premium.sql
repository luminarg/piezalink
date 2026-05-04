-- ============================================================
-- Migración 002: Agregar plan Premium y ajustar trial a 6 meses
-- ============================================================

-- Agregar 'premium' al enum de planes
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'premium';

-- Actualizar el trigger para dar 6 meses de trial en lugar de 30 días
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (vendor_id, plan, status, expires_at)
  VALUES (NEW.id, 'trial', 'active', NOW() + INTERVAL '6 months');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista auxiliar: vendedores con suscripción activa
CREATE OR REPLACE VIEW public.active_vendors AS
SELECT v.*
FROM public.vendors v
INNER JOIN public.subscriptions s ON s.vendor_id = v.id
WHERE v.is_active = true
  AND s.status = 'active'
  AND s.expires_at > NOW();

-- Índice para acelerar consultas de suscripción
CREATE INDEX IF NOT EXISTS idx_subscriptions_vendor_status
ON public.subscriptions(vendor_id, status, expires_at);
