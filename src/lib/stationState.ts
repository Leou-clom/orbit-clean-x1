// Cinemática viva de la estación. El ángulo se integra frame a frame en vez de derivarse de
// velocidad_angular(altitud) × tiempo_simulado: con esa fórmula un cambio de altitud desplazaba
// el ángulo retroactivamente y la aproximación nunca convergía.
export interface LiveStation {
  altitudeKm: number;
  inclinationDeg: number;
  raanDeg: number;
  angleDeg: number;
}

export const liveStation: LiveStation = {
  altitudeKm: 408,
  inclinationDeg: 51.6,
  raanDeg: 0,
  angleDeg: 0,
};

export function resetStation(next: LiveStation): void {
  liveStation.altitudeKm = next.altitudeKm;
  liveStation.inclinationDeg = next.inclinationDeg;
  liveStation.raanDeg = next.raanDeg;
  liveStation.angleDeg = next.angleDeg;
}
