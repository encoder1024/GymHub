-- 0. HABILITAR EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Para IDs seguros
CREATE EXTENSION IF NOT EXISTS "pg_net";     -- Para alertas y llamadas a Edge Functions
CREATE EXTENSION IF NOT EXISTS "pg_cron";    -- Para tareas automáticas (vencimientos)

-- 1. TABLA DE DISPOSITIVOS POINT (Configuración de hardware en local)
CREATE TABLE IF NOT EXISTS gym_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_name TEXT NOT NULL,                  -- Ej: "Caja Principal", "Mostrador Entrada"
  mp_device_id TEXT UNIQUE NOT NULL,          -- El ID que da Mercado Pago al vincular el Point
  status TEXT DEFAULT 'active',               -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. TABLA DE PEDIDOS (Orders)
-- Es el corazón del sistema, vincula al usuario con la intención de compra y datos fiscales.
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),     -- Relación con Supabase Auth
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT DEFAULT 'pending',              -- pending, paid, invoiced, expired, cancelled
  
  -- Datos para AFIP (Requeridos para el CAE)
  customer_doc_type TEXT DEFAULT '99',        -- 80=CUIT, 96=DNI, 99=Consumidor Final
  customer_doc_number TEXT DEFAULT '0',
  customer_name TEXT DEFAULT 'Consumidor Final',
  iva_condition TEXT DEFAULT 'Consumidor Final',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. TABLA DE PAGOS (Payments)
-- Registra transacciones de Mercado Pago (Online o Postnet físico)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  mp_payment_id TEXT UNIQUE,                  -- ID de transacción de MP
  amount DECIMAL(12,2) NOT NULL,
  status TEXT,                                -- approved, rejected, in_process
  payment_type TEXT DEFAULT 'online',         -- 'online' o 'point' (Postnet)
  payment_method_id TEXT,                     -- visa, master, mercadopago, etc.
  device_id TEXT,                             -- ID del Point físico si aplica
  card_last_four TEXT,                        -- Últimos 4 números (Control en local)
  installments INTEGER DEFAULT 1,
  raw_response JSONB,                         -- Todo el JSON de MP por seguridad
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. TABLA DE FACTURACIÓN (Invoices - ARCA/AFIP)
-- Almacena los datos del comprobante legal generado.
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  cae TEXT UNIQUE,                            -- Código de Autorización Electrónico
  cae_vencimiento DATE,
  cbte_tipo INTEGER,                          -- 1=Factura A, 6=Factura B, 11=Factura C
  punto_venta INTEGER,
  cbte_nro INTEGER,
  qr_link TEXT,                               -- URL generada (JSON Base64 de AFIP)
  full_pdf_url TEXT,                          -- Almacenamiento del PDF generado
  
  -- Control de impresión física en el Gimnasio
  is_printed BOOLEAN DEFAULT false,
  printed_at TIMESTAMP WITH TIME ZONE,
  printer_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. TABLA DE LOGS DE COMUNICACIÓN (Audit Trail)
-- "Caja negra" para debugear fallos con MP o AFIP.
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,                     -- 'MERCADOPAGO', 'AFIP', 'PDF_GEN'
  endpoint TEXT,
  request_body JSONB,
  response_body JSONB,
  status_code INTEGER,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. VISTA PARA REPORTES (Dashboard de Ventas)
CREATE OR REPLACE VIEW monthly_sales_report AS
SELECT 
    date_trunc('month', created_at) as month,
    SUM(total_amount) as monthly_total,
    SUM(SUM(total_amount)) OVER (ORDER BY date_trunc('month', created_at)) as cumulative_total
FROM orders
WHERE status IN ('paid', 'invoiced')
GROUP BY 1
ORDER BY 1;