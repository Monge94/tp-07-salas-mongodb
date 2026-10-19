# Trabajo práctico 06

## Proyecto de partida y cambios

El proyecto parte de una copia funcional del TP 05 `tp-05-salas-middleware`. Se conservaron las vistas EJS, el layout, el CSS, las cuatro reservas semilla, Morgan, el ID `BIB-` por solicitud, la medición hasta `finish`, la validación del POST, las rutas y sus respuestas HTTP. La carpeta anterior no se modificó; al crear esta copia no se trasladaron `.git` ni `node_modules`.

Antes de refactorizar se ejecutó `npm start` en TP 05 y se observaron estas respuestas. Para el POST válido se comprobó también el GET posterior y el incremento compartido en `/estado`.

| Solicitud en TP 05 | Resultado observado | Evidencia |
| --- | --- | --- |
| `GET /` | 200 | Vista de inicio dentro del layout, ID visible en el pie |
| `GET /estado` | 200 | `{"servicio":"activo","reservas":4,"solicitudId":"BIB-0002"}` |
| `GET /reservas` | 200 | Listado con cuatro reservas |
| `GET /reservas/nueva` | 200 | Formulario de reservas dentro del layout |
| `GET /reservas/1` | 200 | Detalle de la primera reserva |
| `GET /reservas/999` | 404 | Vista HTML «Reserva no encontrada» |
| `POST /reservas` vacío | 400 | Muestra errores obligatorios; el total permanece en cuatro |
| `POST /reservas` válido | 302 | `Location: /reservas`; el GET siguiente es 200, muestra cinco y `/estado` informa cinco |
| `GET /css/estilos.css` | 200 | Hoja CSS servida, 1986 bytes |
| `GET /url-inexistente` | 404 | Vista HTML final «Página no encontrada» |

El POST válido usado para la comparación fue seguido por el GET del listado y el GET de `/estado` en la misma ejecución; esos cambios eran temporales y se pierden al reiniciar el proceso.

## Instalación y ejecución

Requisitos: Node.js y npm. Desde la raíz de esta carpeta:

```bash
npm install
npm start
```

La aplicación escucha en <http://localhost:3000> por defecto. Para detenerla, usar `Ctrl+C`.

## Configuración del entorno

`src/configuracion.js` lee `PORT` y `NODE_ENV` desde `process.env` al iniciar. Si `PORT` no está definido, escucha en el puerto 3000. Se aceptan únicamente enteros entre 1 y 65535; cualquier otro valor impide el arranque y muestra un mensaje explícito. Morgan usa `dev` salvo que `NODE_ENV=production`, caso en que usa `combined`; esto sólo cambia el formato del registro.

`.env.example` contiene valores de ejemplo no secretos. `npm start` no requiere `.env` y no carga ese archivo automáticamente. Si se desea usar un `.env` local, se pueden exportar las variables en la terminal o iniciar con `node --env-file=.env src/index.js` (requiere una versión de Node que admita `--env-file`). `.env` no se versiona.

## Mapa de módulos y dependencias

| Módulo | Responsabilidad |
| --- | --- |
| `src/index.js` | Declara la semilla, crea una instancia del servicio, lee configuración, crea la app y ejecuta `listen` |
| `src/configuracion.js` | Valida y convierte `PORT`; deriva el formato Morgan de `NODE_ENV` |
| `src/app.js` | Configura Express, conserva el pipeline, monta routers y define el 404 final |
| `src/rutas/aplicacion.js` | Relaciona `/` y `/estado` con el controlador de aplicación |
| `src/controladores/aplicacion.js` | Renderiza el inicio y responde el estado consultando el servicio |
| `src/rutas/reservas.js` | Declara caminos relativos y asigna middleware/controladores |
| `src/controladores/reservas.js` | Lee parámetros, prepara datos de vista, renderiza, responde 404 y redirige |
| `src/servicios/reservas.js` | Único dueño del arreglo en memoria; lista, busca, cuenta y crea reservas |
| `src/middleware/solicitudes.js` | Asigna el ID `BIB-` y mide hasta el evento `finish` |
| `src/middleware/reservas.js` | Prepara la sección del área y valida el POST |
| `src/dominio/reservas.js` | Define las salas y turnos admitidos compartidos por formulario y validador |
| `src/config/base-datos.js` | Configura DNS para Node y conecta/desconecta Mongoose usando `MONGODB_URI` |
| `src/modelos/reserva.js` | Define el esquema `Reserva` y su colección MongoDB `reservas` |
| `scripts/comprobar-conexion.js` | Comprueba Atlas sin crear documentos y cierra la conexión |
| `scripts/crear-reserva.js` | Guarda una reserva ficticia por ejecución y muestra el `_id` confirmado |
| `scripts/listar-reservas.js` | Lee los documentos persistidos y muestra el total |

El servicio no usa `req` ni `res`: su trabajo es administrar datos y no decidir cómo se transportan o presentan en HTTP. El controlador conoce Express y traduce parámetros y resultados del servicio a vistas, JSON, redirecciones y estados HTTP. Las rutas de reservas son relativas (`/`, `/nueva`, `/:id`) porque `app.js` monta ese router bajo `/reservas`; por eso la ruta completa de detalle resulta `/reservas/:id`. `/nueva` está antes que `/:id`.

`index.js` crea los cuatro datos semilla y entrega esa semilla al servicio. El servicio mantiene la única colección mutable compartida por listado, detalle, `/estado` y creación. Cada alta desaparece al reiniciar Node.js, y se vuelve a cargar la semilla original.

## Pipeline y contrato de rutas

Se conserva este orden:

```text
Morgan -> identificarSolicitud -> medirDuracion -> layouts -> static
       -> urlencoded -> json -> rutas de aplicación -> router /reservas -> 404
```

Morgan está primero, así que registra todas las solicitudes que llegan a Express, incluidos recursos estáticos. `identificarSolicitud` y `medirDuracion` también se instalan antes de `static`, por lo que miden los recursos encontrados, las rutas inexistentes y los errores de validación. La medición se escribe al completar `finish` e incluye ID, método, URL, estado y milisegundos.

| Método | Ruta completa | Respuesta |
| --- | --- | --- |
| `GET` | `/` | 200, inicio |
| `GET` | `/estado` | 200, JSON `servicio`, cantidad actual e ID de solicitud |
| `GET` | `/reservas` | 200, listado |
| `GET` | `/reservas/nueva` | 200, formulario |
| `GET` | `/reservas/:id` | 200, detalle existente; 404 HTML si no existe |
| `POST` | `/reservas` | 302 al listado si es válido; 400 con formulario y errores si no |
| `GET` | `/css/estilos.css` | 200, recurso estático |
| `GET` | Otra URL | 404 HTML |

`express.urlencoded` va antes del router y del validador. El camino inválido responde 400 y no ejecuta `next()`; el válido coloca la reserva normalizada en `req.reservaValidada` y continúa al controlador, que la guarda mediante el servicio.

## Matriz antes/después

Resultados de las comprobaciones de esta entrega; se repitió el mismo contrato sobre la copia. Los casos de POST se enviaron en una misma instancia para comprobar sus efectos entre sí; después del reinicio, `/estado` volvió a informar las cuatro reservas iniciales.

| Caso | TP 05 antes | TP 06 después |
| --- | --- | --- |
| Inicio | 200, vista de inicio, ID visible | 200, misma vista y layout, ID visible |
| Estado inicial | 200, cuatro reservas, ID `BIB-` | 200; tras reinicio: cuatro reservas e ID `BIB-0001` |
| Listado | 200, cuatro reservas | 200, mismos cuatro datos; tras alta válida, lista cinco |
| Formulario | 200, mismos campos y selecciones | 200, los seis campos presentes |
| POST vacío | 400, errores visibles, sin alta | 400, alerta visible; el estado sigue en cuatro |
| Sala no permitida | 400, sin alta | 400; el estado sigue en cuatro |
| Email sin `@` | 400, sin alta | 400; el estado sigue en cuatro |
| Personas 0, 7 o fraccionarias | 400, sin alta | Los tres valores devuelven 400; el estado sigue en cuatro |
| POST válido y seguimiento | 302; GET siguiente 200 y cinco reservas | 302 con `Location: /reservas`; GET siguiente 200 con cinco y `/estado` informa cinco |
| Detalle inexistente | 404 HTML, servidor disponible | 404 HTML; el servidor siguió respondiendo |
| CSS | 200 | 200, 1986 bytes |
| URL inexistente | 404 HTML | 404 HTML final |
| Reinicio | Regresa a cuatro reservas semilla | `/estado` respondió 200 con cuatro reservas tras reiniciar |
| Puerto alternativo | No medido en TP 05 | Con `PORT=3147 NODE_ENV=production`, `/` y `/estado` respondieron 200 |
| Puerto inválido | No medido en TP 05 | Con `PORT=0`, el proceso terminó con código 1 y el mensaje indicó el rango 1-65535 |

En ambos procesos se observaron líneas Morgan y `[medirDuracion]` para 200, 302, 400 y 404. Como ejemplo de la línea de base, TP 05 registró `POST /reservas 400`, `POST /reservas 302`, y `GET /reservas/999 404`, cada uno seguido por su línea de medición con ID `BIB-`. En TP 06 también se comprobaron ambas líneas para esas respuestas; con `NODE_ENV=production`, Morgan mostró el formato `combined` mientras que `[medirDuracion]` conservó su formato propio. Los tiempos concretos varían entre ejecuciones.

## Formato y análisis estático

Se incorporaron Prettier, ESLint y `@eslint/js` como dependencias de desarrollo. ESLint aplica las reglas recomendadas a los archivos CommonJS de `src` y `scripts`.

```bash
npm run format
npm run check
```

`npm run format` formatea ambos directorios. `npm run check` ejecuta `format:check` y luego `lint` sobre ambos.

## Unidad 7: persistencia con MongoDB Atlas

La copia de trabajo se llama `tp-06-salas-modular` y parte del proyecto funcional del TP 05 `tp-05-salas-middleware`; la carpeta de partida no se modifica. La aplicación web se conserva tal como estaba y continúa usando sus cuatro reservas semilla y altas en memoria. Los tres programas de `scripts/` son una práctica de persistencia independiente y no modifican el comportamiento HTTP.

La dependencia de persistencia es Mongoose. El clúster previsto es Atlas Free M0, pero su creación y conexión no se pudieron confirmar en este entorno porque no hay una URI privada configurada. La URI se configura exclusivamente en `MONGODB_URI`; `.env.example` es una plantilla pública con marcadores y `.env` real es privado e ignorado por Git. En Atlas, crear un clúster gratuito M0, un usuario de base de datos y una regla de acceso IP autorizada para el equipo/red. Copiar la plantilla, reemplazar sus marcadores por la URI ofrecida por Atlas y conservar sus opciones. No pegar credenciales en el código, README ni terminal compartida.

Versiones disponibles al implementar: Node.js v24.19.0, npm 11.17.0 y Mongoose 9.11.2. Preparar desde la raíz:

```powershell
npm install
Copy-Item .env.example .env
# Editar .env localmente con la URI privada de Atlas.
node --env-file=.env scripts/comprobar-conexion.js
node --env-file=.env scripts/crear-reserva.js
node --env-file=.env scripts/listar-reservas.js
npm run format
npm run check
npm start
```

`src/config/base-datos.js` aplica `dns.setServers(["8.8.8.8", "1.1.1.1"])` a la resolución DNS del proceso Node antes de conectar. Si la red o las reglas del curso no autorizan esos resolutores, acordar y documentar los resolutores adecuados; no se modifica la configuración DNS del sistema operativo. El error de conexión informa tipo, código y operación de resolución cuando estén disponibles, sin imprimir la URI. Un error de configuración por variable ausente o prefijo incorrecto termina con código distinto de cero. La prueba de conexión no accede al modelo ni crea reservas.

El esquema `Reserva` asocia explícitamente el modelo con la colección `reservas`. `estudiante` y `fecha` son textos obligatorios con espacios externos eliminados; `email` es obligatorio, recortado y debe contener `@`; `sala` y `turno` son obligatorios y limitados a las opciones del dominio; `personas` es un número entero de 1 a 6. No se validan el formato completo del email, fechas imposibles, fechas futuras, solapamientos, cupos compartidos ni reservas repetidas. No se requiere índice único.

MongoDB asigna un `_id` ObjectId. El programa de creación confirma el valor sólo después de `create()` exitoso; asignar un identificador a un objeto en memoria no prueba que haya sido escrito. Cada ejecución de creación agrega un documento nuevo, incluso si sus campos coinciden. El listado ejecuta `find()` sin semillas ni escrituras y también presenta correctamente una colección vacía con cantidad 0.

### Evidencia y matriz de verificación

Resultados de ejecución que se pudieron comprobar en este entorno:

| Caso | Resultado observado |
| --- | --- |
| Versión de Node | v24.19.0 |
| Versiones de npm y Mongoose | 11.17.0 y 9.11.2 |
| `npm run format` y `npm run check` | Correctos; Prettier y ESLint cubren `src` y `scripts` |
| Modelo sin conexión: reserva válida | Aceptada |
| Modelo sin conexión: estudiante vacío, email sin `@`, sala/turno no permitidos, fecha vacía y personas 0, 7, 2.5 o texto | Los 9 casos separados fueron rechazados; sin conexión ni escrituras |
| Aplicación HTTP en memoria | Inicio/estado/listado/CSS 200; POST inválido 400; POST válido 302 y contador de 4 a 5; URL desconocida 404 |
| URI ausente | Mensaje explícito de configuración y código de salida 1; sin mensaje de éxito |
| Conexión real a Atlas | Pendiente: requiere una URI privada y acceso de red configurados localmente |
| Persistencia entre procesos, `_id` de Atlas y Data Explorer | Pendiente: no se inventa evidencia ni se crea una cuenta/documento de Atlas desde este entorno |
| Casos negativos contra la base individual | Pendiente de ejecutar con la conexión privada; utilizar documentos ficticios y anotar cantidades antes/después |

Antes de entregar, completar la evidencia desde la misma base individual: anotar la cantidad inicial del listado; ejecutar creación y guardar su `_id`; esperar que el proceso termine; listar desde otro proceso y confirmar el mismo `_id` y cantidad inicial + 1; listar otra vez y comprobar que el total no cambió. En Atlas Data Explorer, comprobar ese `_id` en `reservas_salas_u7.reservas`. Registrar las cantidades y adjuntar capturas/transcripción sin URI, credenciales ni datos personales.

Para las pruebas negativas, alterar temporalmente un campo por ensayo en el objeto ficticio de `scripts/crear-reserva.js` y restaurarlo después: estudiante vacío, email sin `@`, sala o turno no permitido, fecha vacía, personas 0, 7 y 2.5 (por separado) y texto no numérico. Cada una debe fallar sin aumentar el total; el texto no numérico debe producir un error de conversión/validación. No borrar documentos para simular una colección vacía; probarlo sólo en una base de laboratorio nueva autorizada. Para distinguir autenticación de configuración, se puede sustituir temporalmente la contraseña por un valor incorrecto sin caracteres reservados, sin cambiar la contraseña de Atlas; restaurar después la URI válida y repetir la prueba de conexión. Revisar si la terminal define `MONGODB_URI`, pues puede prevalecer sobre `.env`.

### Continuidad HTTP

El servidor no utiliza el modelo MongoDB: `/`, `/estado`, listado, detalle y POST continúan basándose en el servicio en memoria. Por eso las reservas de los scripts no aparecen en las vistas y las altas web se pierden al reiniciar. Esta separación conserva el contrato probado del TP 06; la integración de persistencia al sitio queda para la unidad 8. Confirmar al entregar que `npm start` mantiene inicio, `/estado`, listado, redirección y creación válida en memoria, rechazo 400 sin alta para formulario inválido, CSS y 404.

El repositorio debe contener el manifiesto, `package-lock.json`, `.env.example`, modelo, conexión, scripts y este README. `.env`, `node_modules`, credenciales y datos personales no se publican.
