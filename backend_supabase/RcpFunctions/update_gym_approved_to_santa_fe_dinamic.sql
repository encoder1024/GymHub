CREATE OR REPLACE FUNCTION update_gym_dynamic_to_santa_fe(
    source_gym_id int8,
    target_gym_id int8
)
RETURNS json AS $$
DECLARE
    v_source RECORD;
    v_target RECORD;

    -- Columnas reales de cada tabla
    v_cols_source text[];
    v_cols_target text[];

    -- Columnas finales a actualizar
    v_shared_cols text[];

    -- SQL dinámico
    v_sql text;

    -- Mapeos manuales entre columnas con nombres distintos
    v_map jsonb := jsonb_build_object(
        'name', 'title',
        'location_coords', 'location'
    );

    v_col_source text;
    v_col_target text;
BEGIN
    ----------------------------------------------------------------------
    -- 1. Obtener registros origen y destino
    ----------------------------------------------------------------------
    SELECT * INTO v_source FROM gyms WHERE id = source_gym_id;
    IF v_source IS NULL THEN
        RAISE EXCEPTION 'No existe gym origen con ID %', source_gym_id;
    END IF;

    SELECT * INTO v_target FROM "gymsSantaFe" WHERE id = target_gym_id;
    IF v_target IS NULL THEN
        RAISE EXCEPTION 'No existe gym destino con ID % en gymsSantaFe', target_gym_id;
    END IF;

    ----------------------------------------------------------------------
    -- 2. Obtener columnas de ambas tablas
    ----------------------------------------------------------------------
    SELECT array_agg(column_name)
    INTO v_cols_source
    FROM information_schema.columns
    WHERE table_name = 'gyms';

    SELECT array_agg(column_name)
    INTO v_cols_target
    FROM information_schema.columns
    WHERE table_name = 'gymsSantaFe';

    ----------------------------------------------------------------------
    -- 3. Detectar columnas compartidas (incluyendo mapeos)
    ----------------------------------------------------------------------
    v_shared_cols := ARRAY[]::text[];

    FOREACH v_col_source IN ARRAY v_cols_source LOOP
        -- Si la columna existe igual en destino
        IF v_col_source = ANY(v_cols_target) THEN
            v_shared_cols := array_append(v_shared_cols, v_col_source);
        END IF;

        -- Si existe un mapeo manual
        IF v_map ? v_col_source THEN
            v_col_target := v_map ->> v_col_source;

            IF v_col_target = ANY(v_cols_target) THEN
                v_shared_cols := array_append(v_shared_cols, v_col_source);
            END IF;
        END IF;
    END LOOP;

    ----------------------------------------------------------------------
    -- 4. Construir SQL dinámico del UPDATE
    ----------------------------------------------------------------------
    v_sql := 'UPDATE "gymsSantaFe" SET ';

    v_sql := v_sql || (
        SELECT string_agg(
            CASE
                WHEN v_map ? col THEN
                    format('%I = $1.%I', (v_map ->> col), col)
                ELSE
                    format('%I = $1.%I', col, col)
            END,
            ', '
        )
        FROM unnest(v_shared_cols) AS col
    );

    -- updated_at siempre se actualiza
    v_sql := v_sql || ', updated_at = NOW() WHERE id = $2';

    ----------------------------------------------------------------------
    -- 5. Ejecutar UPDATE
    ----------------------------------------------------------------------
    EXECUTE v_sql USING v_source, target_gym_id;

    ----------------------------------------------------------------------
    -- 6. Retornar resultado
    ----------------------------------------------------------------------
    RETURN json_build_object(
        'status', 'success',
        'message', 'Gym actualizado dinámicamente',
        'source_id', source_gym_id,
        'target_id', target_gym_id,
        'updated_columns', v_shared_cols
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;