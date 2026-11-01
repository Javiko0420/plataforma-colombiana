# Política de autenticación y autorización

## Protocolos existentes

| Flujo | Formato | Duración | Renovación |
| --- | --- | --- | --- |
| Web | Cookie de NextAuth v4 | 24 horas | Ciclo de sesión de NextAuth |
| `/api/auth/mobile/sign-in` | Bearer compatible con NextAuth | 24 horas | No usa el refresh opaco |
| `/api/auth/mobile/login`, `/google`, `/apple` | JWT móvil propio | 15 minutos | Refresh opaco de 30 días con rotación |

`/api/auth/mobile/session` valida el Bearer compatible con NextAuth y consulta
el usuario actual. `/api/auth/mobile/refresh` recibe `{ refreshToken }` en JSON;
no renueva un token de NextAuth. `getAuthUser` conserva sus formatos originales:
cookie web o JWT móvil propio; no acepta cualquier Bearer por equivalencia.

## Reglas compartidas

- Una cuenta debe existir, estar activa y no estar suspendida para obtener
  acceso o ejecutar operaciones autenticadas. Se consulta su estado y rol
  actuales; los claims del token no bastan para autorizar.
- Los tres logins por contraseña utilizan `authenticateCredentials`: bcrypt
  contra un hash almacenado, sin contraseñas alternativas. Las cuentas OAuth
  sin hash deben utilizar su proveedor; no se crean contraseñas automáticamente.
- Cinco contraseñas incorrectas activan un bloqueo de 15 minutos. Los tres
  logins comparten contadores; la ventana vencida se reinicia y el éxito limpia
  los intentos. Los incrementos son atómicos, dentro de una transacción Prisma.
- El bloqueo temporal protege el login por contraseña. No bloquea OAuth,
  renovación ni sesiones previas. `isBanned` e `isActive` sí son globales.
- El limitador Redis existente se aplica a los tres logins. Si Redis falta o
  falla, conserva su comportamiento fail-open; no garantiza protección por IP
  durante una caída. Este cambio no modifica esa política de infraestructura.
- El acceso administrativo exige perfil completo, rol permitido para la acción
  y correo corporativo de `latinterritory.com` o `javiwarrior.com` en servidor.
  Las reglas de propiedad de los recursos siguen siendo independientes.

## OAuth

Google/Apple móviles resuelven primero la cuenta por `(provider, subject)` del
token verificado. Un usuario ya vinculado puede entrar con ese identificador
aunque Apple omita el correo en un acceso posterior.

Para crear una cuenta o una vinculación por correo, el correo debe proceder del
token firmado y tener su claim de verificación afirmativo. El correo de
`user.email` enviado por el cliente no se usa. La creación/vinculación es
transaccional y se comprueba la elegibilidad antes de escribir. El token de
identidad no se almacena como si fuera un access token del proveedor.

**Protección contra pre-hijacking.** El registro por contraseña no verifica la
propiedad del correo, así que cualquiera puede crear una cuenta con un correo
ajeno y elegir su contraseña. Por eso el móvil no vincula por correo una cuenta
que tenga contraseña y no tenga `emailVerified`: responde `409
ACCOUNT_LINK_REQUIRED` y el usuario debe entrar con su contraseña. Sí se
vinculan las cuentas sin contraseña (solo OAuth) y las que tienen el correo
verificado. Es el mismo criterio de la web, donde NextAuth rechaza la
vinculación por correo (`OAuthAccountNotLinked`). Un vínculo existente por
`(provider, subject)` sigue funcionando. Hoy no hay un flujo de vinculación
explícita (probar la contraseña y luego vincular); si se necesita, es trabajo
aparte.

## Bloqueos, cambios de rol y límites de revocación

La suspensión administrativa revoca los refresh tokens activos en la misma
transacción que el bloqueo y su auditoría. Las solicitudes protegidas consultan
el estado vigente; un JWT emitido antes de una suspensión no permite continuar
mientras la cuenta siga bloqueada. Las degradaciones usan el rol actual.

Esto no implementa revocación permanente de JWT stateless. Después de reactivar
una cuenta, un JWT anterior no vencido podría volver a ser válido. Los refresh
revocados no se reactivan. Para invalidar permanentemente todos los accesos
previos se requiere una versión de sesión o registro equivalente, con diseño y
migración aprobados por separado. El cambio de contraseña tampoco añade aquí
una revocación global de sesiones.

La comprobación ocurre al autorizar cada solicitud; no cancela operaciones que
ya estaban en curso al cambiar el estado de la cuenta. No se consultó producción
ni se determinó si hubo uso previo de las vías vulnerables.

## Pruebas locales

Las regresiones usan Vitest en Node, cuentas y tokens sintéticos, y mocks de
Prisma, proveedores, Redis y configuración de firma. Comprueban los contratos
de los handlers, los callbacks de NextAuth y los límites de autorización.
No sustituyen una prueba con PostgreSQL real, navegador o cliente Flutter.

Ejecutar `npm run test:auth`. El runner descarta las credenciales heredadas del
proceso y la configuración `vitest.auth.config.ts` desactiva la carga de `.env`.
