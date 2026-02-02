# **Documento de Especificación de Requerimientos (ERS)**
## **AppGymHub - Enterprise Edition**

| **Proyecto:** | AppGymHub - Membresia universal de gimnasios |
| :--- | :--- |
| **Versión del Documento:** | 1.0 |
| **Fecha de Creación:** | 24 de enero de 2026 |
| **Autor:** | Gemini CLI Agent |
| **Estado:** | Borrador Inicial |

### **Control de Versiones**

| Versión | Fecha | Autor | Descripción de Cambios |
| :--- | :--- | :--- | :--- |
| 1.0 | 24/01/2026 | Gemini CLI Agent | Creación inicial del documento ERS. |

---

### **1. Introducción**

#### **1.1. Propósito**
Este documento define los requerimientos funcionales y no funcionales para la versión 1.0 de **AppGymHub**. Su propósito es servir como la fuente única de verdad para el equipo de desarrollo, gestión de producto y control de calidad (QA). Establece el alcance, las capacidades y las restricciones del sistema para garantizar que el producto final cumpla con los objetivos del negocio y las expectativas de los usuarios, con un enfoque en la seguridad, escalabilidad y auditabilidad.

#### **1.2. Alcance del Proyecto**
AppGymHub será una plataforma web (Software as a Service - SaaS) que conectará a usuarios finales (clientes) con una red de gimnasios y centros de bienestar. Los clientes adquirirán una membresía única en la plataforma que les otorgará acceso a los servicios (clases, uso de instalaciones) ofrecidos por cualquiera de los establecimientos afiliados.

**El sistema permitirá:**
- Registro y gestión de perfiles para clientes y propietarios de gimnasios.
- Procesamiento de pagos para la compra de membresías.
- Búsqueda y visualización de gimnasios y sus servicios.
- Sistema de reservas de clases y servicios.
- Paneles de control para la gestión de los gimnasios y para la administración de la plataforma.

**Fuera del alcance para la v1.0:**
- Aplicaciones móviles nativas (iOS/Android).
- Funcionalidades sociales (seguir amigos, compartir logros).
- Programas de lealtad o recompensas avanzados.
- Integración con wearables o hardware de fitness.

#### **1.3. Definiciones, Acrónimos y Abreviaturas**
- **ERS:** Especificación de Requerimientos de Software.
- **UI/UX:** Interfaz de Usuario / Experiencia de Usuario.
- **SaaS:** Software as a Service (Software como Servicio).
- **Supabase:** Plataforma Backend como Servicio (BaaS).
- **PostgreSQL:** Sistema de gestión de bases de datos relacional.
- **Auth:** Servicio de Autenticación.
- **RLS:** Row-Level Security (Seguridad a Nivel de Fila).
- **API:** Interfaz de Programación de Aplicaciones.
- **QA:** Quality Assurance (Control de Calidad).

#### **1.4. Referencias**
- Documentación oficial de React.
- Documentación oficial de Tachyons.
- Documentación oficial de Supabase (Auth, RLS, PostgreSQL, Edge Functions).

#### **1.5. Vista General del Documento**
Este documento se organiza en tres secciones principales:
- **Sección 2 - Descripción General:** Ofrece una perspectiva del producto, sus usuarios, y las restricciones generales.
- **Sección 3 - Requerimientos Específicos:** Detalla los requerimientos funcionales, de interfaces externas y los no funcionales (rendimiento, seguridad, etc.).

---

### **2. Descripción General**

#### **2.1. Perspectiva del Producto**
AppGymHub es un producto nuevo e independiente que operará como un marketplace de dos lados: por un lado, los gimnasios que buscan aumentar su clientela y optimizar la ocupación de sus clases, y por otro, los clientes que desean flexibilidad y variedad en sus rutinas de bienestar.

#### **2.2. Tipos de Usuarios y Características**

1.  **Cliente (Usuario Final):**
    - **Objetivo:** Acceder a una variedad de gimnasios y clases con una sola membresía.
    - **Características:** Individuos interesados en fitness y bienestar que valoran la flexibilidad. Buscan una experiencia digital sencilla para descubrir y reservar servicios.

2.  **Propietario de Gimnasio (Partner):**
    - **Objetivo:** Listar su establecimiento, gestionar su oferta de servicios/clases y atraer nuevos clientes.
    - **Características:** Dueños o administradores de gimnasios, estudios de yoga, pilates, etc. Buscan una herramienta para aumentar sus ingresos y gestionar la ocupación.

3.  **Administrador de la Plataforma (Admin):**
    - **Objetivo:** Supervisar el funcionamiento de la plataforma, gestionar usuarios y partners, y obtener métricas de negocio.
    - **Características:** Equipo interno de AppGymHub responsable de la operación y el crecimiento de la plataforma.

#### **2.3. Entorno Operativo**
- La aplicación será accesible a través de navegadores web modernos (Chrome, Firefox, Safari, Edge) en dispositivos de escritorio y móviles (diseño responsivo).
- El backend, la base de datos y la autenticación serán gestionados por la infraestructura cloud de **Supabase**.

#### **2.4. Restricciones de Diseño e Implementación**
- **Frontend:** Deberá ser construido utilizando **React** y estilizado con **Tachyons**.
- **Backend y Base de Datos:** Se utilizará exclusivamente **Supabase**, aprovechando:
    - **Base de Datos:** PostgreSQL.
    - **Autenticación:** Supabase Auth para la gestión de identidades.
    - **Seguridad:** **Row-Level Security (RLS)** será implementado de forma rigurosa para garantizar que los usuarios solo puedan acceder y modificar los datos a los que tienen permiso explícito. Esta es una restricción crítica y auditable.
    - **Lógica de Negocio:** Las operaciones complejas del lado del servidor se implementarán mediante **Supabase Edge Functions**.
- **Control de Código Fuente:** Se utilizará un sistema de control de versiones (ej. Git).

---

### **3. Requerimientos Específicos**

#### **3.1. Requerimientos Funcionales (RF)**

##### **RF-AUTH: Módulo de Autenticación y Perfiles**
| ID | Requerimiento | Descripción | Rol de Usuario |
| :--- | :--- | :--- | :--- |
| RF-AUTH-001 | Registro de Cliente | Un nuevo usuario debe poder registrarse en la plataforma usando un correo electrónico y una contraseña. | Público |
| RF-AUTH-002 | Registro de Gimnasio | Un propietario de gimnasio debe poder iniciar un proceso de registro para afiliar su establecimiento. Este registro quedará pendiente de aprobación por un Admin. | Público |
| RF-AUTH-003 | Inicio de Sesión | Los usuarios registrados deben poder iniciar sesión con sus credenciales. | Cliente, Propietario, Admin |
| RF-AUTH-004 | Recuperación de Contraseña | Los usuarios deben poder solicitar un enlace para restablecer su contraseña si la olvidan. | Cliente, Propietario, Admin |
| RF-AUTH-005 | Gestión de Perfil de Cliente| Un cliente debe poder ver y editar su información personal (nombre, foto de perfil). | Cliente |
| RF-AUTH-006 | Gestión de Perfil de Gimnasio | Un propietario debe poder editar la información de su gimnasio (descripción, fotos, ubicación, horarios). | Propietario |

##### **RF-MEM: Módulo de Membresías y Pagos**
| ID | Requerimiento | Descripción | Rol de Usuario |
| :--- | :--- | :--- | :--- |
| RF-MEM-001 | Compra de Membresía | Un cliente debe poder seleccionar un plan de membresía (ej. diario, mensual, anual) y proceder al pago. | Cliente |
| RF-MEM-002 | Integración con Pasarela de Pago | El sistema debe integrarse de forma segura con una pasarela de pago externa (ej. Mercadopago) para procesar las transacciones. AppGymHub no almacenará datos de tarjetas de crédito. | Sistema |
| RF-MEM-003 | Estado de Membresía | El sistema debe reflejar el estado de la membresía de un cliente (activa, caducada, cancelada). | Cliente, Sistema |
| RF-MEM-004 | Gestión de Suscripción | Un cliente debe poder ver la fecha de su próximo cobro y cancelar su suscripción. | Cliente |

##### **RF-GYM: Módulo de Gimnasios y Servicios**
| ID | Requerimiento | Descripción | Rol de Usuario |
| :--- | :--- | :--- | :--- |
| RF-GYM-001 | Búsqueda de Gimnasios | Un cliente debe poder buscar y filtrar gimnasios por nombre, ubicación o tipo de servicio. | Cliente |
| RF-GYM-002 | Vista de Gimnasio | Un cliente debe poder ver la página de perfil de un gimnasio, incluyendo descripción, fotos, servicios ofrecidos, horarios y ubicación en un mapa. | Cliente |
| RF-GYM-003 | Gestión de Clases/Servicios | Un propietario debe poder crear, editar y eliminar las clases o servicios que ofrece, especificando cupos, horarios y descripción. | Propietario |

##### **RF-BOOK: Módulo de Reservas**
| ID | Requerimiento | Descripción | Rol de Usuario |
| :--- | :--- | :--- | :--- |
| RF-BOOK-001 | Realizar Reserva | Un cliente con una membresía activa debe poder reservar un cupo en una clase o servicio disponible. | Cliente |
| RF-BOOK-002 | Límite de Reservas | El sistema debe impedir que se realicen más reservas que los cupos disponibles para una clase. | Sistema |
| RF-BOOK-003 | Ver Mis Reservas | Un cliente debe poder ver un listado de sus próximas reservas y su historial de reservas pasadas. | Cliente |
| RF-BOOK-004 | Cancelar Reserva | Un cliente debe poder cancelar una reserva con una antelación configurable por el gimnasio (ej. 24 horas antes). | Cliente |
| RF-BOOK-005 | Ver Reservas del Gimnasio | Un propietario debe poder ver la lista de asistentes para cada una de sus clases. | Propietario |

##### **RF-ADMIN: Módulo de Administración**
| ID | Requerimiento | Descripción | Rol de Usuario |
| :--- | :--- | :--- | :--- |
| RF-ADMIN-001 | Aprobación de Gimnasios | Un administrador debe poder revisar y aprobar o rechazar las solicitudes de nuevos gimnasios. | Admin |
| RF-ADMIN-002 | Gestión de Usuarios | Un administrador debe poder ver, desactivar o eliminar cuentas de usuarios (clientes y propietarios). | Admin |
| RF-ADMIN-003 | Dashboard Principal | Un administrador debe tener un panel con métricas clave: número de usuarios activos, número de gimnasios, ingresos, etc. | Admin |

#### **3.2. Requerimientos de Interfaz Externa**
- **3.2.1. Interfaces de Usuario (UI):**
    - La interfaz será una aplicación web de una sola página (SPA) desarrollada en React.
    - El diseño será limpio, moderno y responsivo (mobile-first), utilizando el sistema de utilidades de Tachyons.
- **3.2.2. Interfaces de Software (API):**
    - La comunicación con el backend se realizará a través de la API y los SDKs proporcionados por Supabase.
    - Se integrará con la API de una pasarela de pagos (ej. Mercadopago) para el procesamiento de transacciones.
    - Se podría integrar una API de mapas (ej. Mapbox, Google Maps) para mostrar la ubicación de los gimnasios.

#### **3.3. Requerimientos No Funcionales (RNF)**

##### **RNF-PERF: Rendimiento**
| ID | Requerimiento | Descripción |
| :--- | :--- | :--- |
| RNF-PERF-001 | Tiempo de Carga | El tiempo de carga inicial de la aplicación (First Contentful Paint) no debe superar los 1.5 segundos en una conexión de banda ancha estándar. |
| RNF-PERF-002 | Tiempo de Respuesta | Las interacciones del usuario y las respuestas de la API deben sentirse instantáneas, con una latencia inferior a 500ms para el 95% de las solicitudes. |
| RNF-PERF-003 | Concurrencia | La arquitectura de Supabase debe soportar la escalabilidad para manejar un número creciente de usuarios concurrentes sin degradación del servicio. |

##### **RNF-SEC: Seguridad**
| ID | Requerimiento | Descripción |
| :--- | :--- | :--- |
| RNF-SEC-001 | Autenticación Segura | Todas las sesiones de usuario deben ser gestionadas a través de Supabase Auth, utilizando tokens (JWT). |
| RNF-SEC-002 | Autorización a Nivel de Fila | **Crítico para Auditoría:** Se deben definir e implementar políticas de **RLS** en la base de datos PostgreSQL para garantizar que: a) un cliente solo pueda acceder a su propia información y reservas; b) un propietario solo pueda gestionar los datos de su propio gimnasio. |
| RNF-SEC-003 | Comunicación Cifrada | Toda la comunicación entre el cliente y el servidor debe realizarse a través de HTTPS. |
| RNF-SEC-004 | Protección de Datos | No se almacenará información sensible de pagos en la base de datos de AppGymHub. Se delegará 100% a la pasarela de pago certificada (PCI-DSS). |

##### **RNF-ESCL: Escalabilidad**
| ID | Requerimiento | Descripción |
| :--- | :--- | :--- |
| RNF-ESCL-001 | Arquitectura Serverless | El uso de Supabase Edge Functions permite una lógica de backend sin estado que escala automáticamente bajo demanda. |
| RNF-ESCL-002 | Escalabilidad de Base de Datos | La arquitectura de Supabase está diseñada para permitir el escalado de la base de datos PostgreSQL a medida que crecen los datos y la carga de trabajo. |

##### **RNF-AUDIT: Auditabilidad y Logs**
| ID | Requerimiento | Descripción |
| :--- | :--- | :--- |
| RNF-AUDIT-001 | Log de Acciones Críticas | El sistema debe registrar (loggear) todas las acciones críticas, como pagos (realizados, fallidos), cancelaciones de membresía y cambios de rol de usuario. Estos logs deben ser accesibles para los administradores. |
| RNF-AUDIT-002 | Trazabilidad de Reservas | Todas las reservas y cancelaciones deben tener una traza clara de qué usuario las realizó y cuándo. |

##### **RNF-USAB: Usabilidad**
| ID | Requerimiento | Descripción |
| :--- | :--- | :--- |
| RNF-USAB-001 | Diseño Responsivo | La aplicación debe ser completamente funcional y fácil de usar en pantallas de escritorio, tabletas y teléfonos móviles. |
| RNF-USAB-002 | Accesibilidad | La interfaz debe cumplir con las pautas de accesibilidad WCAG 2.1 nivel AA para garantizar el uso por parte de personas con discapacidades. |

##### **RNF-MAINT: Mantenibilidad**
| ID | Requerimiento | Descripción |
| :--- | :--- | :--- |
| RNF-MAINT-001 | Código Modular | El código fuente en React debe estar organizado en componentes reutilizables y bien definidos. |
| RNF-MAINT-002 | Documentación de Código | El código complejo, especialmente las Edge Functions y las políticas RLS, debe estar debidamente comentado para facilitar su mantenimiento futuro. |