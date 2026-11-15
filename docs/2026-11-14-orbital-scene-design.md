# Diseño: OrbitalScene.tsx — ORBIT-CLEAN X (persona 2)

**Fecha:** 2026-11-14
**Estado:** Aprobado por Adrian en brainstorming. Pendiente de implementación hasta que el repo `orbit-clean-x` esté disponible con `src/types/index.ts` real.

## Contexto

Escenario 3D educativo para el dashboard del hackathon, usando React Three Fiber + drei. Debe integrarse en el dashboard existente (no como página aparte) y consumir `DebrisObject[]` desde `src/types/index.ts` sin redefinir esa interfaz. En el momento de este diseño no existe acceso al repo real ni al archivo de tipos, así que el diseño aísla el 3D de la forma exacta de `DebrisObject` mediante un normalizador interno.

## Contrato público (fijo, no negociable)

```ts
interface OrbitalSceneProps {
  objects: DebrisObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
}
```

## 1. Árbol de componentes

```
OrbitalScene.tsx          ← wrapper: layout flex (Canvas 3D a la izquierda | InfoPanel fijo a la derecha)
├── <Canvas> (R3F)
│   ├── Lighting (ambient + directional azul/cian)
│   ├── Earth.tsx          ← esfera sólida + wireframe superpuesto (estilo "holograma de centro de control")
│   ├── Atmosphere.tsx     ← esfera translúcida más grande, glow tipo Fresnel simple
│   ├── Starfield.tsx      ← <Stars/> de @react-three/drei (procedural, sin texturas externas)
│   ├── OrbitRing.tsx × N  ← anillos simples a 2-3 radios "orbitales" simulados (no físicamente exactos)
│   ├── DebrisField.tsx    ← 50-200 meshes individuales (satélites+residuos); click → onSelectObject
│   └── <OrbitControls/>   ← de drei, con límites de zoom (minDistance/maxDistance)
└── InfoPanel.tsx          ← HTML normal (no R3F), columna fija a la derecha del canvas
```

Solo `OrbitalScene.tsx` conoce `DebrisObject`. Ningún componente de 3D lo importa directamente — todos reciben `OrbitalRenderData` ya normalizado.

## 2. Normalizador de datos

```ts
// lib/orbitalRenderData.ts
interface OrbitalRenderData {
  id: string;
  label: string;              // obj.name ?? obj.id
  typeLabel: string;          // obj.type ?? "desconocido"
  colorHex: string;           // lookup por typeLabel, color neutro si no coincide ninguno conocido
  orbitRadius: number;        // derivado determinísticamente de un hash del id, dentro de [MIN_RADIUS, MAX_RADIUS]
  angleOffset: number;        // idem, posición angular inicial en la órbita
  speed: number;              // idem, velocidad de animación visual (no física)
  simulatedAltitudeKm: number; // usa obj.altitude si existe; si no, valor derivado del hash, para mostrar "(simulado)"
  simulatedSpeedKms: number;   // idem para velocidad
}

function toRenderData(obj: DebrisObject): OrbitalRenderData
```

**Razón de diseño:** el contrato no promete campos de posición/velocidad reales, y las reglas de realismo del proyecto prohíben afirmar precisión orbital. Usar un hash determinístico del `id` da posiciones estables (mismo id → misma posición siempre) sin depender de campos que podrían no existir en el `DebrisObject` real. Si el tipo real trae altitud/velocidad verdaderas, solo se actualiza `toRenderData`; los componentes 3D no cambian.

El `InfoPanel` muestra `simulatedAltitudeKm` / `simulatedSpeedKms` etiquetados como "(simulado)", conforme a las reglas de realismo del proyecto (no afirmar precisión orbital real).

## 3. Interacción de selección

- `DebrisField` renderiza un `<mesh>` de baja poligonización por objeto (icosahedron o box simple).
- `onClick={(e) => { e.stopPropagation(); onSelectObject(obj.id); }}` por mesh.
- El resaltado del objeto seleccionado se anima con **un único `useFrame` dentro de `DebrisField`** que recorre un array de refs y solo pulsa/ilumina el mesh cuyo `id === selectedObjectId` — no un `useFrame` por objeto individual (más barato con 50-200 objetos).
- Geometría y materiales se crean una sola vez con `useMemo` y se comparten entre meshes (pocas variantes de color según `typeLabel`), evitando crear 50-200 geometrías/materiales distintos.

## 4. Rendimiento

- `useMemo(() => objects.map(toRenderData), [objects])` — se recalcula solo si cambia la prop `objects`.
- Ninguna asignación de objetos/arrays nuevos dentro de `useFrame`.
- Con 50-200 objetos (rango confirmado por el equipo), meshes individuales son adecuados. Si el conteo real creciera mucho más, solo se reemplaza el interior de `DebrisField` por `InstancedMesh` con picking por `instanceId` — la API pública de `OrbitalScene` no cambia.

## 5. Estilo visual (decidido con mockups)

- **Tierra:** esfera sólida azul/cian + segundo mesh wireframe superpuesto rotando lento (opción "holograma de centro de control").
- **Atmósfera:** esfera más grande, material translúcido con glow tipo Fresnel simplificado.
- **Fondo:** `<Stars/>` de drei.
- **Órbitas:** anillos simples, explícitamente simplificados (no elipses físicamente exactas).
- **Layout del InfoPanel:** columna fija a la derecha del canvas (no overlay flotante), dentro del propio `OrbitalScene.tsx`.

## 6. Estructura de archivos

```
src/modules/orbital/
├── OrbitalScene.tsx          ← componente público (contrato fijo)
├── components/
│   ├── Earth.tsx
│   ├── Atmosphere.tsx
│   ├── Starfield.tsx
│   ├── OrbitRing.tsx
│   ├── DebrisField.tsx
│   └── InfoPanel.tsx
├── lib/
│   ├── orbitalRenderData.ts   ← toRenderData() + hash determinístico
│   └── constants.ts           ← colores por tipo, radios orbitales, límites de cámara
└── types.ts                   ← OrbitalRenderData (interno; NO sustituye a DebrisObject)
```

Ningún archivo fuera de `src/modules/orbital/` se modifica. `OrbitalScene.tsx` es el único punto de integración con el dashboard.

## 7. Plan de verificación incremental

Construir y probar con `npm run dev` en este orden, uno por uno:

1. `Starfield` + `Earth` — confirmar render y rotación.
2. `Atmosphere` sobre `Earth` — confirmar el glow.
3. `OrbitRing` (anillos estáticos) — confirmar posiciones visuales.
4. `lib/orbitalRenderData.ts` (función pura, sin UI) — revisión manual de salida.
5. `DebrisField` con datos normalizados, sin selección — confirmar 50-200 objetos sin caída notable de FPS.
6. Click → `onSelectObject` + resaltado — confirmar selección visual.
7. `InfoPanel` con datos del seleccionado, incluyendo "(simulado)".
8. Integración completa en `OrbitalScene.tsx` dentro del dashboard real.

En cada paso: revisar consola distinguiendo errores reales de warnings antes de avanzar.

## Riesgos / decisiones abiertas para cuando llegue el repo real

- **`src/types/index.ts` real:** si `DebrisObject` no tiene `name`/`type` (solo `id` y otros campos), el normalizador usa fallback a `id` para el label y color neutro — no bloquea el diseño, solo se ajusta `toRenderData`.
- **Conteo real de objetos:** confirmado en 50-200 por el equipo; si cambia sustancialmente, reevaluar instancing (ver sección 4).
