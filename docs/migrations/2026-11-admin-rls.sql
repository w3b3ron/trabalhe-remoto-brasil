-- ============================================================
-- TrabalheRemotoBrasil.com - Políticas RLS para Área Admin
-- Permite que usuários autenticados gerenciem cursos e produtos
-- ============================================================

-- COURSES POLICIES
DROP POLICY IF EXISTS "Allow authenticated insert to courses" ON public.courses;
CREATE POLICY "Allow authenticated insert to courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update to courses" ON public.courses;
CREATE POLICY "Allow authenticated update to courses" ON public.courses
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete to courses" ON public.courses;
CREATE POLICY "Allow authenticated delete to courses" ON public.courses
  FOR DELETE TO authenticated USING (true);

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Allow authenticated insert to products" ON public.products;
CREATE POLICY "Allow authenticated insert to products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update to products" ON public.products;
CREATE POLICY "Allow authenticated update to products" ON public.products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete to products" ON public.products;
CREATE POLICY "Allow authenticated delete to products" ON public.products
  FOR DELETE TO authenticated USING (true);
