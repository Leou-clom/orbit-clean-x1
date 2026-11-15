# Procedencia de los recursos externos

Este proyecto incluye modelos y texturas descargados de terceros. Las licencias se
verificaron el **15 de noviembre de 2026** y permiten publicar el juego; las condiciones
que impone NASA están recogidas más abajo y cumplidas en la interfaz.

## Modelos 3D — `public/models/`

| Archivo | Origen | Enlace | Estado de licencia |
| --- | --- | --- | --- |
| `dawn.glb` | NASA 3D Resources (NASA / Brian E. Kumanchik) | https://science.nasa.gov/3d-resources/dawn/ | **Confirmada.** Uso libre con atribución (ver abajo). |
| `clementine.glb` | NASA 3D Resources | https://science.nasa.gov/3d-resources/clementine/ | **Confirmada.** Mismas condiciones. |

### Qué dice NASA, verificado

Las fichas de `science.nasa.gov` no declaran términos de uso, pero las dos fuentes
oficiales que sí lo hacen son concluyentes:

- El repositorio `nasa/NASA-3D-Resources` afirma sobre estos recursos: *"These assets are
  free and without copyright"*, y remite a las normas de uso de medios.
- Las NASA Media Usage Guidelines
  (https://www.nasa.gov/nasa-brand-center/images-and-media/) indican que el contenido de
  NASA empleado en modelos tridimensionales **no está sujeto a copyright en Estados
  Unidos**, y autorizan expresamente su uso educativo o informativo, incluidas
  *"computer graphical simulations and Internet Web pages"*.

**Condiciones que impone NASA y cómo las cumple el proyecto:**

| Condición | Cómo se cumple |
| --- | --- |
| Citar a NASA como fuente del material | Bloque «Créditos» en `Esc → Ayuda` (`src/modules/options/OptionsMenu.tsx`) |
| No insinuar que NASA respalda el proyecto | La misma pestaña declara que NASA no lo patrocina ni lo respalda |
| No usar la insignia ni el logotipo de NASA | El juego no muestra ningún logotipo de NASA; están protegidos y quedan fuera del dominio público |
| Material de terceros: aclararlo con su titular | Resuelto retirando el único modelo afectado (ver abajo) |

### Modelo retirado

`astronaut.glb` procedía de **DigitalSpace Corporation**, un tercero ajeno a NASA. NASA
advierte que su propio uso de material de terceros no concede derechos a nadie más y que
hay que dirigirse al titular del copyright. El modelo nunca llegó a usarse en la escena,
así que se eliminó del proyecto el 15 de noviembre de 2026 en lugar de gestionar esa
autorización. Si alguna vez hace falta un astronauta, hay que aclarar antes la licencia
con DigitalSpace Corporation.

> Esto es un resumen de los términos publicados por NASA, no un dictamen jurídico. Para un
> uso comercial o con publicidad aplican reglas distintas: el contacto indicado por NASA es
> el equipo de marca (`nasa-merchandise-&-brand-team@mail.nasa.gov`).

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
