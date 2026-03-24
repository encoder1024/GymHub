-- Redefinir la función get_confirmed_gym_bookings_santa_fe para usar UUID
CREATE OR REPLACE FUNCTION "public"."get_confirmed_gym_bookings_santa_fe"("target_gym_id" uuid) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  RETURN (
    SELECT COALESCE(json_agg(booking_row)::jsonb, '[]'::jsonb)
    FROM (
      SELECT json_build_object(
        'id', b.id,
        'status', b.status,
        'created_at', b.created_at,
        'user_id', b.user_id,
        'profiles', (
          SELECT json_build_object('full_name', p.full_name, 'email', p.email)
          FROM profiles p WHERE p.id = b.user_id
        ),
        'classes', (
          SELECT json_build_object(
            'id', c.id, 
            'name', c.name, 
            'start_time', c.start_time, 
            'end_time', c.end_time,
            'gyms', (SELECT json_build_object('id', g.id, 'title', g.title) FROM "gymsSantaFe" g WHERE g.id = c.gym_id)
          )
          FROM classes_santa_fe c WHERE c.id = b.class_id
        )
      ) as booking_row
      FROM bookings_santa_fe b
      JOIN classes_santa_fe c ON b.class_id = c.id
      WHERE c.gym_id = target_gym_id 
        AND b.status = 'confirmada'
      ORDER BY b.created_at DESC
    ) subquery
  );
END;$$;
