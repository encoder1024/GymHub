/*18/02/2026: rev00:  creada luego de cambira los id de las trestablas principales a uuid*/

DROP FUNCTION search_gyms_autocomplete(text);

CREATE OR REPLACE FUNCTION search_gyms_autocomplete(search_term TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id, 
    g.title
  FROM "gymsSantaFe" g
  WHERE 
    g.title ILIKE '%' || search_term || '%' -- Coincidencia parcial sin importar mayúsculas
  ORDER BY 
    g.title ASC
  LIMIT 10; -- Limitar para que el dropdown no explote
END;
$$;