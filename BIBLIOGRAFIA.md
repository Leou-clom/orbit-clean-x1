# ORBIT-CLEAN X — Bibliografía y fuentes de NASA

Todo lo que el proyecto toma de NASA y de otras organizaciones espaciales, con su enlace,
su licencia y el sitio exacto del código donde se usa.

**Todos los enlaces se comprobaron el 15 de noviembre de 2026** y respondían correctamente
en esa fecha.

---

## 1. Qué es real y qué es simulado

Esta distinción es la base de todo lo que sigue, y conviene leerla antes que las tablas.

**Procede de NASA y de otras fuentes oficiales:** los modelos 3D de las sondas, las familias
de basura espacial y los sucesos que las originaron, los regímenes orbitales que ocupan, las
constantes físicas de la Tierra y la distancia a la Luna.

**Es sintético y está declarado como tal dentro del juego** (`Esc → Ayuda`): cada fragmento
concreto que aparece en pantalla es generado por el programa y **no corresponde a un objeto
del catálogo real**. Lo real es la familia a la que pertenece y la órbita que ocupa. Los
tamaños están exagerados para que se vean, el Sol y los planetas del fondo no están a escala
ni a distancia real, el tiempo corre acelerado ×90 y los signos vitales del astronauta son
ficticios.

---

## 2. Modelos 3D — NASA 3D Resources

| Archivo | Objeto | Autor acreditado | Página oficial |
| --- | --- | --- | --- |
| `public/models/dawn.glb` | Sonda **Dawn** (misión a Vesta y Ceres) | NASA / Brian E. Kumanchik | https://science.nasa.gov/3d-resources/dawn/ |
| `public/models/clementine.glb` | Sonda **Clementine** (misión lunar SDIO/NASA, 1994) | NASA / Brian E. Kumanchik | https://science.nasa.gov/3d-resources/clementine/ |

Repositorio oficial del que proceden: https://github.com/nasa/NASA-3D-Resources

**Dónde se usan:** `src/modules/orbital/components/Station.tsx` (la Dawn hace de estación
recolectora que pilota el jugador) y `src/modules/orbital/components/HeroModel.tsx` (la
Clementine aparece como objeto detallado al fijar un objetivo).

### Modelo descartado y por qué

`astronaut.glb` procedía de **DigitalSpace Corporation**, un tercero ajeno a NASA. Las normas
de NASA advierten de que su propio uso de material de terceros no concede derechos a nadie
más y que hay que dirigirse al titular del copyright. Como el modelo nunca llegó a usarse en
la escena, se retiró del proyecto el 15 de noviembre de 2026 en lugar de tramitar esa
autorización.

---

## 3. Licencia de los modelos de NASA

Las fichas de `science.nasa.gov` **no declaran términos de uso**. Las dos fuentes oficiales
que sí lo hacen son estas:

| Fuente | Qué establece |
| --- | --- |
| Repositorio `nasa/NASA-3D-Resources` | *"These assets are free and without copyright"* |
| NASA Media Usage Guidelines | El contenido de NASA empleado en modelos tridimensionales no está sujeto a copyright en Estados Unidos. Autoriza el uso educativo o informativo, incluidas *"computer graphical simulations and Internet Web pages"* |

Normas de uso completas: https://www.nasa.gov/nasa-brand-center/images-and-media/

**Condiciones que impone NASA y cómo las cumple este proyecto:**

| Condición | Cómo se cumple |
| --- | --- |
| Citar a NASA como fuente del material | Bloque «Créditos» en `Esc → Ayuda` |
| No insinuar que NASA respalda el proyecto | La misma pestaña declara que NASA no lo patrocina ni lo respalda |
| No usar la insignia ni el logotipo de NASA | El juego no muestra ningún logotipo de NASA. La insignia y el logotipo están protegidos y quedan fuera del dominio público |
| Material de terceros: aclararlo con su titular | Resuelto retirando el único modelo afectado |

> Esto resume los términos publicados por NASA; no es un dictamen jurídico. Un uso comercial
> o con publicidad se rige por reglas distintas. El contacto que indica NASA para esos casos
> es su equipo de marca: `nasa-merchandise-&-brand-team@mail.nasa.gov`.

---

## 4. Basura espacial: familias reales del catálogo

Las designaciones son nombres reales del catálogo NASA/NORAD, y cada una está colocada en el
régimen orbital que ocupa de verdad. Están definidas en `src/data/debrisPopulation.ts`.

| Designación | Suceso que la originó | Altitud (km) | Inclinación |
| --- | --- | --- | --- |
| FENGYUN 1C DEB | Ensayo antisatélite chino sobre Fengyun-1C (2007) | 780–900 | 98,8° |
| COSMOS 2251 DEB | Colisión Iridium 33 / Cosmos 2251 (2009) | 700–850 | 74° |
| IRIDIUM 33 DEB | Colisión Iridium 33 / Cosmos 2251 (2009) | 720–860 | 86,4° |
| COSMOS 1408 DEB | Ensayo antisatélite ruso sobre Cosmos 1408 (2021) | 440–620 | 82,6° |
| SL-16 R/B | Segunda etapa Zenit-2 abandonada | 820–870 | 71° |
| SL-8 R/B | Etapa superior Kosmos-3M abandonada | 1400–1550 | 74° |
| NOAA 16 DEB | Fragmentación del satélite meteorológico NOAA 16 (2015) | 840–890 | 99° |
| DELTA 1 DEB | Fragmentaciones de etapas Delta | 950–1300 | 99,5° |
| ENVISAT | Satélite de observación de ESA, inactivo desde 2012 | 760–780 | 98,4° |
| METEOR 2-08 DEB | Fragmentación de un satélite meteorológico soviético | 900–1000 | 82,5° |
| THORAD AGENA D DEB | Fragmentación de una etapa Thorad-Agena D | 1000–1120 | 101° |
| ARIANE 5 R/B | Etapa superior Ariane 5 abandonada | 600–800 | 7° |
| TITAN 3C TRANSTAGE DEB | Fragmentación de etapas Transtage cerca de la órbita geoestacionaria | 35500–35900 | 2° |
| BREEZE-M DEB | Fragmentación de etapas Briz-M en órbita de transferencia | 1500–2000 | 49° |

Las cuatro primeras concentran buena parte de los fragmentos rastreados en órbita baja.

A estas se suma `NEO FRAGMENT`, un fragmento rocoso en tránsito: **esta categoría es
inventada** y existe solo como obstáculo de juego.

### Fuentes de los regímenes orbitales y las bandas de densidad

| Fuente | Organización | Enlace |
| --- | --- | --- |
| Orbital Debris Program Office (ODPO) | NASA | https://orbitaldebris.jsc.nasa.gov/ |
| Orbital Debris Quarterly News | NASA ODPO | https://orbitaldebris.jsc.nasa.gov/quarterly-news/ |
| Space Environment Report (informe anual) | ESA | https://www.esa.int/Space_Safety/Space_Debris |
| Space Environment Statistics (DISCOSweb) | ESA | https://sdup.esoc.esa.int/discosweb/statistics/ |
| CelesTrak (elementos orbitales NORAD) | CelesTrak, Dr. T. S. Kelso | https://celestrak.org/ |

El pico de densidad que reproduce el juego, entre **780 y 900 km**, procede de las
distribuciones publicadas por estas fuentes. El informe de ESA de 2026 cifra en unos **68 450**
los objetos mayores de 10 cm en órbita, de los que unos 11 300 son satélites activos.

> **Nota sobre precisión:** las altitudes e inclinaciones de la tabla son aproximaciones de los
> regímenes publicados, no entradas copiadas del catálogo. El juego **no consume datos TLE en
> vivo**; conectarlo a CelesTrak sería el siguiente paso para que los objetos fueran reales uno
> a uno.

---

## 5. Constantes físicas y astronómicas

Definidas en `src/lib/orbitalMath.ts`.

| Constante | Valor | Qué es |
| --- | --- | --- |
| `EARTH_RADIUS_KM` | 6371 km | Radio medio de la Tierra |
| `MU_EARTH` | 398 600,4418 km³/s² | Parámetro gravitacional estándar de la Tierra |
| Distancia a la Luna | 384 400 km | Distancia media Tierra–Luna, reproducida a escala real |

La velocidad y el periodo orbital se calculan con las fórmulas de una órbita circular a partir
de `MU_EARTH`, no con valores escritos a mano. Comprobado: a 482 km de altitud el juego da
7,63 km/s y 94,1 minutos de periodo.

---

## 6. Texturas — no son de NASA

| Archivo | Origen | Licencia |
| --- | --- | --- |
| `earth_atmos_2048.jpg` | Ejemplos de three.js | MIT |
| `earth_clouds_1024.png` | Ejemplos de three.js | MIT |
| `moon_1024.jpg` | Ejemplos de three.js | MIT |

Repositorio: https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets

Conviene no atribuirlas a NASA: proceden del repositorio de three.js y se usan bajo su
licencia MIT.

---

## 7. Astronautas

`src/data/astronauts.ts` usa nombres de astronautas reales como homenaje. **Los signos vitales
del juego son sintéticos y no representan datos de estas personas**, y la interfaz lo declara
de forma explícita.

| Nombre | Agencia | Por qué aparece |
| --- | --- | --- |
| Valentina Tereshkova | Programa espacial soviético | Primera mujer en el espacio, Vostok 6 (1963) |
| Yuri Gagarin | Programa espacial soviético | Primer ser humano en el espacio, Vostok 1 (1961) |
| Mae Jemison | NASA | Primera mujer afroamericana en el espacio, STS-47 (1992) |
| Ellen Ochoa | NASA | Primera mujer hispana en el espacio, STS-56 (1993) |
| Franklin Chang Díaz | NASA | Siete vuelos espaciales, récord compartido |
| Pedro Duque | ESA | Primer astronauta español, STS-95 y Misión Cervantes |
| Chris Hadfield | Agencia Espacial Canadiense | Comandante de la ISS, Expedición 35 |
| Samantha Cristoforetti | ESA | Primera comandante europea de la ISS, Expedición 68 |
| Soichi Noguchi | JAXA | Voló en transbordador, Soyuz y Crew Dragon |
| Sally Ride | NASA | Primera estadounidense en el espacio, STS-7 (1983) |

Las normas de NASA señalan que el nombre y la imagen de astronautas y empleados **en activo**
no pueden usarse con fines comerciales ni promocionales. Este proyecto es educativo y sin ánimo
de lucro, y ninguna de las personas de la lista está en servicio activo en NASA.

---

## 8. El desafío de NASA Space Apps

| Desafío | Enlace |
| --- | --- |
| Space Mission Design Game (el elegido) | https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/ |
| Build a Junior Astronaut Mission Trainer (descartado) | https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/ |

---

## 9. Lista completa de enlaces

**NASA**

- NASA 3D Resources (repositorio): https://github.com/nasa/NASA-3D-Resources
- Modelo 3D de Dawn: https://science.nasa.gov/3d-resources/dawn/
- Modelo 3D de Clementine: https://science.nasa.gov/3d-resources/clementine/
- Normas de uso de imágenes y medios: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Orbital Debris Program Office: https://orbitaldebris.jsc.nasa.gov/
- Orbital Debris Quarterly News: https://orbitaldebris.jsc.nasa.gov/quarterly-news/
- Desafío Space Mission Design Game: https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/

**ESA**

- Space Debris / Space Environment Report: https://www.esa.int/Space_Safety/Space_Debris
- Space Environment Statistics (DISCOSweb): https://sdup.esoc.esa.int/discosweb/statistics/

**Otras**

- CelesTrak (elementos orbitales NORAD): https://celestrak.org/
- Texturas de three.js: https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets

---

*Documento verificado el 15 de noviembre de 2026. Ver también `ATTRIBUTIONS.md` para el estado
de licencia de cada recurso.*
