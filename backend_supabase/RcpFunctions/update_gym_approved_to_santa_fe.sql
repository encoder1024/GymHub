CREATE OR REPLACE FUNCTION update_gym_approved_to_santa_fe(
    source_gym_id int8,
    target_gym_id int8
)
RETURNS text AS $$
DECLARE
    v_source RECORD;
    v_target RECORD;
    v_exists boolean;
BEGIN
    -- 1. Obtener registro origen
    SELECT * INTO v_source FROM gyms WHERE id = source_gym_id;

    IF v_source IS NULL THEN
        RAISE EXCEPTION 'Error: No se encontró un gimnasio origen con el ID %', source_gym_id;
    END IF;

    -- 2. Obtener registro destino
    SELECT * INTO v_target FROM "gymsSantaFe" WHERE id = target_gym_id;

    IF v_target IS NULL THEN
        RAISE EXCEPTION 'Error: No se encontró un gimnasio destino con el ID % en gymsSantaFe', target_gym_id;
    END IF;

    -- 3. Validar duplicados por nombre y owner (si aplica)
    SELECT EXISTS (
        SELECT 1 FROM "gymsSantaFe"
        WHERE title = v_source.name
          AND owner_id = v_source.owner_id
          AND id <> target_gym_id
    ) INTO v_exists;

    IF v_exists THEN
        RAISE EXCEPTION 'El gimnasio "%" ya existe en gymsSantaFe con el mismo owner.', v_source.name;
    END IF;

    -- 4. UPDATE con los campos equivalentes
    UPDATE "gymsSantaFe"
    SET
        owner_id      = v_source.owner_id,
        title         = v_source.name,
        is_approved   = v_source.is_approved,
        is_deleted    = v_source.is_deleted,
        created_at    = v_source.created_at,
        location      = v_source.location_coords,
        phone         = COALESCE(v_target.phone, 'Sin teléfono'),
        website       = COALESCE(v_target.website, 'https://ejemplo.com'),
        url           = COALESCE(v_target.url, 'https://ejemplo.com'),
        category_name = COALESCE(v_target.category_name, 'Gimnasio'),
        total_score   = v_target.total_score,
        reviews_count = v_target.reviews_count,
        street        = COALESCE(v_target.street, 'Pendiente'),
        city          = COALESCE(v_target.city, 'Santa Fe'),
        state         = COALESCE(v_target.state, 'Santa Fe'),
        country_code  = COALESCE(v_target.country_code, 'AR'),
        phone_status  = COALESCE(v_target.phone_status, false),
        updated_at    = NOW()
    WHERE id = target_gym_id;

    RETURN 'Gimnasio destino actualizado correctamente con datos del gym origen "' 
           || v_source.name || '".';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;