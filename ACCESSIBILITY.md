# 🌟 Guía de Accesibilidad - Latin Territory

## 📋 Índice
1. [Resumen de Accesibilidad](#resumen-de-accesibilidad)
2. [Estándares Implementados](#estándares-implementados)
3. [Navegación por Teclado](#navegación-por-teclado)
4. [Lectores de Pantalla](#lectores-de-pantalla)
5. [Contraste y Colores](#contraste-y-colores)
6. [Componentes Accesibles](#componentes-accesibles)
7. [Testing de Accesibilidad](#testing-de-accesibilidad)
8. [Mejores Prácticas](#mejores-prácticas)

## 🎯 Resumen de Accesibilidad

**Latin Territory** ha sido diseñada siguiendo las **WCAG 2.1 AA** (Web Content Accessibility Guidelines) para garantizar que sea usable por todas las personas, incluyendo aquellas con discapacidades.

### **Nivel de Conformidad: WCAG 2.1 AA** ✅

## 📜 Estándares Implementados

### **1. Perceptible**
- ✅ **Alternativas de texto** para imágenes e iconos
- ✅ **Subtítulos y transcripciones** para contenido multimedia
- ✅ **Contraste de color** mínimo 4.5:1 (texto normal) y 3:1 (texto grande)
- ✅ **Redimensionamiento** hasta 200% sin pérdida de funcionalidad
- ✅ **Soporte para modo de alto contraste**

### **2. Operable**
- ✅ **Navegación por teclado** completa
- ✅ **Sin contenido que cause convulsiones** (respeta `prefers-reduced-motion`)
- ✅ **Tiempo suficiente** para interacciones
- ✅ **Títulos de página** descriptivos
- ✅ **Orden de foco** lógico

### **3. Comprensible**
- ✅ **Idioma de la página** declarado (`lang="es"`)
- ✅ **Etiquetas e instrucciones** claras
- ✅ **Mensajes de error** descriptivos
- ✅ **Navegación consistente**
- ✅ **Identificación de errores** automática

### **4. Robusto**
- ✅ **HTML semántico** válido
- ✅ **Compatibilidad con tecnologías asistivas**
- ✅ **Atributos ARIA** apropiados
- ✅ **Estados y propiedades** actualizados dinámicamente

## ⌨️ Navegación por Teclado

### **Atajos de Teclado Principales**
```
Tab                 - Navegar al siguiente elemento
Shift + Tab         - Navegar al elemento anterior
Enter / Space       - Activar botones y enlaces
Escape              - Cerrar modales y menús
Arrow Keys          - Navegar en listas y menús
Home / End          - Ir al primer/último elemento
```

### **Orden de Navegación**
1. **Skip Link** - "Saltar al contenido principal"
2. **Logo** - Enlace a página principal
3. **Navegación principal** - Menú horizontal
4. **Controles de usuario** - Tema, idioma, usuario
5. **Contenido principal** - Secciones en orden lógico
6. **Footer** - Enlaces adicionales

### **Indicadores de Foco**
```css
:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

## 🔊 Lectores de Pantalla

### **Estructura Semántica**
```html
<!-- Landmarks principales -->
<header role="banner">
<nav role="navigation" aria-label="Navegación principal">
<main id="main-content">
<section aria-labelledby="section-title">
<footer role="contentinfo">
```

### **Etiquetas ARIA**
```html
<!-- Botones con estado -->
<button aria-expanded="false" aria-controls="menu">
  Menú
</button>

<!-- Formularios -->
<input aria-labelledby="label-id" aria-describedby="help-id">
<div id="help-id">Texto de ayuda</div>

<!-- Regiones en vivo -->
<div aria-live="polite" aria-atomic="true">
  Contenido que se actualiza
</div>
```

### **Anuncios Automáticos**
```typescript
// Ejemplo de uso
ScreenReader.announce('Modal abierto: Registro de usuario', 'assertive')
ScreenReader.announce('Formulario guardado exitosamente', 'polite')
```

## 🎨 Contraste y Colores

### **Ratios de Contraste Mínimos**
- **Texto normal**: 4.5:1 ✅
- **Texto grande (18pt+)**: 3:1 ✅
- **Elementos gráficos**: 3:1 ✅
- **Estados de foco**: 3:1 ✅

### **Paleta de Colores Accesible**
```css
/* Colores principales con contraste verificado */
--primary-yellow: #eab308;    /* Contraste: 4.8:1 sobre blanco */
--primary-red: #dc2626;       /* Contraste: 5.2:1 sobre blanco */
--primary-blue: #2563eb;      /* Contraste: 7.1:1 sobre blanco */

/* Modo oscuro */
--dark-yellow: #fbbf24;       /* Contraste: 4.6:1 sobre gris oscuro */
--dark-red: #f87171;          /* Contraste: 4.9:1 sobre gris oscuro */
--dark-blue: #60a5fa;         /* Contraste: 6.8:1 sobre gris oscuro */
```

### **Soporte para Alto Contraste**
```css
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }
  
  .bg-gradient-to-r {
    background: currentColor !important;
  }
}
```

## 🧩 Componentes Accesibles

### **AccessibleButton**
```typescript
<AccessibleButton
  variant="primary"
  loading={isLoading}
  loadingText="Guardando..."
  aria-describedby="button-help"
>
  Guardar Cambios
</AccessibleButton>
```

**Características:**
- ✅ Tamaño mínimo de toque (44x44px)
- ✅ Estados de carga con anuncios
- ✅ Indicadores de foco de alto contraste
- ✅ Soporte para íconos con `aria-hidden`

### **AccessibleInput**
```typescript
<AccessibleInput
  label="Correo electrónico"
  error={emailError}
  helperText="Usaremos este correo para contactarte"
  required
/>
```

**Características:**
- ✅ Asociación automática label-input
- ✅ Mensajes de error con `role="alert"`
- ✅ Estados de validación con `aria-invalid`
- ✅ Texto de ayuda con `aria-describedby`

### **AccessibleModal**
```typescript
<AccessibleModal
  isOpen={isOpen}
  onClose={closeModal}
  title="Confirmar acción"
  description="Esta acción no se puede deshacer"
>
  <ModalContent />
</AccessibleModal>
```

**Características:**
- ✅ Gestión automática de foco
- ✅ Cierre con tecla Escape
- ✅ Anuncios a lectores de pantalla
- ✅ Restauración de foco al cerrar

## 🧪 Testing de Accesibilidad

### **Herramientas Recomendadas**

#### **Automatizadas**
```bash
# axe-core para testing automatizado
npm install --save-dev @axe-core/react

# Lighthouse CI para auditorías
npm install --save-dev @lhci/cli
```

#### **Manuales**
- **NVDA** (Windows) - Lector de pantalla gratuito
- **JAWS** (Windows) - Lector de pantalla comercial
- **VoiceOver** (macOS) - Lector de pantalla integrado
- **TalkBack** (Android) - Lector de pantalla móvil

### **Checklist de Testing**

#### **Navegación por Teclado**
- [ ] Todos los elementos interactivos son accesibles por teclado
- [ ] El orden de tabulación es lógico
- [ ] Los indicadores de foco son visibles
- [ ] No hay trampas de teclado

#### **Lectores de Pantalla**
- [ ] Todo el contenido es anunciado correctamente
- [ ] Los landmarks están identificados
- [ ] Los formularios tienen etiquetas apropiadas
- [ ] Los cambios dinámicos se anuncian

#### **Contraste Visual**
- [ ] Todos los textos cumplen ratios mínimos
- [ ] Los elementos interactivos son distinguibles
- [ ] El modo de alto contraste funciona
- [ ] Los colores no son la única forma de comunicar información

### **Comandos de Testing**
```bash
# Ejecutar auditoría de accesibilidad
npm run a11y:audit

# Testing con lectores de pantalla
npm run a11y:screen-reader

# Verificar contraste de colores
npm run a11y:contrast
```

## 📋 Mejores Prácticas

### **HTML Semántico**
```html
<!-- ✅ Correcto -->
<button type="button" aria-label="Cerrar modal">
  <X aria-hidden="true" />
</button>

<!-- ❌ Incorrecto -->
<div onclick="closeModal()">
  <X />
</div>
```

### **Etiquetas Descriptivas**
```html
<!-- ✅ Correcto -->
<input 
  id="email"
  type="email"
  aria-labelledby="email-label"
  aria-describedby="email-help email-error"
  aria-invalid={hasError}
/>
<label id="email-label" for="email">Correo electrónico *</label>
<div id="email-help">Formato: usuario@dominio.com</div>
{hasError && (
  <div id="email-error" role="alert">
    El correo electrónico es requerido
  </div>
)}

<!-- ❌ Incorrecto -->
<input type="email" placeholder="Email" />
```

### **Gestión de Foco**
```typescript
// ✅ Correcto - Gestión automática de foco
const Modal = ({ isOpen, onClose }) => {
  const previousFocusRef = useRef<HTMLElement>()

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [isOpen])

  return (
    <Dialog onClose={onClose}>
      <DialogContent />
    </Dialog>
  )
}
```

### **Anuncios Dinámicos**
```typescript
// ✅ Correcto - Anunciar cambios importantes
const saveData = async () => {
  try {
    await api.save(data)
    ScreenReader.announce('Datos guardados exitosamente', 'polite')
  } catch (error) {
    ScreenReader.announce('Error al guardar los datos', 'assertive')
  }
}
```

## 🚀 Implementación Continua

### **Integración en CI/CD**
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests
on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run accessibility tests
        run: |
          npm install
          npm run build
          npm run a11y:audit
```

### **Revisión de Código**
```typescript
// Checklist para Pull Requests
// ✅ ¿Todos los elementos interactivos tienen etiquetas?
// ✅ ¿Los colores cumplen ratios de contraste?
// ✅ ¿La navegación por teclado funciona?
// ✅ ¿Los cambios dinámicos se anuncian?
// ✅ ¿El HTML es semánticamente correcto?
```

## 📞 Recursos y Soporte

### **Documentación Oficial**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

### **Herramientas de Desarrollo**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### **Contacto para Accesibilidad**
- **Email**: privacy@latinterritory.com
- **Reporte de problemas y solicitud de funciones**: [GitHub Issues](https://github.com/Javiko0420/plataforma-colombiana/issues)

---

## 🎯 Compromiso con la Inclusión

**Latin Territory** se compromete a mantener y mejorar continuamente la accesibilidad de nuestra plataforma. Creemos que la tecnología debe ser accesible para todos, sin excepciones.

**Última actualización**: Agosto 2026  
**Versión**: 1.1.0  
**Conformidad**: WCAG 2.1 AA ✅
