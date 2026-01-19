# Configuración de PostgreSQL para macOS

## 🚨 Estado Actual

PostgreSQL no está instalado o no está accesible en tu sistema. Necesitas instalarlo antes de continuar.

## Opción 1: Instalar con Homebrew (Recomendado)

### Paso 1: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
brew install postgresql@16

# O si prefieres la versión 15
brew install postgresql@15
```

### Paso 2: Iniciar el servicio

```bash
# Iniciar PostgreSQL ahora
brew services start postgresql@16

# O para iniciar temporalmente (solo esta sesión)
pg_ctl -D /opt/homebrew/var/postgresql@16 start
```

### Paso 3: Verificar instalación

```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Debería mostrar: accepting connections
```

### Paso 4: Crear usuario y base de datos

```bash
# Conectar a PostgreSQL
psql postgres

# Dentro de psql, ejecutar:
CREATE USER tu_usuario WITH PASSWORD 'tu_password';
CREATE DATABASE plataforma_colombiana OWNER tu_usuario;
GRANT ALL PRIVILEGES ON DATABASE plataforma_colombiana TO tu_usuario;
\q
```

### Paso 5: Actualizar .env

Edita tu archivo `.env` y actualiza la línea DATABASE_URL:

```env
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/plataforma_colombiana"
```

## Opción 2: Instalar Postgres.app (GUI Amigable)

### Paso 1: Descargar

- Visita: https://postgresapp.com/
- Descarga e instala Postgres.app

### Paso 2: Iniciar

- Abre Postgres.app
- Haz clic en "Initialize" para crear un nuevo servidor
- El servidor iniciará automáticamente

### Paso 3: Configurar PATH

Agrega al archivo `~/.zshrc`:

```bash
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
```

Luego ejecuta:

```bash
source ~/.zshrc
```

### Paso 4: Crear base de datos

```bash
# Abrir terminal y conectar
psql

# Crear base de datos
CREATE DATABASE plataforma_colombiana;
\q
```

### Paso 5: Actualizar .env

Con Postgres.app, típicamente el usuario por defecto es tu nombre de usuario de macOS sin contraseña:

```env
DATABASE_URL="postgresql://tu_nombre_usuario@localhost:5432/plataforma_colombiana"
```

## Opción 3: Usar Supabase (Base de datos en la nube - Gratis)

### Ventajas
- ✅ No necesitas instalar nada local
- ✅ Tier gratis generoso
- ✅ Backups automáticos
- ✅ Dashboard web

### Pasos

1. **Crear cuenta**: https://supabase.com/
2. **Crear proyecto nuevo**
3. **Obtener connection string**:
   - Ve a Settings → Database
   - Copia el "Connection String" (modo URI)
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña

4. **Actualizar .env**:
```env
DATABASE_URL="postgresql://postgres.[tu-proyecto]:[tu-password]@db.[region].supabase.co:5432/postgres"
```

## Opción 4: Docker (Para desarrollo aislado)

### Paso 1: Crear docker-compose.yml

Crea este archivo en la raíz del proyecto:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: plataforma-colombiana-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: plataforma_colombiana
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Paso 2: Iniciar contenedor

```bash
docker-compose up -d
```

### Paso 3: Actualizar .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/plataforma_colombiana"
```

### Comandos útiles

```bash
# Ver logs
docker-compose logs -f postgres

# Detener
docker-compose down

# Detener y eliminar datos
docker-compose down -v
```

## Verificación de Setup

Una vez instalado PostgreSQL, ejecuta estos comandos para verificar:

```bash
# 1. Verificar que PostgreSQL está corriendo
pg_isready
# Esperado: accepting connections

# 2. Conectar a la base de datos
psql plataforma_colombiana
# Si funciona, estás dentro de psql

# 3. Ver tablas (después de migraciones)
\dt

# 4. Salir
\q
```

## Próximos Pasos

Una vez que PostgreSQL esté configurado:

1. ✅ Verifica que el servicio está corriendo
2. ✅ Actualiza DATABASE_URL en .env
3. ✅ Ejecuta: `npm run db:migrate`
4. ✅ Ejecuta: `npm run dev`
5. ✅ Visita: http://localhost:3000

## Troubleshooting

### Error: "connection refused"

PostgreSQL no está corriendo.

**Solución (Homebrew)**:
```bash
brew services start postgresql@16
```

**Solución (Postgres.app)**:
- Abre Postgres.app
- Asegúrate de que el servidor esté iniciado (ícono de elefante en la barra de menú)

### Error: "role does not exist"

El usuario especificado no existe.

**Solución**:
```bash
psql postgres
CREATE USER tu_usuario WITH PASSWORD 'tu_password';
\q
```

### Error: "database does not exist"

La base de datos no fue creada.

**Solución**:
```bash
createdb plataforma_colombiana

# O dentro de psql:
psql postgres
CREATE DATABASE plataforma_colombiana;
\q
```

### Error: "password authentication failed"

Contraseña incorrecta en DATABASE_URL.

**Solución**:
- Verifica tu contraseña
- Actualiza .env con las credenciales correctas
- Si usas Postgres.app sin contraseña, omite la parte de password:
  ```env
  DATABASE_URL="postgresql://usuario@localhost:5432/plataforma_colombiana"
  ```

## Recomendación

Para desarrollo local, recomiendo **Opción 1 (Homebrew)** porque:
- ✅ Fácil de instalar y actualizar
- ✅ Integración nativa con macOS
- ✅ Buen rendimiento
- ✅ Fácil de gestionar con brew services

Para proyectos compartidos o CI/CD, recomiendo **Opción 4 (Docker)** porque:
- ✅ Configuración reproducible
- ✅ Fácil de compartir con el equipo
- ✅ Aislado del sistema
- ✅ Fácil de limpiar


## Siguiente Documento

Una vez PostgreSQL esté configurado, continúa con:
→ `SETUP_INSTRUCTIONS.md`

---
## Plantillas y configuración base (Auth, .env, correo, jobs)

> Esta sección te deja **todo listo** para integrar autenticación social (Google), contraseñas seguras (opcional), manejo de secretos y correo transaccional. **No crea archivos automáticamente**: copia/pega los bloques en tu proyecto.

### 1) `.env.example` (plantilla)
Crea un archivo `.env.example` en la raíz con:

```env
# App
NEXT_PUBLIC_APP_NAME=Plataforma Colombiana
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme-32chars-min

# DB
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plataforma_colombiana

# OAuth (Google)
OAUTH_GOOGLE_ID=
OAUTH_GOOGLE_SECRET=

# Email (elige uno)
RESEND_API_KEY=
POSTMARK_TOKEN=
EMAIL_FROM="Soporte Plataforma <no-reply@tudominio.com>"

# Seguridad (passwords)
PASSWORD_PEPPER=use-a-long-random-secret

# Caches / rate limiting (opcional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Observabilidad (opcional)
SENTRY_DSN=

# APIs externas
WEATHER_API_KEY=
EXCHANGERATE_API_KEY=
FOOTBALL_API_KEY=
YOUTUBE_API_KEY=
```

> Copia `.env.example` a `.env.local` para desarrollo.

---

### 2) Prisma – modelos para Auth.js (NextAuth)
Si aún no lo tienes, añade al `schema.prisma` los modelos estándar del **Prisma Adapter** (no borres tus modelos existentes; pega **debajo**):

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  role          String   @default("USER") // RBAC simple: USER | MODERATOR | ADMIN
  passwordHash  String?  // opcional (si habilitas credenciales)

  accounts      Account[]
  sessions      Session[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Ejecuta:
```bash
# instala prisma si falta
pnpm add -D prisma
pnpm add @prisma/client
pnpx prisma generate
pnpx prisma migrate dev -n "auth_init"
```

---

### 3) Paquetes para autenticación y seguridad
```bash
pnpm add next-auth @node-rs/argon2 zod
# proveedores de correo (elige uno)
pnpm add resend postmark
# rate limiting / colas (opcional)
pnpm add @upstash/ratelimit ioredis
# observabilidad (opcional)
pnpm add @sentry/nextjs
```

---

### 4) NextAuth (App Router) – Handler con Google y credenciales opcionales

Crea el archivo `src/app/api/auth/[...nextauth]/route.ts` con:

```ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { verify } from "@node-rs/argon2";

const prisma = new PrismaClient();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.OAUTH_GOOGLE_ID!,
      clientSecret: process.env.OAUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    // Habilita credenciales solo si vas a usar contraseñas
    Credentials({
      name: "Email y contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(raw) {
        const input = credentialsSchema.safeParse(raw);
        if (!input.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: input.data.email },
        });
        if (!user?.passwordHash) return null;

        const ok = await verify(user.passwordHash, input.data.password);
        return ok ? { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined } : null;
      },
    }),
  ],
  pages: {
    // Opcional: define rutas personalizadas si tienes UI propia: signIn: "/login"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

> Si no usarás credenciales locales, elimina el bloque `Credentials()` y el campo `passwordHash` del modelo.

**Helper para registrar usuarios con contraseña (opcional)**: crea `src/lib/auth/createUserWithPassword.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

export async function createUserWithPassword(email: string, password: string, name?: string) {
  const pepper = process.env.PASSWORD_PEPPER ?? "";
  const passwordHash = await hash(password + pepper, { memoryCost: 19456, timeCost: 2, parallelism: 1, type: 2 });
  return prisma.user.create({ data: { email, name, passwordHash } });
}
```

---

### 5) Correo transaccional (elige **Resend** o **Postmark**)

**Resend (simple con React Email)**
```ts
// src/lib/mail/send.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerification(to: string, url: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Verifica tu correo",
    html: `<p>Hola,</p><p>Haz clic para verificar: <a href="${url}">${url}</a></p>`,
  });
}
```

**Postmark**
```ts
// src/lib/mail/send.ts
import postmark from "postmark";
const client = new postmark.ServerClient(process.env.POSTMARK_TOKEN!);

export async function sendVerification(to: string, url: string) {
  await client.sendEmail({
    From: process.env.EMAIL_FROM!,
    To: to,
    Subject: "Verifica tu correo",
    HtmlBody: `<p>Hola,</p><p>Haz clic para verificar: <a href="${url}">${url}</a></p>`,
    MessageStream: "outbound", // crea si usas streams
  });
}
```

> Configura en tu DNS: **SPF**, **DKIM** y **DMARC** para tu dominio.

---

### 6) Manejo de secretos con **Doppler** (recomendado)
1. Crea proyecto en Doppler (`dev`, `staging`, `prod`).
2. Importa tu `.env.example`.
3. Instala el CLI y ejecuta la app con inyección de secretos:
```bash
brew install dopplerhq/cli/doppler
doppler login
doppler setup # selecciona proyecto y entorno
doppler run -- pnpm dev
```

---

### 7) Jobs/Crons (foro diario y clima cada 15 min)

**Opción A: Vercel Cron Jobs**
- Crea rutas:
  - `src/app/api/cron/forum-reset/route.ts`
  - `src/app/api/cron/weather-cache/route.ts`

Ejemplo de handler (resumen):
```ts
// forum-reset: se ejecuta a las 00:00 America/Bogota
import { NextResponse } from "next/server";
export async function GET() {
  // 1) cierra/archiva foro del día anterior
  // 2) crea foro del día actual
  return NextResponse.json({ ok: true });
}
```

Configura en `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/forum-reset", "schedule": "0 0 * * *", "timezone": "America/Bogota" },
    { "path": "/api/cron/weather-cache", "schedule": "*/15 * * * *", "timezone": "America/Bogota" }
  ]
}
```

**Opción B: Inngest**
- Define funciones serverless con reintentos/observabilidad.

---

### 8) Rate limiting / seguridad
- Aplica limitador en `/api/auth/*` y endpoints sensibles con Upstash o Redis.
- Valida payloads con **Zod**.
- Content-Security-Policy y `helmet`/headers en `next.config.js` o middleware.
- Sanitiza HTML en foros (DOMPurify en server).

---

### 9) Checklist de verificación rápida
- [ ] `.env.local` creado desde `.env.example`
- [ ] `prisma migrate dev` ejecutado y `@prisma/client` generado
- [ ] Ruta `api/auth/[...nextauth]` accesible
- [ ] OAuth Google configurado (consent screen + credenciales)
- [ ] Proveedor de correo funcional con DNS verificado
- [ ] Crons desplegados (Vercel/Inngest) con TZ `America/Bogota`
- [ ] RLS/roles si usas Supabase; en Postgres local, roles mínimos
- [ ] Sentry/logs habilitados (opcional)

---

