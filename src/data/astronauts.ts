export interface AstronautProfile {
  name: string;
  agency: string;
  credit: string;
}

// Astronautas reales. El personaje lleva su nombre como homenaje: los signos vitales del juego
// son sintéticos y no representan datos de estas personas.
export const ASTRONAUTS: AstronautProfile[] = [
  { name: 'Valentina Tereshkova', agency: 'Programa espacial soviético', credit: 'Primera mujer en el espacio, Vostok 6 (1963)' },
  { name: 'Yuri Gagarin', agency: 'Programa espacial soviético', credit: 'Primer ser humano en el espacio, Vostok 1 (1961)' },
  { name: 'Mae Jemison', agency: 'NASA', credit: 'Primera mujer afroamericana en el espacio, STS-47 (1992)' },
  { name: 'Ellen Ochoa', agency: 'NASA', credit: 'Primera mujer hispana en el espacio, STS-56 (1993)' },
  { name: 'Franklin Chang Díaz', agency: 'NASA', credit: 'Siete vuelos espaciales, récord compartido' },
  { name: 'Pedro Duque', agency: 'ESA', credit: 'Primer astronauta español, STS-95 y Misión Cervantes' },
  { name: 'Chris Hadfield', agency: 'Agencia Espacial Canadiense', credit: 'Comandante de la ISS, Expedición 35' },
  { name: 'Samantha Cristoforetti', agency: 'ESA', credit: 'Primera comandante europea de la ISS, Expedición 68' },
  { name: 'Soichi Noguchi', agency: 'JAXA', credit: 'Voló en transbordador, Soyuz y Crew Dragon' },
  { name: 'Sally Ride', agency: 'NASA', credit: 'Primera estadounidense en el espacio, STS-7 (1983)' },
];

export function pickAstronaut(): AstronautProfile {
  return ASTRONAUTS[Math.floor(Math.random() * ASTRONAUTS.length)];
}
