# 🇨🇴 Plataforma Colombiana

Una plataforma web moderna y segura para conectar emprendedores, productos únicos y la pasión colombiana en un solo lugar.

## 🌟 Características Principales

- **🏪 Directorio de Emprendimientos**: Descubre productos únicos y servicios de emprendedores colombianos
- **🔍 Búsqueda Avanzada**: Filtros por categoría, ubicación y más
- **🎨 Diseño Vibrante**: Colores inspirados en la cultura colombiana
- **🌙 Modo Oscuro/Claro**: Experiencia personalizada
- **🌐 Multiidioma**: Soporte para español e inglés
- **📱 Responsive**: Optimizado para todos los dispositivos
- **🔒 Seguridad Robusta**: Múltiples capas de protección
- **⚡ Alto Rendimiento**: Construido con Next.js 14

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd plataforma-colombiana

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma generate
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🏗️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos modernos

### Backend
- **Next.js API Routes** - Endpoints de API
- **Prisma ORM** - Manejo de base de datos
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js** - Autenticación

### Seguridad
- **Zod** - Validación de esquemas
- **bcryptjs** - Hash de contraseñas
- **Rate Limiting** - Protección contra abuso
- **Input Sanitization** - Prevención de XSS
- **Security Headers** - Protección HTTP

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Winston** - Sistema de logging
- **Error Handling** - Manejo centralizado de errores

## 📁 Estructura del Proyecto

```
plataforma-colombiana/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   ├── directorio/        # Páginas del directorio
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes básicos
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilidades y configuración
│   │   ├── auth.ts           # Configuración de NextAuth
│   │   ├── security.ts       # Utilidades de seguridad
│   │   ├── validations.ts    # Esquemas de validación
│   │   └── logger.ts         # Sistema de logging
│   └── types/                # Definiciones de TypeScript
├── prisma/
│   └── schema.prisma         # Esquema de base de datos
└── docs/                     # Documentación
```

## 🔒 Seguridad

Esta aplicación implementa múltiples capas de seguridad:

- ✅ **Autenticación robusta** con NextAuth.js
- ✅ **Validación de entrada** con Zod
- ✅ **Sanitización de datos** con DOMPurify
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Headers de seguridad** HTTP
- ✅ **Logging de eventos** de seguridad
- ✅ **Manejo centralizado** de errores
- ✅ **Protección CSRF** automática

Ver [SECURITY.md](./SECURITY.md) para más detalles.

## 🛠️ Desarrollo

### Comandos Disponibles
```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint

# Base de datos
npx prisma studio    # Abrir Prisma Studio
npx prisma generate  # Generar cliente de Prisma
npx prisma db push   # Aplicar cambios al esquema
```

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/plataforma_colombiana"

# Autenticación
NEXTAUTH_SECRET="tu-clave-secreta-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# Seguridad
BCRYPT_ROUNDS="12"
RATE_LIMIT_MAX="100"
```

Ver [DEVELOPMENT.md](./DEVELOPMENT.md) para la guía completa de desarrollo.

## 🚀 Deployment

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Manual
```bash
# Construir aplicación
npm run build

# Configurar base de datos de producción
npx prisma migrate deploy

# Iniciar aplicación
npm start
```

## 📊 Funcionalidades Futuras

### Próximas Implementaciones
- 🎵 **Emisoras Colombianas** - Streaming en vivo
- 🌤️ **Clima Nacional** - Información meteorológica
- ⚽ **Resultados Deportivos** - Liga Colombiana y más
- 💱 **Tasas de Cambio** - Información financiera
- 💬 **Foros de Discusión** - Comunidad de emprendedores
- 📺 **Videos de YouTube** - Contenido destacado
- 🔔 **Notificaciones** - Alertas en tiempo real

### APIs Externas a Integrar
- OpenWeatherMap (Clima)
- ExchangeRate-API (Tasas de cambio)
- YouTube Data API (Videos)
- Sports API (Resultados deportivos)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Seguir las convenciones de TypeScript
- Usar Prettier para formateo
- Escribir tests para nuevas funcionalidades
- Documentar cambios importantes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

## 📞 Soporte

- **Email**: support@plataformacolombia.co
- **Documentación**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/plataforma-colombiana/issues)

## 🙏 Agradecimientos

- Comunidad de emprendedores colombianos
- Contribuidores del proyecto
- Librerías y frameworks de código abierto utilizados

---

**Hecho con ❤️ para Colombia** 🇨🇴
