# BITTU - Management Cloud

Plataforma de gestión centralizada y panel de administración en la nube diseñado para supervisar, controlar y estructurar las operaciones de todo el ecosistema de servicios BITTU (Ecosystem API, Artist Portal y Aplicaciones Móviles). 

Esta solución proporciona una interfaz de alto rendimiento centrada en la eficiencia operativa, la monitorización en tiempo real y la administración segura de datos relacionales y no relacionales.

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Funcionalidades Principales](#funcionalidades-principales)
4. [Flujos de Trabajo y Procesos Clave](#flujos-de-trabajo-y-procesos-clave)
5. [Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [Instalación y Configuración](#instalación-y-configuración)
7. [Variables de Entorno](#variables-de-entorno)
8. [Despliegue](#despliegue)
9. [Mantenimiento y Buenas Prácticas](#mantenimiento-y-buenas-prácticas)

---

## Descripción General

**BITTU Management Cloud** actúa como el núcleo administrativo del ecosistema BITTU. Su propósito es consolidar en un único entorno la gestión de usuarios, el control de activos digitales, la supervisión del consumo de recursos, la distribución de contenido musical/artístico y el seguimiento analítico de la plataforma.

Diseñado bajo estándares modernos de usabilidad, el sistema garantiza un flujo de trabajo intuitivo para administradores, operadores y personal técnico, minimizando la latencia de respuesta y manteniendo un estricto control de acceso basado en roles (RBAC).

---

## Arquitectura del Sistema

La aplicación está estructurada modularmente en el frontend, siguiendo el patrón de diseño orientado a componentes y separación de responsabilidades:

```
bittu-management-cloud/
├── public/                 # Archivos estáticos y manifest de la aplicación
├── src/
│   ├── assets/             # Estilos globales, imágenes y recursos multimedia
│   ├── components/         # Componentes reutilizables de UI (tablas, modales, inputs)
│   ├── context/            # Proveedores de estado global (Autenticación, Tema, Notificaciones)
│   ├── hooks/              # Custom hooks para lógica repartitionada y peticiones
│   ├── layouts/            # Estructuras base para rutas autenticadas y públicas
│   ├── pages/              # Vistas principales de la plataforma
│   ├── services/           # Cliente HTTP, integración con BITTU Ecosystem API
│   ├── utils/              # Formateadores, validadores y constantes
│   ├── App.jsx             # Configuración de rutas y proveedores principales
│   └── main.jsx            # Punto de entrada de la aplicación
├── .env.example            # Plantilla de variables de entorno
├── package.json            # Dependencias y scripts del proyecto
└── vite.config.js          # Configuración del empaquetador Vite
```

---

## Funcionalidades Principales

### 1. Gestión de Autenticación y Seguridad
* **Autenticación Centralizada:** Control de sesión mediante JWT (JSON Web Tokens) gestionados de forma segura.
* **Control de Acceso Basado en Roles (RBAC):** Permisos diferenciados para Superadministradores, Administradores de Contenido y Gestores de Soporte.
* **Protección de Rutas:** Guardias de navegación que restringen el acceso a secciones según el nivel del usuario y el estado de la sesión.

### 2. Panel de Control y Analítica (Dashboard)
* **Métricas en Tiempo Real:** Visualización de KPIs globales (usuarios activos, volumen de datos procesados, transacciones y consumo de API).
* **Gráficos Estadísticos:** Monitorización de rendimiento, uso por regiones y actividad por plataforma cliente (Web y Mobile).

### 3. Administración de Contenido y Catálogo Digital
* **Gestión de Artistas y Perfiles:** Alta, baja, edición y verificación de datos de usuarios y perfiles artísticos dentro de la red BITTU.
* **Control de Catálogo Multimedia:** Carga, organización y categorización de metadatos asociados a pistas de audio, lanzamientos y materiales visuales.
* **Modulación de Estado:** Capacidad de publicar, pausar, archivar o eliminar contenidos del flujo de transmisión directo al usuario final.

### 4. Monitorización de Infraestructura y Servicios
* **Estado de la API:** Supervisión del estado de los endpoints del backend (*BITTU Ecosystem API*).
* **Registro de Auditoría (Audit Logs):** Historial detallado de acciones realizadas por cada administrador para garantizar la trazabilidad de operaciones críticas.

---

## Flujos de Trabajo y Procesos Clave

### Proceso 1: Autenticación e Inicialización de Sesión
```
[ Usuario Administrador ] 
       │
       ▼
1. Ingresa credenciales en Formulario de Login
       │
       ▼
2. Solicitud enviada a BITTU Ecosystem API (/auth/login)
       │
       ▼
3. Validación de Hash de contraseña y entrega de JWT + Permisos
       │
       ▼
4. Almacenamiento seguro del Token + Redirección al Dashboard
```

### Proceso 2: Publicación y Gestión de Activos Digitales
```
[ Panel Administrativo ] ──► Formulario de Registro / Modificación
       │
       ▼
Validación de Formato y Metadatos en Frontend
       │
       ▼
Envío de Carga Util a la API mediante cliente HTTP autenticado
       │
       ▼
Procesamiento de Archivos en la Nube (Cloud Storage Integration)
       │
       ▼
Sincronización con Base de Datos Relacional / No-SQL
       │
       ▼
Actualización Automática de Interfaz y Notificación de Éxito
```

---

## Tecnologías Utilizadas

* **Framework Base:** React.js (Vite como empaquetador de módulos de alta velocidad).
* **Gestión de Estado:** React Context API / Redux Toolkit para control de estados complejas y globales.
* **Rutamiento:** React Router DOM v6 para navegación cliente limpia y SPA.
* **Consumo de API:** Axios con interceptores personalizados para manejo automático de tokens y captura de errores HTTP.
* **Estilos y Maquetación:** Tailwind CSS / Custom CSS Modules para interfaces responsivas, optimizadas y modulares.
* **Control de Calidad:** ESLint y Prettier para consistencia y limpieza de código.

---

## Instalación y Configuración

### Requisitos Previos

Asegúrese de contar con las siguientes herramientas instaladas en su entorno de desarrollo:

* **Node.js:** Versión 18.0.0 o superior.
* **Gestor de paquetes:** `npm` (v9+) o `yarn` (v1.22+).
* Acceso a una instancia activa de **BITTU Ecosystem API**.

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jamesTautiva/BItTU-CLOUD.git
   cd BItTU-CLOUD
   ```

2. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Copie el archivo de entorno base y ajuste las variables según la configuración de su servidor local o de staging:
   ```bash
   cp .env.example .env
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible por defecto en `http://localhost:5173`.

---

## Variables de Entorno

Para el correcto funcionamiento del sistema, configure los siguientes parámetros en su archivo `.env`:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL base del backend BITTU Ecosystem API | `https://api.bittu.com/v1` |
| `VITE_APP_ENV` | Entorno de ejecución (`development`, `staging`, `production`) | `development` |
| `VITE_TIMEOUT_LIMIT` | Tiempo límite de espera para solicitudes HTTP (ms) | `10000` |

---

## Despliegue

Para compilar y preparar el proyecto para un entorno de producción optimizado:

1. **Generar la compilación final:**
   ```bash
   npm run build
   ```
   Este comando creará una carpeta `dist/` con todos los recursos optimizados y minificados.

2. **Previsualizar la compilación localmente (Opcional):**
   ```bash
   npm run preview
   ```

3. **Despliegue en Servicios Cloud:**
   El directorio `dist/` resultante puede ser desplegado de manera directa en servicios de alojamiento estático o CDN como Netlify, Vercel, AWS S3 / CloudFront o servidores Nginx.

---

## Mantenimiento y Buenas Prácticas

* **Estructura Modular:** Mantenga los componentes aislados y reusables dentro del directorio `src/components/`.
* **Manejo de Errores:** Todas las solicitudes a servicios externos deben procesarse a través del cliente configurado en `src/services/` para garantizar la captura centralizada de excepciones.
* **Estándares de Código:** Ejecute `npm run lint` antes de realizar envíos o cambios significativos en las ramas principales.
