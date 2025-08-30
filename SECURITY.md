# Guía de Seguridad - Plataforma Colombiana

## 📋 Índice
1. [Resumen de Seguridad](#resumen-de-seguridad)
2. [Autenticación y Autorización](#autenticación-y-autorización)
3. [Validación de Datos](#validación-de-datos)
4. [Protección contra Ataques](#protección-contra-ataques)
5. [Logging y Monitoreo](#logging-y-monitoreo)
6. [Configuración Segura](#configuración-segura)
7. [Mejores Prácticas para Desarrolladores](#mejores-prácticas-para-desarrolladores)
8. [Respuesta a Incidentes](#respuesta-a-incidentes)

## 🔒 Resumen de Seguridad

Esta aplicación implementa múltiples capas de seguridad para proteger los datos de los usuarios y la integridad del sistema:

### Características de Seguridad Implementadas:
- ✅ Autenticación robusta con NextAuth.js
- ✅ Validación de entrada con Zod
- ✅ Sanitización de datos con DOMPurify y sanitize-html
- ✅ Rate limiting para prevenir abuso
- ✅ Headers de seguridad HTTP
- ✅ Logging de eventos de seguridad
- ✅ Manejo centralizado de errores
- ✅ Protección CSRF
- ✅ Validación de tipos con TypeScript

## 🔐 Autenticación y Autorización

### Sistema de Autenticación
```typescript
// Configuración segura de NextAuth.js
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
    updateAge: 60 * 60, // Actualización cada hora
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60,
  }
}
```

### Roles de Usuario
- **USER**: Usuario básico con acceso a funcionalidades públicas
- **BUSINESS_OWNER**: Puede crear y gestionar emprendimientos
- **ADMIN**: Acceso completo al sistema

### Protección de Rutas
```typescript
// Middleware automático para rutas protegidas
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/business/create',
  '/business/edit',
  '/admin',
]
```

## ✅ Validación de Datos

### Esquemas de Validación con Zod
```typescript
// Ejemplo: Validación de registro de usuario
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  email: z.string()
    .email('Email inválido')
    .max(255)
    .toLowerCase(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
           'Debe contener mayúscula, minúscula, número y carácter especial')
})
```

### Sanitización de Entrada
```typescript
// Sanitización automática de HTML
const sanitizedContent = InputSanitizer.sanitizeHtml(userInput)

// Sanitización de texto plano
const sanitizedText = InputSanitizer.sanitizeText(userInput)
```

## 🛡️ Protección contra Ataques

### 1. Cross-Site Scripting (XSS)
- Sanitización automática de HTML con `sanitize-html`
- Sanitización de texto con `DOMPurify`
- Headers de seguridad: `X-XSS-Protection`

### 2. SQL Injection
- Uso exclusivo de Prisma ORM con consultas parametrizadas
- Validación de entrada con Zod
- Escape de caracteres especiales

### 3. Cross-Site Request Forgery (CSRF)
- Protección automática con NextAuth.js
- Validación de origen en middleware
- Tokens CSRF para formularios críticos

### 4. Rate Limiting
```typescript
// Configuración de límites por tipo de endpoint
const RATE_LIMITS = {
  api: { max: 100, window: 15 * 60 * 1000 },
  auth: { max: 5, window: 15 * 60 * 1000 },
  search: { max: 50, window: 60 * 1000 },
  upload: { max: 10, window: 60 * 60 * 1000 },
}
```

### 5. Headers de Seguridad
```typescript
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': '...' // CSP completa
}
```

## 📊 Logging y Monitoreo

### Eventos de Seguridad Registrados
1. **Autenticación**
   - Intentos de login exitosos/fallidos
   - Registros de usuarios
   - Cambios de contraseña

2. **Violaciones de Seguridad**
   - Rate limiting excedido
   - Entrada sospechosa detectada
   - Acceso no autorizado
   - Intentos de CSRF/XSS

3. **Acceso a Datos**
   - Lectura/escritura/eliminación de datos
   - Exportación de información
   - Cambios en permisos

### Ejemplo de Log de Seguridad
```typescript
SecurityLogger.logAuthEvent({
  type: 'failed_login',
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: false,
  reason: 'Invalid password'
})
```

## ⚙️ Configuración Segura

### Variables de Entorno Requeridas
```bash
# Seguridad básica
NEXTAUTH_SECRET="clave-super-secreta-minimo-32-caracteres"
JWT_SECRET="otra-clave-secreta-para-jwt"
BCRYPT_ROUNDS="12"

# Rate limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"

# Configuración de aplicación
ALLOWED_ORIGINS="http://localhost:3000,https://tudominio.com"
```

### Configuración de Base de Datos
- Conexiones encriptadas (SSL/TLS)
- Credenciales en variables de entorno
- Backup automático configurado
- Acceso restringido por IP

## 👨‍💻 Mejores Prácticas para Desarrolladores

### 1. Validación de Entrada
```typescript
// ✅ CORRECTO: Siempre validar entrada
const validatedData = businessSchema.parse(requestData)

// ❌ INCORRECTO: Usar datos sin validar
const business = await prisma.business.create({ data: requestData })
```

### 2. Manejo de Errores
```typescript
// ✅ CORRECTO: Usar el manejador centralizado
export default ErrorHandler.asyncHandler(async (req) => {
  const data = await ErrorHandler.validateRequest(req, businessSchema)
  // ... lógica de la API
  return createSuccessResponse(result)
})

// ❌ INCORRECTO: Manejo manual de errores
export default async function handler(req, res) {
  try {
    // ... lógica sin validación
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}
```

### 3. Logging de Seguridad
```typescript
// ✅ CORRECTO: Registrar eventos importantes
SecurityLogger.logDataAccess({
  type: 'delete',
  resource: 'Business',
  userId: user.id,
  success: true
})

// ❌ INCORRECTO: No registrar eventos críticos
await prisma.business.delete({ where: { id } })
```

### 4. Sanitización de Datos
```typescript
// ✅ CORRECTO: Sanitizar antes de almacenar
const sanitizedDescription = InputSanitizer.sanitizeHtml(description)
await prisma.business.create({
  data: { ...data, description: sanitizedDescription }
})

// ❌ INCORRECTO: Almacenar datos sin sanitizar
await prisma.business.create({ data })
```

## 🚨 Respuesta a Incidentes

### Procedimiento de Respuesta
1. **Detección**: Monitoreo automático de logs de seguridad
2. **Evaluación**: Determinar severidad y alcance
3. **Contención**: Bloquear acceso si es necesario
4. **Investigación**: Analizar logs y determinar causa
5. **Recuperación**: Restaurar servicios de forma segura
6. **Documentación**: Registrar incidente y lecciones aprendidas

### Contactos de Emergencia
- **Administrador del Sistema**: admin@plataformacolombia.co
- **Equipo de Seguridad**: security@plataformacolombia.co
- **Soporte Técnico**: support@plataformacolombia.co

### Niveles de Severidad
- **CRÍTICO**: Compromiso de datos, acceso no autorizado masivo
- **ALTO**: Intentos de ataque exitosos, vulnerabilidades explotadas
- **MEDIO**: Rate limiting excedido, patrones sospechosos
- **BAJO**: Intentos de login fallidos, errores de validación

## 📚 Recursos Adicionales

### Documentación de Referencia
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)

### Herramientas de Seguridad
- **Análisis estático**: ESLint con reglas de seguridad
- **Dependencias**: npm audit, Snyk
- **Headers**: securityheaders.com
- **Penetration testing**: OWASP ZAP

---

## ⚠️ Importante

Esta documentación debe mantenerse actualizada con cada cambio en las medidas de seguridad. Todos los desarrolladores deben revisar y seguir estas pautas antes de contribuir al proyecto.

**Última actualización**: Agosto 2024
**Versión**: 1.0.0
