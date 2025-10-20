# Instrucciones de Setup - Desarrollo Local

## Setup Paso a Paso

### Paso 1: Actualizar Variables de Entorno

Edita el archivo `.env` y actualiza las siguientes variables:

```env
# 1. Actualizar NEXTAUTH_SECRET con este valor generado:
NEXTAUTH_SECRET="InAC7HWC1GjiTy7byvntsPaucTpPmSC/CVFLtMoWQZ8="

# 2. Actualizar JWT_SECRET (opcional pero recomendado):
JWT_SECRET="m/Xyt0FIRoBr9mcBRf3h7w5gREB+gouFxSetZWWduxg="

# 3. Actualizar DATABASE_URL con tus credenciales de PostgreSQL:
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/plataforma_colombiana"

# 4. Verificar estas están configuradas:
NEXTAUTH_URL="http://localhost:3000"
BCRYPT_ROUNDS="12"
```

### Paso 2: Crear Base de Datos PostgreSQL

Si aún no tienes la base de datos creada:

```bash
# Opción 1: Usando psql
psql postgres
CREATE DATABASE plataforma_colombiana;
\q

# Opción 2: Usando createdb
createdb plataforma_colombiana

# Opción 3: Si tienes usuario específico
createdb -U tu_usuario plataforma_colombiana
```

### Paso 3: Instalar Dependencias

```bash
npm install
```

### Paso 4: Generar Prisma Client

```bash
npm run db:generate
```

### Paso 5: Ejecutar Migraciones

```bash
npm run db:migrate
```

### Paso 6: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

### Paso 7: Probar el Sistema

1. Visita http://localhost:3000
2. Haz clic en "Iniciar Sesión" en el header
3. Ve a "Regístrate aquí"
4. Crea una nueva cuenta con:
   - Nombre completo
   - Email válido
   - Contraseña (min 8 caracteres, con mayúsculas, minúsculas, números y símbolos)
5. Inicia sesión con tus credenciales
6. Explora tu perfil

## Script Automatizado (Opcional)

También puedes ejecutar el script de setup automático:

```bash
./scripts/setup-dev.sh
```

Este script:
- ✅ Verifica que .env existe
- ✅ Genera secrets si es necesario
- ✅ Instala dependencias
- ✅ Genera Prisma Client
- ✅ Ejecuta migraciones (si confirmas)
- ✅ Muestra checklist de verificación

## Troubleshooting

### Error: "NEXTAUTH_SECRET is not defined"

**Causa**: La variable no está en el archivo .env o el servidor no la lee.

**Solución**:
```bash
# 1. Verifica que está en .env
grep NEXTAUTH_SECRET .env

# 2. Si no está, agrégala:
echo 'NEXTAUTH_SECRET="InAC7HWC1GjiTy7byvntsPaucTpPmSC/CVFLtMoWQZ8="' >> .env

# 3. Reinicia el servidor
npm run dev
```

### Error: "Database does not exist"

**Causa**: La base de datos PostgreSQL no fue creada.

**Solución**:
```bash
createdb plataforma_colombiana
npm run db:migrate
```

### Error: "password authentication failed"

**Causa**: Credenciales incorrectas en DATABASE_URL.

**Solución**:
```bash
# Verifica tu usuario y contraseña de PostgreSQL
psql -U tu_usuario -d postgres

# Actualiza DATABASE_URL en .env con las credenciales correctas
```

### Error: "Prisma schema not found"

**Causa**: No se ha generado el cliente de Prisma.

**Solución**:
```bash
npm run db:generate
```

### Error: "Port 3000 already in use"

**Causa**: Otro proceso está usando el puerto 3000.

**Solución**:
```bash
# Opción 1: Matar el proceso
lsof -ti:3000 | xargs kill -9

# Opción 2: Usar otro puerto
PORT=3001 npm run dev
```

### Error: "bcryptjs not found"

**Causa**: Dependencia faltante.

**Solución**:
```bash
npm install bcryptjs @types/bcryptjs
npm run dev
```

## Verificación de Setup Exitoso

Si todo está bien, deberías ver:

```
✓ Ready in 2.5s
✓ Local:        http://localhost:3000
✓ Network:      http://192.168.1.x:3000

○ Compiling / ...
✓ Compiled / in 3.2s
```

Y al visitar http://localhost:3000:
- ✅ La página carga sin errores
- ✅ El header muestra el botón "Iniciar Sesión"
- ✅ Puedes navegar a /auth/signup
- ✅ Puedes crear una cuenta
- ✅ Puedes iniciar sesión
- ✅ El menú de usuario aparece después de login

## Próximos Pasos

Una vez que el setup esté completo:

1. **Prueba el registro**: Crea una cuenta en `/auth/signup`
2. **Prueba el login**: Inicia sesión en `/auth/signin`
3. **Explora el perfil**: Visita `/perfil` después de login
4. **Prueba los foros**: Ve a `/foros` y crea posts (requiere nickname)
5. **Revisa la documentación**: Lee `AUTH_IMPLEMENTATION.md` para más detalles

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
npm start

# Prisma Studio (UI para ver la BD)
npm run db:studio

# Linting
npm run lint

# Tests
npm test

# Verificar variables de entorno
npx tsx scripts/validate-env.ts  # (crear este script si necesario)
```

## Estructura de Archivos Clave

```
├── .env                          # Variables de entorno (NO commitear)
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── migrations/              # Migraciones
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── register/    # Endpoint de registro
│   │   ├── auth/
│   │   │   ├── signin/          # Página de login
│   │   │   └── signup/          # Página de registro
│   │   └── perfil/              # Página de perfil
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx       # Header con menú de usuario
│   │   └── ui/
│   │       ├── login-form.tsx   # Formulario de login
│   │       └── register-form.tsx # Formulario de registro
│   └── lib/
│       ├── auth.ts              # Configuración NextAuth
│       ├── password-security.ts # Bcrypt para contraseñas
│       └── validations.ts       # Esquemas de validación
└── AUTH_IMPLEMENTATION.md       # Documentación completa
```

## Soporte

Si encuentras problemas:

1. Revisa `ENV_VARIABLES_CHECK.md` para variables de entorno
2. Revisa `AUTH_IMPLEMENTATION.md` para arquitectura
3. Revisa `TROUBLESHOOTING.md` para problemas comunes
4. Verifica los logs del servidor en la consola

¡Todo listo para empezar a desarrollar! 🚀

