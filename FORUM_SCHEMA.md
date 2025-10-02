# 📚 Sistema de Foros - Documentación del Schema

## 🎯 Descripción General

Sistema de foros diarios que se renuevan automáticamente a las 00:00 hora de Australia, con moderación automática y sistema de reputación.

## 📊 Modelos de Base de Datos

### 👤 User (Usuario)

Campos adicionales para el sistema de foros:

```prisma
nickname      String?   @unique  // Nickname único para foros
isBanned      Boolean   @default(false)  // Baneado del sistema de foros
reputation    Int       @default(0)  // Puntuación de reputación (0-1000)
```

**Sistema de Reputación:**
- +5 puntos por post que recibe likes
- +2 puntos por comentario con likes
- -10 puntos por post reportado y confirmado
- -20 puntos si es baneado

### 🗨️ Forum (Foro Diario)

Representa un foro diario que se renueva automáticamente:

```prisma
topic       ForumTopic    // DAILY_1 o DAILY_2
startDate   DateTime      // Inicio: 00:00 Australia time
endDate     DateTime      // Fin: 23:59:59 Australia time
isActive    Boolean       // Si está activo actualmente
isArchived  Boolean       // Si fue archivado
```

**Comportamiento:**
- 2 foros simultáneos: `DAILY_1` y `DAILY_2`
- Se crean automáticamente a las 00:00 (Australia/Sydney)
- Se archivan al final del día
- Mantienen historial completo

### 📝 ForumPost (Post/Mensaje)

Posts en el foro con moderación automática:

```prisma
content         String   // Máx 500 caracteres (validado en app)
isEdited        Boolean  // Si fue editado
isDeleted       Boolean  // Borrado lógico
isFlagged       Boolean  // Marcado por moderación
flagReason      String?  // Razón del marcado
moderationScore Float?   // Score de OpenAI Moderation (0-1)
likesCount      Int      // Contador de likes
reportsCount    Int      // Contador de reportes
```

**Reglas:**
- Máximo 500 caracteres por post
- Automáticamente moderado con OpenAI Moderation API
- Si moderationScore > 0.7 → auto-flagged
- Si reportsCount >= 3 → requiere revisión manual

### 💬 ForumComment (Comentario/Respuesta)

Respuestas a posts, mismas reglas que ForumPost:

```prisma
content         String   // Máx 500 caracteres
isEdited        Boolean
isDeleted       Boolean
isFlagged       Boolean
moderationScore Float?
likesCount      Int
reportsCount    Int
```

### 🚨 Report (Reporte)

Sistema de reportes para moderación comunitaria:

```prisma
reason      ReportReason  // SPAM, HARASSMENT, etc.
details     String?       // Detalles adicionales
status      ReportStatus  // PENDING, REVIEWED, RESOLVED, DISMISSED
reviewedBy  String?       // ID del moderador que revisó
reviewNote  String?       // Notas del moderador
```

**Razones de Reporte:**
- `SPAM` - Contenido spam o irrelevante
- `HARASSMENT` - Acoso o bullying
- `HATE_SPEECH` - Discurso de odio
- `INAPPROPRIATE_CONTENT` - Contenido inapropiado
- `MISINFORMATION` - Información falsa
- `OTHER` - Otra razón

**Estados:**
- `PENDING` - Esperando revisión
- `REVIEWED` - Revisado por moderador
- `RESOLVED` - Resuelto (acción tomada)
- `DISMISSED` - Descartado (sin acción)

## 🔄 Flujo de Moderación Automática

### 1. Creación de Post/Comentario

```
Usuario escribe mensaje (max 500 chars)
    ↓
Frontend: Validación de longitud
    ↓
Backend: Rate limiting (10 msg/min)
    ↓
OpenAI Moderation API check
    ↓
Si pasa (score < 0.7):
  - Guardar en DB
  - moderationScore guardado
  - isFlagged = false
    ↓
Si falla (score >= 0.7):
  - Guardar en DB
  - isFlagged = true
  - flagReason = categoría de OpenAI
  - Notificar moderadores
```

### 2. Sistema de Reportes

```
Usuario reporta contenido
    ↓
Report creado (status: PENDING)
    ↓
reportsCount++ en Post/Comment
    ↓
Si reportsCount >= 3:
  - isFlagged = true
  - Notificar moderadores
  - Auto-ocultar temporalmente
```

### 3. Revisión de Moderadores

```
Moderador revisa contenido flagged
    ↓
Decide acción:
  - RESOLVED: Ban usuario / Delete content
  - DISMISSED: Contenido OK, restore
    ↓
Actualizar reputation del autor
```

## 🕐 Sistema de Renovación Diaria

### Cron Job Configuration

```typescript
// Zona horaria: Australia/Sydney (AEDT/AEST)
// Ejecutar a las 00:00 cada día

1. Archivar foros actuales
   - isActive = false
   - isArchived = true

2. Crear nuevos foros
   - topic: DAILY_1, DAILY_2
   - startDate: hoy 00:00
   - endDate: hoy 23:59:59
   - isActive: true

3. Limpiar caché
```

### Implementación con Vercel Cron

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/renew-forums",
    "schedule": "0 14 * * *"  // 14:00 UTC = 00:00 Sydney (AEDT)
  }]
}
```

**Nota**: Ajustar según DST (Daylight Saving Time):
- AEDT (Verano): UTC+11 → Cron: 13:00 UTC
- AEST (Invierno): UTC+10 → Cron: 14:00 UTC

## 📈 Índices y Optimización

### Índices Principales

```sql
-- Búsqueda rápida de foros activos
CREATE INDEX idx_forum_active ON Forum(isActive, startDate);

-- Posts recientes en un foro
CREATE INDEX idx_post_forum_date ON ForumPost(forumId, createdAt DESC);

-- Posts flagged para moderación
CREATE INDEX idx_post_flagged ON ForumPost(isFlagged, createdAt DESC);

-- Reportes pendientes
CREATE INDEX idx_reports_pending ON Report(status, createdAt DESC);

-- Usuarios baneados
CREATE INDEX idx_user_banned ON User(isBanned, isActive);
```

### Queries Optimizados

```typescript
// Obtener foro activo del día
const forum = await prisma.forum.findFirst({
  where: {
    topic: 'DAILY_1',
    isActive: true,
    startDate: { lte: new Date() },
    endDate: { gte: new Date() }
  }
});

// Posts recientes (con autor)
const posts = await prisma.forumPost.findMany({
  where: {
    forumId,
    isDeleted: false
  },
  include: {
    author: {
      select: { nickname: true, reputation: true }
    },
    _count: {
      select: { comments: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 50
});
```

## 🔒 Reglas de Seguridad

### Rate Limiting

- Máximo 10 posts/comentarios por minuto por usuario
- Máximo 50 posts por día por usuario
- Máximo 5 reportes por hora por usuario

### Validaciones

- Nickname: 3-20 caracteres, alfanumérico + guión bajo
- Contenido: 1-500 caracteres
- Sin URLs en nicknames
- Sin palabras prohibidas en contenido

### Ban Automático

Usuario es baneado automáticamente si:
- Reputation cae por debajo de -50
- 5+ posts flagged en un día
- 10+ reportes confirmados

## 📱 Endpoints API Sugeridos

```
GET    /api/forums                    # Listar foros activos
GET    /api/forums/:id/posts          # Posts de un foro
POST   /api/forums/:id/posts          # Crear post
POST   /api/posts/:id/comments        # Crear comentario
POST   /api/posts/:id/like            # Like a post
POST   /api/posts/:id/report          # Reportar post
GET    /api/users/me                  # Perfil del usuario
PATCH  /api/users/me                  # Actualizar nickname
GET    /api/moderation/flagged        # Posts flagged (MOD only)
POST   /api/moderation/review/:id     # Revisar reporte (MOD only)
```

## 🎮 Features Adicionales Sugeridas

### Fase 2 (Futuro)

- [ ] Notificaciones en tiempo real (Pusher/Socket.io)
- [ ] Menciones con @nickname
- [ ] Formato Markdown básico
- [ ] Emojis y reacciones
- [ ] Búsqueda de posts
- [ ] Hilos de conversación (threading)
- [ ] Badges y achievements
- [ ] Ranking semanal de usuarios

### Fase 3 (Avanzado)

- [ ] Upload de imágenes (con moderación)
- [ ] Sistema de tags
- [ ] Filtros personalizados
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push

---

**Última actualización**: 2025-10-02
**Zona horaria base**: Australia/Sydney (AEDT/AEST)
**Versión del schema**: 1.0

