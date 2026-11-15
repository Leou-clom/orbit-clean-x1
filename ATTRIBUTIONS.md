# Procedencia de los recursos externos

Este proyecto incluye modelos y texturas descargados de terceros. Antes de publicar el
repositorio o el juego fuera del equipo hay que confirmar cada licencia.

## Modelos 3D — `public/models/`

| Archivo | Origen | Enlace | Estado de licencia |
| --- | --- | --- | --- |
| `dawn.glb` | NASA 3D Resources (NASA / Brian E. Kumanchik) | https://science.nasa.gov/3d-resources/dawn/ | **Por confirmar.** La página no declara términos de uso. |
| `clementine.glb` | NASA 3D Resources | https://science.nasa.gov/3d-resources/clementine/ | **Por confirmar.** Misma situación. |
| `astronaut.glb` | NASA 3D Resources (DigitalSpace Corporation) | https://science.nasa.gov/3d-resources/astronaut/ | **Por confirmar.** Descargado pero todavía sin usar en la escena. |

Los modelos de NASA suelen publicarse como dominio público, pero las fichas de
`science.nasa.gov` no lo dicen explícitamente. La referencia a revisar es el repositorio
oficial `nasa/NASA-3D-Resources` y las NASA Brand & Usage Guidelines.

## Texturas — `public/textures/`

| Archivo | Origen | Enlace |
| --- | --- | --- |
| `earth_atmos_2048.jpg` | Ejemplos de three.js (licencia MIT del repositorio) | https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets |
| `earth_clouds_1024.png` | Ejemplos de three.js | igual que arriba |
| `moon_1024.jpg` | Ejemplos de three.js | igual que arriba |

## Pendiente

La colección "Sci-Fi Satellite Collection" de Anima-Z en Sketchfab se propuso como nave
recolectora. No se incluye: requiere cuenta y la licencia es por modelo. Si el equipo
adquiere los derechos, basta con dejar el `.glb` en `public/models/` y cambiar la ruta en
`src/modules/orbital/components/Station.tsx`.

## Nombres de astronautas

`src/data/astronauts.ts` usa nombres de astronautas reales como homenaje. Los signos
vitales del juego son sintéticos y no representan datos de esas personas; la interfaz lo
declara explícitamente en el menú de Ayuda.

## Datos orbitales

Las altitudes e inclinaciones de la basura espacial reproducen las bandas de densidad
publicadas por NASA ODPO y el Space Environment Report de ESA. Cada objeto es sintético:
ninguno corresponde a un objeto del catálogo real.
