export type QualityLevel = 'bajo' | 'medio' | 'alto';

export interface QualitySettings {
  label: string;
  description: string;
  debrisCount: number;
  starCount: number;
  maxPixelRatio: number;
  detailedModels: boolean;
  antialias: boolean;
}

export const QUALITY: Record<QualityLevel, QualitySettings> = {
  bajo: {
    label: 'Bajo',
    description: 'Para equipos básicos o portátiles sin gráfica dedicada.',
    debrisCount: 220,
    starCount: 600,
    maxPixelRatio: 1,
    detailedModels: false,
    antialias: false,
  },
  medio: {
    label: 'Medio',
    description: 'Equilibrio entre densidad del campo y fluidez.',
    debrisCount: 420,
    starCount: 1200,
    maxPixelRatio: 1.25,
    detailedModels: true,
    antialias: false,
  },
  alto: {
    label: 'Alto',
    description: 'Campo completo y modelos detallados de NASA.',
    debrisCount: 620,
    starCount: 1800,
    maxPixelRatio: 1.5,
    detailedModels: true,
    antialias: true,
  },
};

// Los equipos básicos suelen tener pocos núcleos y gráfica integrada.
export function detectQuality(): QualityLevel {
  // Un móvil puede declarar 8 núcleos y aun así no mover 620 objetos a 60 fps:
  // su GPU y su límite térmico mandan más que el número de núcleos.
  const coarsePointer =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (coarsePointer) return 'bajo';

  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 4) return 'bajo';
  if (cores <= 8) return 'medio';
  return 'alto';
}
