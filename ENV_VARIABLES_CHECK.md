# Variables de Entorno - Verificación

## ✅ Estado de Implementación

Todas las variables de entorno necesarias para el sistema de autenticación están correctamente implementadas y documentadas.

## Variables de Entorno Requeridas para Autenticación

### 1. NextAuth.js (✅ Implementado)

```env
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
```

**Uso**:
- `NEXTAUTH_SECRET`: Usado por NextAuth para firmar y encriptar tokens JWT
  - **Archivo**: `src/lib/auth.ts` (línea 118)
  - **Validación**: Debe tener mínimo 32 caracteres
  - **Crítico**: ⚠️ NUNCA exponer en repositorio público

- `NEXTAUTH_URL`: URL base de la aplicación
  - **Archivo**: Configuración automática de NextAuth
  - **Desarrollo**: `http://localhost:3000`
  - **Producción**: URL del dominio de producción

### 2. Seguridad de Contraseñas (✅ Implementado)

```env
BCRYPT_ROUNDS="12"
```

**Uso**:
- `BCRYPT_ROUNDS`: Número de rondas de salt para bcrypt
  - **Archivo**: `src/lib/password-security.ts` (línea 20)
  - **Valor recomendado**: 12 (balance entre seguridad y rendimiento)
  - **Rango válido**: 10-15
  - **Nota**: Valores más altos = más seguro pero más lento

### 3. Base de Datos (✅ Ya existía)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/plataforma_colombiana"
```

**Uso**:
- Conexión a PostgreSQL para Prisma
- Usado para almacenar usuarios, sesiones, posts, etc.

### 4. Otras Variables de Seguridad

```env
JWT_SECRET="your-jwt-secret-key-minimum-32-characters"   # ✅ en uso
BCRYPT_ROUNDS="12"                                        # ✅ en uso
KV_REST_API_URL="https://..."                             # ✅ en uso (auto)
KV_REST_API_TOKEN="..."                                   # ✅ en uso (auto)
```

**Uso**:
- `JWT_SECRET` (**obligatoria**): firma de los JWT de la app mobile
  — **Archivo**: `src/lib/mobile-jwt.ts`. NextAuth (web) usa `NEXTAUTH_SECRET`.
- `BCRYPT_ROUNDS`: costo de bcrypt, validado entre 10 y 15 (default 12)
  — **Archivo**: `src/lib/password-security.ts`.
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: rate limiting con Upstash Redis
  — **Archivo**: `src/lib/rate-limit.ts`. Las **inyecta automáticamente** la
  integración del Marketplace de Vercel; no las definas a mano. Sin ellas, el
  rate limiting se desactiva (fail-open) en vez de romper la app.

> ⚠️ `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW` y `ALLOWED_ORIGINS` siguen en
> `env.example` pero **ya ningún código las lee**: el limitador en memoria de
> `/api/translate` que las usaba fue reemplazado por Upstash, y no hay capa CORS
> propia. Se pueden borrar de `env.example`.

## Variables Opcionales (Futuras Features)

### Para Verificación de Email

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Estado**: 📝 Documentado, pendiente de implementación

### Para OAuth Providers

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**Estado**: 📝 Documentado, pendiente de implementación

## Verificación de Seguridad

### ✅ Mejoras Implementadas

1. **Bcrypt Implementado Correctamente**
   - Archivo nuevo: `src/lib/password-security.ts`
   - Usa `bcryptjs` (ya instalado en package.json)
   - Lee `BCRYPT_ROUNDS` desde variables de entorno
   - Valida que el valor esté entre 10-15
   - Implementa salt seguro

2. **Separación de Concerns**
   - `password-security.ts`: Hash con bcrypt para API routes (Node.js runtime)
   - `security.ts`: Funciones de seguridad para Edge Runtime

3. **Archivos Actualizados**
   - ✅ `src/app/api/auth/register/route.ts`: Usa PasswordSecurity con bcrypt
   - ✅ `src/lib/auth.ts`: Usa PasswordSecurity con bcrypt para login
   - ✅ `env.example`: Documentación completa

### ⚠️ Importante: Antes de Producción

1. **Generar NEXTAUTH_SECRET seguro**:
   ```bash
   openssl rand -base64 32
   ```

2. **Configurar JWT_SECRET** (opcional, pero recomendado):
   ```bash
   openssl rand -base64 32
   ```

3. **Ajustar BCRYPT_ROUNDS**:
   - Desarrollo: `10` (más rápido)
   - Producción: `12` (recomendado) o `13` (más seguro)

4. **Actualizar NEXTAUTH_URL**:
   ```env
   NEXTAUTH_URL="https://tu-dominio.com"
   ```

5. **Configurar ALLOWED_ORIGINS**:
   ```env
   ALLOWED_ORIGINS="https://tu-dominio.com,https://www.tu-dominio.com"
   ```

## Checklist de Setup

### Desarrollo Local

```bash
# 1. Copiar env.example a .env
cp env.example .env

# 2. Generar secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# 3. Verificar DATABASE_URL
# Asegurarse de que PostgreSQL esté corriendo

# 4. Generar Prisma Client
npm run db:generate

# 5. Ejecutar migraciones
npm run db:migrate

# 6. Iniciar desarrollo
npm run dev
```

### Producción (Vercel/Similar)

1. Ir a Settings → Environment Variables
2. Agregar cada variable una por una
3. Variables críticas:
   - ✅ `DATABASE_URL` (de tu provider de BD)
   - ✅ `NEXTAUTH_SECRET` (generar nuevo)
   - ✅ `NEXTAUTH_URL` (tu dominio)
   - ✅ `BCRYPT_ROUNDS` (12 recomendado)
4. Variables opcionales según features habilitadas

## Validación de Variables

### Script de Validación (Opcional)

Puedes crear un script para validar las variables requeridas:

```typescript
// scripts/validate-env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

const optionalEnvVars = [
  'BCRYPT_ROUNDS',
  'JWT_SECRET',
  'RATE_LIMIT_MAX',
]

console.log('Validating environment variables...\n')

let hasErrors = false

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required env var: ${varName}`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName} is set`)
  }
})

optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Optional env var not set: ${varName} (using default)`)
  } else {
    console.log(`✅ ${varName} is set`)
  }
})

if (hasErrors) {
  console.error('\n❌ Environment validation failed!')
  process.exit(1)
}

console.log('\n✅ All required environment variables are set!')
```

Ejecutar: `npx tsx scripts/validate-env.ts`

## Seguridad - Best Practices

### ✅ Implementado

1. Hash de contraseñas con bcrypt (12 rounds)
2. Validación de entrada con Zod
3. Logging de eventos de autenticación
4. Rate limiting
5. CORS configurado
6. Tokens JWT seguros

### 📝 Recomendado para Futuro

1. **Rotación de Secrets**: Cambiar NEXTAUTH_SECRET periódicamente
2. **Monitoring**: Alertas para intentos de login fallidos
3. **2FA**: Autenticación de dos factores
4. **Session Management**: Límite de sesiones activas por usuario
5. **IP Whitelisting**: Para operaciones administrativas

## Troubleshooting

### Error: "NEXTAUTH_SECRET is not defined"

**Solución**:
```bash
# Verificar que .env existe
ls -la .env

# Agregar la variable
echo 'NEXTAUTH_SECRET="'$(openssl rand -base64 32)'"' >> .env

# Reiniciar servidor
npm run dev
```

### Error: "Failed to hash password"

**Solución**:
```bash
# Verificar que bcryptjs está instalado
npm list bcryptjs

# Si no está instalado
npm install bcryptjs @types/bcryptjs
```

### Error: "BCRYPT_ROUNDS must be between 10 and 15"

**Solución**:
```env
# En .env, cambiar a un valor válido
BCRYPT_ROUNDS="12"
```

## Documentos Relacionados

- `AUTH_IMPLEMENTATION.md`: Documentación completa del sistema de autenticación
- `SECURITY.md`: Guías de seguridad general
- `env.example`: Plantilla de variables de entorno

## Conclusión

✅ **Todas las variables de entorno necesarias están correctamente implementadas y documentadas.**

El sistema de autenticación ahora usa:
- ✅ Bcrypt para hash de contraseñas (no SHA-256)
- ✅ Variables de entorno configurables
- ✅ Valores por defecto seguros
- ✅ Validación de rangos apropiados
- ✅ Separación entre Edge Runtime y Node.js runtime

**Próximo paso**: Asegurarse de que el archivo `.env` exista con todas las variables requeridas antes de ejecutar la aplicación.

