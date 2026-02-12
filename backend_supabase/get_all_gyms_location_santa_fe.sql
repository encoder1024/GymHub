create or replace function get_all_gyms_location_santa_fe()
returns table (
  id int8,            -- Ajustar a 'int8' si tu ID es numérico
  title text,
  category_name text,
  phone text,
  longitud double precision,
  latitud double precision
) 
language plpgsql
as $$
begin
  return query
  select 
    g.id, 
    g.title, 
    g.category_name, 
    g.phone, 
    st_x(g.location::geometry),
    st_y(g.location::geometry)
  from "gymsSantaFe" g
  where g.location is not null;
end;
$$;
