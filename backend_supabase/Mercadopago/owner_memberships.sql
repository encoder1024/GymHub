-- Crear la tabla de membresías vinculada a Profiles
CREATE TABLE owner_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con la tabla profiles (que a su vez escala a auth.users)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Relación única con la orden para evitar duplicados
  order_id UUID NOT NULL REFERENCES orders(id) UNIQUE, 
  
  membership_type_id int8, 
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE owner_memberships ENABLE ROW LEVEL SECURITY;

-- Política de seguridad: El usuario solo ve sus propias membresías
CREATE POLICY "Users can view own membership" 
ON owner_memberships FOR SELECT 
USING (auth.uid() = user_id);

-- Índice para mejorar la velocidad de búsqueda por usuario
CREATE INDEX idx_memberships_user_id ON owner_memberships(user_id);