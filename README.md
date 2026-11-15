# ORBIT-CLEAN X

Simulación educativa de retirada de basura espacial en órbita baja terrestre, hecha con
Vite + React + TypeScript y React Three Fiber.

## Arrancar

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción
npm run preview  # sirve la compilación de producción
npm run lint
```

## Cómo se juega

Antes de cada misión diseñas la nave: brazo, blindaje, paneles, bodega, propulsión y
lanzador. Ninguna opción es gratis — más blindaje pesa más, y más masa obliga a un lanzador
más caro o te deja sin alcance para la zona de trabajo. Hay que cuadrar masa, potencia y
presupuesto antes de poder lanzar.

Después pilotas la estación y retiras basura espacial antes de que se agote el tiempo.

- `W` / `S` — subir o bajar la altitud
- `A` / `D` — girar el plano orbital
- `←` / `→` — adelantar o retrasar la fase en la órbita
- `↑` / `↓` — cambiar la inclinación
- `E` — piloto automático de aproximación
- `Espacio` — iniciar la maniobra de captura
- `Esc` — opciones, logros, tripulación y ayuda (pausa la simulación)

Capturar no es instantáneo: hay que superar una maniobra (sincronía, estabilización,
secuencia del brazo o cierre de pinza). Cada retirada recupera un 5 % de casco; chocar con
basura o asteroides que no son tu objetivo lo daña y altera los signos vitales del
astronauta.

## Estructura

```
public/
  models/      modelos .glb de NASA (ver ATTRIBUTIONS.md)
  textures/    texturas de planetas (ver ATTRIBUTIONS.md)
src/
  lib/         utilidades compartidas: mecánica orbital, reloj de simulación,
               estado vivo de la estación, calidad gráfica, aleatoriedad determinista
  data/        población de basura espacial, 20 misiones, astronautas
  types/       tipos compartidos entre módulos del equipo
  modules/
    orbital/   escena 3D: Tierra, Luna, planetas, campo de basura, estación
    pilot/     consola de pilotaje y telemetría
    missions/  briefing, resultados y motor de puntaje
    capture/   maniobras de captura
    crew/      astronauta animado y signos vitales
    health/    panel de salud (módulo de persona 4, sin modificar)
    achievements/, options/, tutorial/
  App.tsx      dueño del estado global y bucle de juego
docs/          diseño aprobado del módulo orbital
```

## Realismo: qué es real y qué no

- **Real:** la velocidad orbital y el periodo se calculan con las fórmulas de una órbita
  circular; las bandas de altitud e inclinación siguen las distribuciones publicadas por
  NASA ODPO y ESA; la Luna está a su distancia real.
- **Simulado:** cada objeto es sintético, no un objeto del catálogo real. Los tamaños están
  exagerados para que se vean. El Sol y los planetas del fondo no están a escala ni a
  distancia real. El tiempo corre acelerado ×90. Los signos vitales son ficticios y no son
  mediciones médicas.

## Rendimiento

El campo se dibuja con `InstancedMesh` por tipo de objeto, así que cientos de objetos caben
en pocas llamadas de dibujo. Los modelos detallados solo se cargan para la nave y para el
objeto fijado. En `Esc → Rendimiento` hay tres niveles de calidad, y el nivel inicial se
detecta según el número de núcleos de la máquina.
