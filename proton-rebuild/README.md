# PROTON — paquete de demostración para Render

Esta versión conserva la interfaz, los estilos, las animaciones, el teclado virtual, el símbolo P y el favicon del proyecto aprobado. Los cambios de esta edición son de configuración del servidor para facilitar las pruebas en hosting.

**Uso exclusivo de demostración.** Utilizá únicamente el usuario y la clave ficticios que configures en Render. No ingreses ni solicites credenciales bancarias reales. Este proyecto no pertenece a una entidad financiera ni se conecta con sistemas bancarios. El servidor compara la cuenta ficticia configurada y no guarda las claves ingresadas ni un historial de intentos.

## Subirlo a Render (plan Free para pruebas)

1. Descomprimí `PROTON_LISTO_PARA_RENDER.zip`.
2. Abrí la carpeta `proton-rebuild`. Entrá dentro de ella y verificá que veas `server.js`, `package.json` y la carpeta `public`.
3. En GitHub, creá un repositorio nuevo llamado `proton-demo-portal`. Dejalo **Private** si solo vos necesitás acceder al código.
4. En el repositorio, elegí **Add file → Upload files** y arrastrá TODO el contenido de `proton-rebuild` (no subas una carpeta `proton-rebuild` dentro de otra). Confirmá con **Commit changes**.
5. Entrá en https://dashboard.render.com/ y creá una cuenta o iniciá sesión.
6. En Render, elegí **New + → Web Service** y conectá GitHub. Autorizá el acceso al repositorio `proton-demo-portal`.
7. Completá la configuración así:
   - **Name:** `proton-demo-portal` (o un nombre disponible)
   - **Language / Runtime:** `Node`
   - **Branch:** `main`
   - **Root Directory:** dejalo vacío o `.`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
8. En **Environment Variables**, agregá estas dos variables con valores inventados solo para la prueba:
   - `DEMO_USERNAME` = por ejemplo `usuario_prueba`
   - `DEMO_PASSWORD` = elegí una clave ficticia larga, que no uses en ningún otro sitio
9. En **Advanced**, si aparece el campo **Health Check Path**, escribí `/health`.
10. Hacé clic en **Create Web Service** y esperá a que el despliegue termine con estado **Live**.
11. Abrí la dirección `https://...onrender.com` que Render muestra arriba. Probá el acceso con el usuario y la clave ficticios que configuraste en el paso 8.

## Importante sobre el plan gratuito

Render Free puede apagar el servicio después de 15 minutos sin visitas y el primer acceso posterior puede tardar alrededor de un minuto. Su disco es temporal: la base SQLite puede reiniciarse o perderse al reiniciar, suspender o volver a desplegar el servicio. Para pruebas visuales esto alcanza; no lo uses como almacenamiento permanente. La cuenta de prueba se vuelve a crear desde las variables de entorno cuando el servicio inicia.

## Ejecutar localmente (opcional)

Requiere Node.js 20 o 22.

```bash
npm install
DEMO_USERNAME=usuario_prueba DEMO_PASSWORD=clave_ficticia_larga npm start
```

Abrí http://localhost:3000. Para comprobar el servidor, abrí http://localhost:3000/health.
