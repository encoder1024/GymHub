-- 1. Borramos la función existente (incluyendo el tipo de parámetro)
DROP FUNCTION IF EXISTS get_gyms_by_owner_santa_fe(uuid);

-- 2. Creamos la nueva versión con el esquema completo de la imagen
CREATE OR REPLACE FUNCTION get_gyms_by_owner_santa_fe(owner_id_input uuid)
RETURNS TABLE (
  id int8,
  title text,
  total_score numeric,
  reviews_count int4,
  street text,
  city text,
  state text,
  country_code varchar,
  website text,
  phone text,
  url text,
  category_name text,
  location geography,
  created_at timestamptz,
  updated_at timestamptz,
  phone_status bool,
  owner_id uuid,
  is_approved bool,
  is_deleted bool,
  lat float8,
  lng float8
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.title,
    g.total_score,
    g.reviews_count,
    g.street,
    g.city,
    g.state,
    g.country_code,
    g.website,
    g.phone,
    g.url,
    g.category_name,
    g.location,
    g.created_at,
    g.updated_at,
    g.phone_status,
    g.owner_id,
    g.is_approved,
    g.is_deleted,
    ST_Y(g.location::geometry) AS lat,
    ST_X(g.location::geometry) AS lng
  FROM "gymsSantaFe" g
  WHERE g.owner_id = owner_id_input;
END;
$$;
