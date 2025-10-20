# Troubleshooting - Sistema de Autenticación

## Error: `useSession must be wrapped in a <SessionProvider />`

### Causa
El componente `Header` usa el hook `useSession()` de NextAuth, pero la aplicación no está envuelta en el `SessionProvider`.

### Solución ✅
Ya corregido. Se agregó el `SessionProvider` al layout principal.

**Archivos modificados:**
- ✅ `src/components/providers/session-provider.tsx` - Creado
- ✅ `src/app/layout.tsx` - Actualizado para incluir SessionProvider

### Código aplicado:

```tsx
// src/app/layout.tsx
import { SessionProvider } from "@/components/providers/session-provider";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>  {/* ✅ Agregado */}
          <ThemeProvider>
            <LanguageProvider>
              <AudioProvider>
                {/* ... resto de la app */}
              </AudioProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## Otros Errores Comunes

### 1. Error: "NEXTAUTH_SECRET is not defined"

**Causa**: Variable de entorno faltante.

**Solución**:
```bash
# Generar un secret seguro
openssl rand -base64 32

# Agregar al .env
echo 'NEXTAUTH_SECRET="[el-secret-generado]"' >> .env

# Reiniciar servidor
npm run dev
```

### 2. Error: "Cannot find module '@/lib/password-security'"

**Causa**: El archivo fue creado recientemente y TypeScript no lo reconoce.

**Solución**:
```bash
# Reiniciar el servidor TypeScript en tu IDE
# O ejecutar:
npm run dev
```

### 3. Error: "Database does not exist"

**Causa**: PostgreSQL no configurado.

**Solución**:
Ver `POSTGRES_SETUP.md` para configurar la base de datos.

```bash
# Crear base de datos
createdb plataforma_colombiana

# Ejecutar migraciones
npm run db:migrate
```

### 4. Error: "Failed to hash password"

**Causa**: Dependencia bcryptjs faltante o mal configurada.

**Solución**:
```bash
npm install bcryptjs @types/bcryptjs
npm run dev
```

### 5. Error: "Module not found: Can't resolve './profile-client'"

**Causa**: Error temporal de TypeScript que no reconoce el archivo.

**Solución**:
1. Reiniciar el servidor de desarrollo
2. O cambiar temporalmente `.tsx` a `.ts` y de vuelta

### 6. Error: Página en blanco después de login

**Causa**: Configuración incorrecta del callback o redirección.

**Solución**:
Verificar en `src/lib/auth.ts`:
```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // Asegurar que las redirecciones son seguras
    if (url.startsWith('/')) return `${baseUrl}${url}`
    if (new URL(url).origin === baseUrl) return url
    return baseUrl
  }
}
```

### 7. Error: "Invalid credentials" al hacer login

**Posibles causas**:
- Usuario no existe en la base de datos
- Contraseña incorrecta
- Hash de contraseña no coincide

**Solución**:
```bash
# Verificar usuario en la BD
npm run db:studio

# Buscar usuario por email
# Verificar que el campo password existe y no es null
```

### 8. Error: Sesión no persiste después de login

**Causa**: Configuración de cookies o dominio incorrecto.

**Solución**:
Verificar `NEXTAUTH_URL` en `.env`:
```env
# Desarrollo
NEXTAUTH_URL="http://localhost:3000"

# Producción
NEXTAUTH_URL="https://tu-dominio.com"
```

### 9. Error: "Cannot read properties of null (reading 'id')"

**Causa**: Intentando acceder a `session.user` sin verificar si existe.

**Solución**:
```typescript
// ❌ Malo
const userId = session.user.id

// ✅ Bueno
const userId = session?.user?.id
if (!userId) {
  redirect('/auth/signin')
}
```

### 10. Error: CORS en producción

**Causa**: Origen no permitido en las configuraciones de NextAuth.

**Solución**:
Agregar dominio a `ALLOWED_ORIGINS` en `.env`:
```env
ALLOWED_ORIGINS="https://tu-dominio.com,https://www.tu-dominio.com"
```

---

## Comandos Útiles para Debugging

### Verificar variables de entorno
```bash
# Ver todas las variables (sin valores sensibles)
grep -v "SECRET\|PASSWORD\|KEY" .env

# Verificar variable específica
grep NEXTAUTH_SECRET .env
```

### Verificar base de datos
```bash
# Abrir Prisma Studio
npm run db:studio

# Ver estado de migraciones
npx prisma migrate status

# Ver logs de Prisma
PRISMA_CLIENT_LOG_LEVEL=info npm run dev
```

### Logs de NextAuth
En `src/lib/auth.ts`, habilitar debug:
```typescript
export const authOptions: NextAuthOptions = {
  // ... configuración
  debug: process.env.NODE_ENV === 'development',
}
```

### Verificar que el servidor está corriendo correctamente
```bash
# Ver procesos en puerto 3000
lsof -i :3000

# Matar proceso si es necesario
kill -9 [PID]

# Limpiar y reiniciar
rm -rf .next
npm run dev
```

---

## Checklist de Verificación Post-Setup

- [ ] SessionProvider agregado al layout
- [ ] NEXTAUTH_SECRET configurado en .env
- [ ] DATABASE_URL apunta a base de datos válida
- [ ] Migraciones ejecutadas (`npm run db:migrate`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor reiniciado después de cambios
- [ ] Sin errores de linting
- [ ] Página de login accesible (`/auth/signin`)
- [ ] Página de registro accesible (`/auth/signup`)
- [ ] Header muestra botón de login cuando no autenticado

---

## Próximos Pasos

Una vez resuelto el error:

1. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Visita la aplicación**:
   ```
   http://localhost:3000
   ```

3. **Prueba el flujo de autenticación**:
   - Haz clic en "Iniciar Sesión"
   - Ve a "Regístrate aquí"
   - Crea una cuenta
   - Inicia sesión
   - Verifica que el menú de usuario aparece

---

## ¿Aún tienes problemas?

Si después de seguir estos pasos sigues teniendo problemas:

1. Revisa los logs del servidor en la consola
2. Abre las DevTools del navegador y revisa la consola
3. Verifica la pestaña Network para ver qué requests fallan
4. Comparte el error específico para ayuda adicional

## Archivos de Referencia

- `AUTH_IMPLEMENTATION.md` - Documentación completa del sistema
- `ENV_VARIABLES_CHECK.md` - Guía de variables de entorno
- `SETUP_INSTRUCTIONS.md` - Instrucciones de setup
- `POSTGRES_SETUP.md` - Configuración de base de datos

