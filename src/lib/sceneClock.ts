// Reloj de simulación compartido: la escena 3D lo avanza y el bucle de control lo lee,
// para que posición renderizada y detección de captura usen exactamente el mismo instante.
export const sceneClock = { seconds: 0, running: true };
