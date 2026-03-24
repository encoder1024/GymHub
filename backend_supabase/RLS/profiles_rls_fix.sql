-- Objetivo: Mejorar la seguridad de la tabla 'profiles'.
-- Actualmente, la política de SELECT permite a cualquier usuario ver todos los perfiles.
-- Esta actualización restringe el acceso para que los usuarios solo puedan ver su propio perfil,
-- mientras que los administradores conservan el acceso total.

-- 1. Eliminar la política de selección permisiva existente en 'profiles'.
DROP POLICY IF EXISTS "Los perfiles publicos son visibles por todos." ON public.profiles;

-- 2. Crear una nueva política de selección que solo permite a los usuarios ver su propio perfil.
-- La función auth.uid() devuelve el ID del usuario actualmente autenticado.
-- Esta política asegura que un usuario solo pueda consultar la fila de la tabla 'profiles' que coincide con su propio ID.
CREATE POLICY "Los usuarios solo pueden ver su propio perfil."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- NOTA: La política que otorga acceso total a los administradores ("Los administradores tienen acceso total a los perfiles.")
-- ya existe y funcionará en conjunto con esta. Un usuario que sea 'admin' pasará la condición de esa política
-- y podrá ver todos los perfiles. Un usuario normal no pasará la política de admin, pero pasará esta nueva
-- política solo para la fila que le pertenece.
