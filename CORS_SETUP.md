# Configuración CORS para BITU API

## Problema
El error CORS ocurre cuando el frontend (localhost:5173) intenta hacer peticiones a la API (bitu-api.onrender.com) sin la configuración adecuada en el servidor.

## Solución Implementada (Desarrollo)
Se ha configurado un proxy en `vite.config.js` que redirige las peticiones `/api` a la API de producción, evitando CORS durante el desarrollo.

- **Desarrollo**: Usa `/api` (proxy de Vite)
- **Producción**: Usa `https://bitu-api.onrender.com/api` (directo)

## Configuración Requerida en Backend

Para que la API funcione correctamente en producción sin CORS, el backend debe tener configurado:

### Express.js
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tu-frontend-production.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Opciones importantes:
- `origin`: Dominios permitidos (en producción, tu dominio real)
- `credentials`: true si usas cookies o headers de autenticación
- `methods`: Métodos HTTP permitidos
- `allowedHeaders`: Headers permitidos (especialmente Authorization para JWT)

## Verificación
Para verificar que CORS está configurado correctamente, revisa los headers de respuesta:
```
Access-Control-Allow-Origin: https://tu-dominio.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Pasos para reiniciar
Después de estos cambios, reinicia el servidor de desarrollo:
```bash
npm run dev
```
