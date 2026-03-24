-- 1. Añadir el constraint UNIQUE para evitar reservas duplicadas en Santa Fe
ALTER TABLE "public"."bookings_santa_fe" 
ADD CONSTRAINT "unique_booking_santa_fe" UNIQUE ("user_id", "class_id");

-- 2. Corregir el valor por defecto del status si es necesario (vimos 'confirmadacancelada' antes)
ALTER TABLE "public"."bookings_santa_fe" 
ALTER COLUMN "status" SET DEFAULT 'confirmada';

-- 3. (Opcional) Asegurarse de que las funciones de capacidad manejen bien el tipo UUID si hubo cambios
-- Las funciones ya parecen usar los nombres de columna correctos.
