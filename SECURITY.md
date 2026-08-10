# Guía de Seguridad — Latin Territory

> Este documento describe las medidas de seguridad **realmente implementadas** en el
> código, con referencias a los módulos donde viven. Manténlo sincronizado con cada
> cambio de seguridad.

## 📋 Índice
1. [Resumen de Seguridad](#-resumen-de-seguridad)
2. [Autenticación y Autorización](#-autenticación-y-autorización)
3. [Validación de Datos](#-validación-de-datos)
4. [Protección contra Ataques](#-protección-contra-ataques)
5. [Headers de Seguridad](#-headers-de-seguridad)
6. [Logging y Monitoreo](#-logging-y-monitoreo)
7. [Configuración Segura](#-configuración-segura)
8. [Mejores Prácticas para Desarrolladores](#-mejores-prácticas-para-desarrolladores)
9. [Brechas conocidas (backlog)](#️-brechas-conocidas-backlog)
10. [Reporte de Vulnerabilidades](#-reporte-de-vulnerabilidades)

## 🔒 Resumen de Seguridad

### Características implementadas
- ✅ Autenticación web con NextAuth.js (JWT, sesión 24 h) + OAuth Google/Apple
- ✅ Autenticación mobile con JWT propio de vida corta + refresh tokens rotativos
- ✅ Hashing de contraseñas con **bcrypt** (`src/lib/password-security.ts`)
- ✅ Validación de entrada con **Zod** en los boundaries (`src/lib/validations.ts`)
- ✅ Headers de seguridad HTTP + CSP estricta (`next.config.ts`)
- ✅ Protección de rutas por rol y dominio corporativo (`src/middleware.ts`)
- ✅ Prisma ORM con consultas parametrizadas (sin SQL crudo con entrada de usuario)
- ✅ Logging de eventos de seguridad sin PII sensible (`src/lib/logger.ts`)
- ✅ Manejo centralizado de errores (`src/lib/error-handler.ts`) — sin stack traces al cliente
- ✅ Tipado estricto con TypeScript (sin `any`)

## 🔐 Autenticación y Autorización

### Web — NextAuth.js (`src/lib/auth.ts`)
- Estrategia **JWT** con `maxAge` de 24 horas.
- Re-validación de frescura del token contra la BD (ventana de 1 hora): cambios de
  rol o perfil se reflejan sin esperar a que expire la sesión.
- Providers: credenciales (email + contraseña), **Google** y **Apple** OAuth.
- Contraseñas con **bcryptjs**: `BCRYPT_ROUNDS` configurable (10–15, default 12),
  validado en `src/lib/password-security.ts`.
- Cookies del flujo OAuth (`pkce.code_verifier`, `state`, `nonce`) con
  `httpOnly`, `secure` y `SameSite=None` — requerido por el `form_post` de Apple.
  La cookie de **sesión** conserva el `SameSite=Lax` por defecto de NextAuth.

### Mobile — JWT propio (`src/lib/mobile-jwt.ts`)
- **Access token** JWT de 15 minutos (`issuer: latinterritory`, `audience: mobile`),
  firmado con `JWT_SECRET`.
- **Refresh token opaco** (64 bytes aleatorios, no es un JWT): se almacena **solo su
  hash SHA-256** en la BD, con rotación por familias de tokens y vida de 30 días.
- Endpoints móviles: login con credenciales, Google (`google-auth-library`) y Apple
  (`apple-signin-auth`).
- `src/lib/get-auth-user.ts` unifica ambas vías: cookie de sesión (web) o header
  `Authorization: Bearer` (mobile).

### Roles (`prisma/schema.prisma` → `enum UserRole`)
- **USER**: funcionalidades públicas y de comunidad.
- **BUSINESS_OWNER**: gestión de sus negocios.
- **MODERATOR**: moderación de contenido + acceso al panel admin.
- **ADMIN**: acceso completo.

### Protección de rutas (`src/middleware.ts`)
El middleware corre **solo** en las rutas protegidas (matcher explícito):

| Ruta | Requisito |
|---|---|
| `/admin/*` | Sesión + rol `ADMIN`/`MODERATOR` + email en dominio corporativo autorizado + perfil completo (defensa en profundidad) |
| `/registrar-negocio`, `/perfil/*` | Sesión iniciada (con redirección a completar perfil si aplica) |
| `/api/admin/*` | Header `x-api-key` igual a `N8N_ADMIN_API_KEY` (automatización n8n) |

## ✅ Validación de Datos

Toda entrada de usuario se valida **en el servidor** con Zod (`src/lib/validations.ts`)
o validaciones explícitas por endpoint:

```typescript
// Política de contraseñas (src/lib/validations.ts)
password: z.string()
  .min(8).max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Debe contener minúscula, mayúscula, número y carácter especial')
```

Ejemplos de validación por endpoint:
- `POST /api/jobs`: whitelists de categoría/ubicación/tipo, salario obligatorio,
  al menos un método de contacto y **bloqueo de acortadores de URL** en enlaces externos.
- Queries de listado con `select` explícito y límites (`take`) — los datos de
  contacto no viajan en listados públicos, solo en la página de detalle.

## 🛡️ Protección contra Ataques

### 1. Cross-Site Scripting (XSS)
- **React escapa todo por defecto**; el proyecto no usa `dangerouslySetInnerHTML`.
- **CSP estricta** (ver sección de headers) limita orígenes de scripts, conexiones,
  frames y media a la lista blanca de servicios que la app realmente usa.

### 2. SQL Injection
- Uso exclusivo de **Prisma ORM** con consultas parametrizadas.
- Sin SQL crudo construido con entrada de usuario.

### 3. Cross-Site Request Forgery (CSRF)
- Protección integrada de NextAuth.js (token CSRF) en los flujos de autenticación.
- Cookie de sesión con `SameSite=Lax` (default de NextAuth).
- Las APIs mutadoras exigen sesión (cookie) o Bearer token.

### 4. Fuerza bruta / credenciales
- bcrypt con costo configurable encarece ataques offline.
- Access tokens móviles de 15 min + refresh rotativo limitan el impacto de un robo
  de token; los refresh tokens nunca se guardan en claro.
- Intentos de login fallidos quedan registrados (`SecurityLogger`).

### 5. Exposición de datos
- Respuestas de error genéricas vía `ErrorHandler` — sin stack traces en producción.
- Logs de queries de Prisma **solo en desarrollo**; producción registra solo errores.
- El endpoint de clima por IP responde con `Cache-Control: private` (nunca se
  comparte entre usuarios vía CDN).

## 🔰 Headers de Seguridad

Definidos en **`next.config.ts` → `headers()`** (constante `SECURITY_HEADERS`) y
aplicados por la plataforma a **todas** las rutas, incluidas las de auth:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; … (lista blanca completa en next.config.ts)
```

- **HSTS** (`Strict-Transport-Security`) lo inyecta Vercel automáticamente en los
  dominios de producción.
- Nota histórica: hasta 2026-08 estos headers vivían en el middleware con un matcher
  catch-all; se movieron a `next.config.ts` para cubrir también las rutas de auth y
  evitar invocar el middleware en cada request.

## 📊 Logging y Monitoreo

`src/lib/logger.ts` (winston) expone `SecurityLogger` con:

1. **Eventos de autenticación** (`logAuthEvent`): logins exitosos/fallidos, registros.
2. **Violaciones de seguridad** (`logSecurityViolation`): accesos no autorizados,
   entrada sospechosa.

```typescript
SecurityLogger.logAuthEvent({
  type: 'failed_login',
  email: 'user@example.com',
  success: false,
  reason: 'Invalid password',
})
```

Reglas para logs: **sin contraseñas, sin tokens, sin PII innecesaria**.

## ⚙️ Configuración Segura

### Variables de entorno de seguridad (ver `env.example`)
```bash
NEXTAUTH_SECRET="mínimo 32 caracteres aleatorios"
JWT_SECRET="clave para los JWT móviles (obligatoria para mobile auth)"
BCRYPT_ROUNDS="12"            # validado: entre 10 y 15
N8N_ADMIN_API_KEY="api key para /api/admin/*"
DATABASE_URL="postgres con SSL; en producción usar el pooler de Neon (-pooler)"
```

Reglas:
- Nunca commitear `.env*` ni credenciales (las credenciales OAuth de Google viven
  **fuera del repo**).
- `service_role`/secrets solo en servidor — jamás en código cliente.
- Conexiones a la BD siempre con SSL/TLS; producción verificada con pooler.

## 👨‍💻 Mejores Prácticas para Desarrolladores

### 1. Validar SIEMPRE en el servidor
```typescript
// ✅ CORRECTO
const validatedData = businessSchema.parse(requestData)

// ❌ INCORRECTO: usar datos sin validar
await prisma.business.create({ data: requestData })
```

### 2. Manejo de errores centralizado
```typescript
// ✅ CORRECTO: respuesta genérica + log interno
} catch (error) {
  logger.error('Error in POST /api/jobs', { error })
  return NextResponse.json({ success: false, error: 'No se pudo crear la oferta.' }, { status: 500 })
}
```

### 3. Proyección de datos en listados
```typescript
// ✅ CORRECTO: solo los campos que la UI necesita (sin PII de contacto)
prisma.jobOffer.findMany({ take: 60, select: { id: true, title: true, /* … */ } })

// ❌ INCORRECTO: volcar la tabla completa al cliente
prisma.jobOffer.findMany()
```

### 4. Registrar eventos de seguridad relevantes
```typescript
SecurityLogger.logSecurityViolation({ type: 'unauthorized_access', /* … */ })
```

## ⚠️ Brechas conocidas (backlog)

Documentadas explícitamente para no dar por implementado lo que no lo está:

- **Rate limiting no está activo.** Ningún endpoint aplica límites de tasa, así que
  login, registro y publicación de contenido no tienen freno ante abuso automatizado.
  Una implementación en memoria no sirve en serverless (cada invocación tiene su
  propio estado): hace falta un backend compartido (Upstash/Redis) o
  Vercel Firewall / BotID en los endpoints sensibles.
- **Sin sanitización de HTML de usuario.** Hoy no es un hueco explotable porque React
  escapa la salida y no se usa `dangerouslySetInnerHTML`. Si en el futuro se
  renderiza HTML de usuario (p. ej. en foros), la sanitización en servidor debe
  implementarse **antes** de esa feature.
- **Sin `Permissions-Policy` ni `form-action` en la CSP.** Endurecimiento adicional
  posible en `next.config.ts`. Ojo al añadirlos: `/clima` usa `navigator.geolocation`
  y el formulario de soporte postea a Formspree, así que cualquier directiva debe
  permitirlos explícitamente.
  > Nota histórica: versiones anteriores de este documento acreditaban `DOMPurify` y
  > `sanitize-html`; esas dependencias **nunca se usaron** y se eliminaron en agosto
  > de 2026, junto con `src/lib/security.ts` (módulo sin uso que además duplicaba
  > `PasswordSecurity` con SHA-256 en vez de bcrypt).

## 🚨 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad, **no abras un issue público**. Escríbenos a:

- **privacy@latinterritory.com**

Incluye pasos de reproducción y alcance estimado. Procedimiento interno:
detección → evaluación de severidad → contención → investigación → recuperación →
documentación de lecciones aprendidas.

### Niveles de severidad
- **CRÍTICO**: compromiso de datos o acceso no autorizado masivo.
- **ALTO**: vulnerabilidad explotable confirmada.
- **MEDIO**: patrones sospechosos, abuso de endpoints.
- **BAJO**: intentos fallidos de login, errores de validación.

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js: Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Prisma: Connection management](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)
- Herramientas: `npm audit` + Dependabot (activo en el repo), securityheaders.com, OWASP ZAP

---

**Última actualización**: Agosto 2026
**Versión**: 2.0.0
