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

