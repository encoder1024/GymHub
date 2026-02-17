# Documento de Especificación de Requerimientos (ERS) - Proyecto PerPel
**Versión: 1.0**
**Fecha: 2024-05-21**

## 1. Introducción

### 1.1. Propósito del Documento
El propósito de este documento es definir los requerimientos funcionales y no funcionales para el desarrollo de la aplicación frontend del proyecto "PerPel". Este ERS servirá como la fuente de verdad para el equipo de desarrollo, estableciendo un entendimiento común de lo que se debe construir.

### 1.2. Alcance del Proyecto
El proyecto consiste en una aplicación web progresiva (PWA) de tipo Single-Page Application (SPA) para la gestión integral de múltiples negocios (peluquerías y perfumerías) bajo un modelo multi-tenant por cuenta. La aplicación permitirá a los dueños (`OWNER`) y su personal (`EMPLOYEE`) gestionar inventario, ventas, turnos, facturación y reportes, con soporte para operaciones offline y garantizando la trazabilidad de las acciones bajo los principios de la norma ISO 9000.

### 1.3. Definiciones, Acrónimos y Abreviaturas
*   **ERS:** Especificación de Requerimientos de Software.
*   **PWA:** Progressive Web App. Una aplicación web que ofrece una experiencia similar a una app nativa.
*   **SPA:** Single-Page Application. Una aplicación que carga una única página HTML y actualiza dinámicamente el contenido.
*   **API:** Application Programming Interface.
*   **BaaS:** Backend as a Service (ej. Supabase).
*   **RLS:** Row Level Security.
*   **KPI:** Key Performance Indicator. Indicador Clave de Rendimiento.

## 2. Descripción General

### 2.1. Perspectiva del Producto
PerPel es una solución de software como servicio (SaaS) diseñada para centralizar la gestión de múltiples locales comerciales. Su arquitectura headless, con un frontend SPA/PWA y un backend robusto en Supabase, garantiza una experiencia de usuario rápida, resiliente y accesible desde cualquier dispositivo (desktop o móvil Android).

### 2.2. Funcionalidades Principales
*   Gestión Multi-Cuenta y Multi-Negocio.
*   Dashboard de KPIs con vistas consolidadas e individuales.
*   Gestión de Inventario (productos y servicios).
*   Gestión de Stock por local.
*   Punto de Venta (POS) y E-commerce con procesamiento de pagos.
*   Gestión de Turnos online.
*   Generación de Facturas.
*   Gestión de Roles y Empleados.
*   Capacidad de operación Offline.

### 2.3. Perfiles de Usuario (Roles)
Los roles de usuario están definidos en la base de datos y determinarán los permisos en el frontend:
*   **OWNER:** Dueño de una cuenta. Tiene control total sobre todos sus negocios, empleados, reportes y configuración.
*   **ADMIN:** Rol administrativo con permisos similares al OWNER, pero que puede ser asignado por este.
*   **EMPLOYEE:** Personal de un negocio. Sus permisos están restringidos a los negocios a los que ha sido asignado. Puede gestionar ventas, stock y turnos.
*   **AUDITOR:** Rol de solo lectura para supervisar registros financieros y de auditoría.
*   **DEVELOPER:** Acceso total para fines de desarrollo y depuración.
*   **CLIENT:** (No es un rol de app, sino un usuario autenticado) Cliente final que puede registrarse, sacar turnos y realizar compras.

### 2.4. Restricciones Generales
*   El frontend debe ser una SPA construida con React y Vite.
*   La aplicación debe cumplir con los criterios para ser una PWA instalable.
*   La interfaz debe ser responsive y usable tanto en navegadores de escritorio como en dispositivos móviles. Mobile first.
*   Debe implementarse una estrategia de "offline-first" para garantizar la continuidad de las operaciones.

## 3. Requerimientos Específicos

### 3.1. Arquitectura y Stack Frontend

*   **Framework Principal:** **React 18+**
*   **Build Tool:** **Vite**
*   **Lenguaje:** **Javascript** (Recomendado para un proyecto de esta escala)
*   **UI / Estilos:** La especificación menciona "Thaycons". Se recomienda adoptar una librería de componentes robusta como **MUI (Material-UI)** o **Ant Design** que proveen componentes complejos (tablas, modales, formularios) ideales para un ERP.
*   **Gestión de Estado:** **Zustand**. Es una solución ligera y potente para gestionar el estado global (ej. datos del usuario autenticado, cuenta y negocio seleccionado).
*   **Routing:** **React Router**.
*   **Peticiones a APIs:** **Axios** o el `fetch` nativo para comunicarse con las Edge Functions de Supabase.

### 3.2. Integración de APIs Externas

#### 3.2.1. Supabase (Backend principal)
*   **Librería Recomendada:** `@supabase/supabase-js`
*   **Uso:**
    *   **Autenticación:** Gestionar el registro, login (email/contraseña, proveedores OAuth) y la sesión del usuario.
    *   **Acceso a Datos:** Realizar consultas a las tablas (`core.*`) y vistas (`reports.*`) utilizando el cliente de PostgREST. El RLS configurado en la base de datos garantizará la seguridad de los datos.
    *   **Funciones Edge:** Invocar funciones serverless para lógica de negocio segura que no debe exponerse en el cliente (ej. crear preferencia de pago).

#### 3.2.2. MercadoPago (Procesador de Pagos)
*   **Librería Recomendada:** `@mercadopago/sdk-react`
*   **Flujo de Pago:**
    1.  El frontend crea un registro en `core.orders` con el estado `PENDING`.
    2.  Invoca una Supabase Edge Function enviando el `order_id`.
    3.  La Edge Function se comunica con la API de MercadoPago para crear una "Preferencia de Pago" y almacena el `preference_id` devuelto en la tabla `core.orders`.
    4.  El frontend recibe el `preference_id` y utiliza el componente `CardPayment` (Checkout Bricks) de la librería de React para renderizar el formulario de pago de forma segura.
    5.  Webhooks de MercadoPago notificarán a otra Edge Function para actualizar el estado del pago y la orden a `PAID`.

#### 3.2.3. Cal.com (Gestión de Turnos)
*   **Librería Recomendada:** No se requiere una librería específica. Se puede usar `<iframe>` o un componente web para embeber.
*   **Flujo de Turnos:**
    1.  El frontend embeberá la página de agendamiento de Cal.com del profesional o negocio correspondiente.
    2.  El cliente reserva su turno directamente en la interfaz de Cal.com.
    3.  Un **Webhook** configurado en Cal.com deberá apuntar a una Supabase Edge Function.
    4.  Cuando un turno se crea, reagenda o cancela, la Edge Function recibe la notificación y sincroniza la información en la tabla `core.appointments`, guardando el `external_cal_id`.

#### 3.2.4. OneSignal (Notificaciones Push)
*   **Librería Recomendada:** `react-onesignal` o el SDK web oficial.
*   **Flujo de Notificaciones:**
    1.  El frontend (PWA) solicitará al usuario permiso para recibir notificaciones.
    2.  Al aceptar, el SDK de OneSignal registrará al usuario y asociará su `player_id` con el `user_id` de la aplicación en la base de datos.
    3.  Para enviar notificaciones (ej. "Tu turno es en una hora"), una Supabase Edge Function (invocada por un trigger o un cron job) llamará a la API REST de OneSignal, dirigiéndose al `player_id` del usuario.

#### 3.2.5. API de Facturación (Genérica)
*   **Librería Recomendada:** `axios` o `fetch`.
*   **Flujo de Facturación:**
    1.  Un trigger en la base de datos (o una Edge Function) se activará cuando una orden en `core.orders` cambie su estado a `PAID`.
    2.  Esta función recopilará los datos de la orden y del cliente.
    3.  Llamará al endpoint correspondiente de la API de facturación externa para generar el comprobante.
    4.  El resultado (CAE, número de factura, PDF URL) se almacenará en la tabla `core.invoices`.

### 3.3. Requerimientos No Funcionales

#### 3.3.1. PWA y Continuidad de Operaciones (Offline-First)
*   **Service Worker:** Se debe implementar un Service Worker para cachear los assets de la aplicación (app shell). Se recomienda usar `vite-plugin-pwa` para automatizar este proceso.
*   **Almacenamiento Local:** Se utilizará **Dexie.js** (un wrapper sobre IndexedDB) para almacenar localmente datos críticos para la operación offline (ej. lista de productos, precios, clientes).
*   **Sincronización:**
    1.  Cuando la app esté offline, las mutaciones (crear una venta, actualizar stock) no se envían al servidor. En su lugar, se guardan en una cola local en IndexedDB.
    2.  Cuando la conexión se recupera, un proceso de sincronización lee la cola local y envía las operaciones a Supabase una por una, posiblemente a través de una Edge Function que gestione la lógica.
    3.  La tabla `core.offline_sync_queue` en el backend puede servir como registro y para manejar conflictos si es necesario.

#### 3.3.2. Trazabilidad y Normas ISO 9000
El frontend debe garantizar que **toda petición a la API de Supabase esté autenticada**. El cliente `@supabase/supabase-js` gestiona automáticamente el envío del JWT (JSON Web Token) del usuario logueado. Este token permite al backend:
1.  Identificar al usuario a través de `auth.uid()`.
2.  Aplicar las políticas de RLS correspondientes a su rol.
3.  Registrar en la tabla `logs.audit_log`, a través de los triggers, qué usuario (`user_id`) realizó qué acción (`action`), sobre qué registro (`record_id`) y en qué momento (`timestamp`).

Esto crea un rastro de auditoría completo para cada acción de escritura en la base de datos, cumpliendo con el principio de trazabilidad.

## 4. Apéndice: Diccionario de Datos (ENUMS)

A continuación se detalla el significado de cada opción en los `ENUMS` definidos en la base de datos.

*   **`public.app_role`**: Rol de un usuario dentro de la aplicación.
    *   `OWNER`: Dueño de la cuenta (tenant), máximo nivel de permiso.
    *   `ADMIN`: Administrador de la cuenta, con permisos delegados por el OWNER.
    *   `EMPLOYEE`: Empleado asignado a uno o más negocios.
    *   `AUDITOR`: Rol de solo lectura para supervisión.
    *   `DEVELOPER`: Acceso total para desarrollo.

*   **`public.business_type`**: Tipo de negocio.
    *   `SALON`: Peluquería.
    *   `PERFUMERY`: Perfumería.

*   **`public.item_type`**: Tipo de ítem en el inventario.
    *   `PRODUCT`: Un bien físico con stock (ej. un perfume).
    *   `SERVICE`: Un servicio que no tiene stock (ej. un corte de pelo).

*   **`public.order_status`**: Estado de una orden de compra.
    *   `PENDING`: La orden fue creada pero no pagada.
    *   `PAID`: La orden fue pagada exitosamente.
    *   `ABANDONED`: El cliente abandonó el checkout.
    *   `ERROR`: Ocurrió un error durante el proceso de pago.

*   **`public.appointment_status`**: Estado de un turno, combinando estados de Cal.com y estados internos.
    *   `SCHEDULED` / `ACCEPTED`: El turno está confirmado.
    *   `COMPLETED`: El servicio del turno fue prestado.
    *   `CANCELLED`: El turno fue cancelado.
    *   `NO_SHOW`: El cliente no se presentó al turno.
    *   `PENDING` / `AWAITING_HOST`: El turno está pendiente de confirmación.
    *   `REJECTED`: El turno fue rechazado.
    
*   **`public.item_status`**: Estado de un producto o servicio en el catálogo.
    *   `ACTIVE`: Visible y disponible para la venta o agendamiento.
    *   `INACTIVE`: Oculto de la vista pública pero no eliminado.
    *   `DISCONTINUE`: Producto o servicio que ya no se ofrecerá.

*   **`public.customer_doc_type`**: Códigos de AFIP para tipo de documento del cliente en una factura.
    *   `80`: CUIT.
    *   `96`: DNI.
    *   `99`: Consumidor Final.

*   **`public.cbte_tipo`**: Códigos de AFIP para tipo de comprobante.
    *   `1`: Factura A.
    *   `6`: Factura B.
    *   `11`: Factura C.
