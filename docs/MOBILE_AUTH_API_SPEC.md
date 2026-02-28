# Especificación: API de autenticación móvil

Este documento define los **3 endpoints** que el backend web debe exponer para que la app móvil pueda autenticar usuarios de forma segura (auth end-to-end), reutilizando la lógica y el JWT de NextAuth.

---

## Resumen

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/auth/mobile/sign-in` | POST | Inicio de sesión con email/contraseña → devuelve JWT y usuario |
| `/api/auth/mobile/session` | GET | Obtener sesión actual a partir del token Bearer |
| `/api/auth/mobile/refresh` | POST | Refrescar el JWT y obtener nueva sesión |

**Autenticación en requests:** todos los endpoints protegidos usan el header estándar:

```http
Authorization: Bearer <accessToken>
```

El `accessToken` es el mismo JWT que NextAuth usa internamente (codificado con `NEXTAUTH_SECRET`), para que el backend pueda validarlo con `getToken()` de `next-auth/jwt`, que ya soporta Bearer además de cookies.

---

## 1. Sign-in (login)

Permite a la app móvil iniciar sesión con email y contraseña. Valida credenciales con la misma lógica que el proveedor Credentials de NextAuth y devuelve un JWT + datos de usuario.

### Request

- **URL:** `POST /api/auth/mobile/sign-in`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseñaSegura123"
}
```

| Campo     | Tipo   | Requerido | Descripción                          |
|----------|--------|-----------|--------------------------------------|
| `email`  | string | Sí        | Email del usuario (formato válido)   |
| `password` | string | Sí      | Contraseña en texto plano            |

**Validación:** mismo esquema que el login web (`userLoginSchema`): email válido, password no vacío.

### Response exitosa (200)

```json
{
  "success": true,
  "data": {
    "accessToken": "<JWT codificado por NextAuth>",
    "expiresIn": 86400,
    "user": {
      "id": "clxxx...",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "role": "USER",
      "hasCompletedProfile": true
    }
  }
}
```

| Campo         | Tipo   | Descripción |
|---------------|--------|-------------|
| `accessToken` | string | JWT (NextAuth) para enviar en `Authorization: Bearer` |
| `expiresIn`   | number | Vida del token en segundos (ej. 86400 = 24h) |
| `user`        | object | Datos mínimos del usuario para la app |

El JWT debe generarse con `encode()` de `next-auth/jwt`, con el mismo `secret` y `maxAge` que en `authOptions`, y payload compatible con el callback `jwt()` (p. ej. `sub`, `email`, `name`, `role`, `hasCompletedProfile`, `lastLogin`).

### Respuestas de error

- **400** – Validación fallida (email/password inválidos):
  ```json
  {
    "success": false,
    "error": "Datos de login inválidos",
    "details": [{ "field": "email", "message": "Formato de email inválido" }]
  }
  ```
- **401** – Credenciales incorrectas (usuario no existe o contraseña errónea):
  ```json
  {
    "success": false,
    "error": "Credenciales inválidas"
  }
  ```
- **500** – Error interno (incluir logging de seguridad como en el login web).

**Seguridad:** registrar intentos fallidos y exitosos con `SecurityLogger.logAuthEvent` (igual que en `auth.ts`).

---

## 2. Session (obtener sesión actual)

Permite a la app comprobar si el token sigue siendo válido y obtener los datos actuales del usuario (útil al abrir la app o tras restaurar el token desde almacenamiento seguro).

### Request

- **URL:** `GET /api/auth/mobile/session`
- **Headers:** `Authorization: Bearer <accessToken>`

No body.

### Response exitosa (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "role": "USER",
      "hasCompletedProfile": true
    },
    "expiresAt": 1234567890
  }
}
```

`expiresAt` puede ser el timestamp (segundos) de expiración del JWT para que la app decida cuándo llamar a refresh.

### Respuestas de error

- **401** – Token ausente, inválido o expirado:
  ```json
  {
    "success": false,
    "error": "No autorizado"
  }
  ```
- **500** – Error interno.

**Implementación:** usar `getToken({ req, secret: process.env.NEXTAUTH_SECRET })` sobre el `NextRequest`; NextAuth ya lee el JWT del header `Authorization: Bearer`. Si `getToken` devuelve `null`, responder 401. Si devuelve payload, mapear a la estructura `user` anterior (y opcionalmente `expiresAt` desde el JWT).

---

## 3. Refresh (renovar token)

Permite obtener un nuevo JWT sin pedir de nuevo email/contraseña, para alargar la sesión o rotar el token.

### Request

- **URL:** `POST /api/auth/mobile/refresh`
- **Headers:** `Authorization: Bearer <accessToken>` (token actual, puede estar próximo a expirar)

Body vacío o `{}` opcional.

### Response exitosa (200)

Misma forma que sign-in:

```json
{
  "success": true,
  "data": {
    "accessToken": "<nuevo JWT>",
    "expiresIn": 86400,
    "user": {
      "id": "clxxx...",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "role": "USER",
      "hasCompletedProfile": true
    }
  }
}
```

La app debe reemplazar el token guardado por `accessToken` y usar `expiresIn` para programar el próximo refresh si lo desea.

### Respuestas de error

- **401** – Token ausente, inválido o expirado:
  ```json
  {
    "success": false,
    "error": "No autorizado"
  }
  ```
- **500** – Error interno.

**Implementación:** con `getToken({ req, secret })` se obtiene el payload actual; si es válido, generar un nuevo JWT con `encode()` (mismo payload actualizado, nuevo `maxAge`) y devolverlo junto con `user` y `expiresIn`.

---

## Flujo recomendado en la app móvil

1. **Login:** `POST /api/auth/mobile/sign-in` → guardar `accessToken` y opcionalmente `user` en almacenamiento seguro.
2. **Requests a la API:** enviar `Authorization: Bearer <accessToken>` en todas las peticiones que requieran autenticación.
3. **Al abrir la app:** `GET /api/auth/mobile/session` para comprobar validez y obtener `user` actualizado (p. ej. `hasCompletedProfile`, `role`).
4. **Renovación:** cuando el token esté próximo a expirar (o ante 401), llamar `POST /api/auth/mobile/refresh` con el token actual y guardar el nuevo `accessToken`.

---

## Consideraciones de seguridad

- **HTTPS:** obligatorio en producción.
- **Secrets:** `NEXTAUTH_SECRET` solo en el servidor; nunca enviar en la app.
- **Almacenamiento en móvil:** guardar el token en Keychain (iOS) / Keystore (Android) o equivalente.
- **Rate limiting:** recomendable limitar intentos de sign-in y refresh por IP o por cliente (futuro).
- **CORS:** si la app es nativa (React Native/Expo, etc.) no aplica CORS; si es web móvil, configurar orígenes permitidos.

---

## Compatibilidad con el backend actual

- **NextAuth:** se reutiliza la estrategia JWT, el `secret`, `maxAge` y la forma del payload del callback `jwt()`.
- **Validación:** `userLoginSchema` de `@/lib/validations`.
- **Contraseñas:** misma verificación que en `auth.ts` (PasswordSecurity + fallback MVP si aplica).
- **Logging:** `SecurityLogger.logAuthEvent` para login/fallos.
- **APIs existentes:** los endpoints que usan `getServerSession(authOptions)` leen solo la cookie. Para que la app móvil use las mismas rutas (p. ej. `GET /api/users/me`), el backend debe aceptar también Bearer: por ejemplo, un helper que obtenga sesión desde cookie (`getServerSession`) o desde `getToken(req)` si hay header `Authorization: Bearer`, y usar ese resultado en las rutas. Eso puede documentarse o implementarse en una segunda fase; los 3 endpoints anteriores son suficientes para que el **auth** funcione end-to-end en la app móvil.
