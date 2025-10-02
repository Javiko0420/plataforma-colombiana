# 🔐 Seguridad de API Keys

## ⚠️ IMPORTANTE: Protección de Credenciales

Este documento describe las mejores prácticas para el manejo seguro de API keys en la Plataforma Colombiana.

## 📋 Estado Actual de Seguridad

### ✅ Medidas de Protección Implementadas

1. **Archivo `.env` protegido**
   - ✅ Incluido en `.gitignore`
   - ✅ NO se sube al repositorio Git
   - ✅ Solo existe localmente en tu máquina

2. **Separación de configuraciones**
   - ✅ `env.example` - Plantilla pública sin credenciales reales
   - ✅ `.env` - Archivo privado con credenciales reales

3. **Variables de entorno en el servidor**
   - Las API keys se cargan desde variables de entorno
   - No se incluyen en el código compilado del cliente

## 🔑 API Keys Configuradas

### ExchangeRate-API
- **Estado**: ✅ Configurada
- **Tipo**: Paid Tier
- **Ubicación**: `.env` (archivo local, NO en Git)
- **Endpoints**: https://v6.exchangerate-api.com/v6/[YOUR-API-KEY]/...

## 🚨 Reglas de Seguridad Críticas

### ❌ NUNCA HAGAS ESTO:

1. ❌ Subir el archivo `.env` a Git
2. ❌ Compartir tu API key en chats, emails o documentos públicos
3. ❌ Hacer commit de credenciales en código
4. ❌ Usar la misma API key en múltiples proyectos no relacionados
5. ❌ Compartir screenshots que muestren API keys
6. ❌ Hardcodear API keys en el código fuente

### ✅ SIEMPRE HAZ ESTO:

1. ✅ Mantener `.env` en `.gitignore`
2. ✅ Usar variables de entorno para todas las credenciales
3. ✅ Rotar API keys periódicamente (cada 90 días recomendado)
4. ✅ Usar diferentes API keys para desarrollo y producción
5. ✅ Monitorear el uso de tus API keys
6. ✅ Revocar inmediatamente cualquier key comprometida

## 🔄 Rotación de API Keys

### Cuándo Rotar una API Key:

- ⚠️ **INMEDIATAMENTE** si sospechas que fue comprometida
- ⚠️ Si aparece en logs públicos o repositorios
- ⚠️ Si fue compartida accidentalmente
- 📅 De forma rutinaria cada 90 días

### Cómo Rotar una API Key:

1. Obtener nueva API key del proveedor
2. Actualizar el archivo `.env` local
3. En producción: actualizar las variables de entorno del hosting
4. Probar que todo funciona con la nueva key
5. Revocar la API key antigua en el dashboard del proveedor

## 🚀 Despliegue a Producción

### Configuración en Vercel/Netlify/Railway:

```bash
# En el dashboard de tu hosting, agregar:
EXCHANGE_RATE_API_KEY=tu-api-key-aquí
```

**NUNCA** configures las API keys directamente en archivos `.env` que se suban al repositorio.

## 📊 Monitoreo

### Qué Monitorear:

- Uso de la API (requests/mes)
- Errores de autenticación
- Picos inusuales de tráfico
- Requests desde IPs desconocidas (si el proveedor lo soporta)

### Dashboards Recomendados:

- **ExchangeRate-API**: https://www.exchangerate-api.com/dashboard
  - Revisa tu uso mensual
  - Configura límites de rate
  - Monitorea el historial de requests

## 🔒 Lista de Verificación de Seguridad

Antes de hacer commit, verifica:

- [ ] ¿El archivo `.env` está en `.gitignore`?
- [ ] ¿No hay API keys hardcodeadas en el código?
- [ ] ¿Las API keys solo están en variables de entorno?
- [ ] ¿Los logs no exponen información sensible?

Antes de desplegar a producción:

- [ ] ¿Configuraste las variables de entorno en el hosting?
- [ ] ¿Usas diferentes API keys para desarrollo y producción?
- [ ] ¿Configuraste los dominios permitidos en el dashboard de APIs?

## 🆘 En Caso de Compromiso

Si crees que tu API key fue comprometida:

1. **INMEDIATAMENTE** revoca la key en https://www.exchangerate-api.com/dashboard
2. Genera una nueva API key
3. Actualiza el archivo `.env` local
4. Actualiza las variables de entorno en producción
5. Monitorea el uso para detectar actividad sospechosa
6. Revisa los logs para entender cómo se comprometió

## 📞 Contactos de Soporte

- **ExchangeRate-API Support**: support@exchangerate-api.com
- **Documentación**: https://www.exchangerate-api.com/docs

## 📝 Notas Adicionales

- Este archivo (`SECURITY_APIS.md`) SÍ debe subirse a Git ya que no contiene información sensible
- Es una guía de referencia para el equipo
- Actualiza este documento si agregas nuevas APIs o cambias prácticas de seguridad

---

**Última actualización**: $(date)
**Responsable de seguridad**: Equipo de desarrollo

⚡ **Recuerda**: La seguridad es responsabilidad de todos. Si ves algo sospechoso, repórtalo inmediatamente.

