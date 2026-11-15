import * as THREE from 'three';
import { mulberry32 } from '../../../lib/random';

// Texturas de bandas generadas en un canvas para los planetas de fondo. A esa distancia solo se
// aprecian las bandas y el color, así que no vale la pena descargar mapas reales.
interface BandedTextureOptions {
  base: string;
  bands: string[];
  seed: number;
  bandCount: number;
  noise: number;
}

export function createBandedTexture(options: BandedTextureOptions): THREE.CanvasTexture {
  const width = 256;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) return new THREE.CanvasTexture(canvas);

  const rng = mulberry32(options.seed);
  context.fillStyle = options.base;
  context.fillRect(0, 0, width, height);

  let y = 0;
  while (y < height) {
    const bandHeight = (height / options.bandCount) * (0.5 + rng());
    context.fillStyle = options.bands[Math.floor(rng() * options.bands.length)];
    context.globalAlpha = 0.35 + rng() * 0.4;

    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= width; x += 16) {
      context.lineTo(x, y + Math.sin((x / width) * Math.PI * 4 + rng()) * 2.5);
    }
    context.lineTo(width, y + bandHeight);
    for (let x = width; x >= 0; x -= 16) {
      context.lineTo(x, y + bandHeight + Math.sin((x / width) * Math.PI * 3) * 2.5);
    }
    context.closePath();
    context.fill();

    y += bandHeight;
  }

  context.globalAlpha = options.noise;
  for (let i = 0; i < 1800; i++) {
    const x = rng() * width;
    const spotY = rng() * height;
    const shade = Math.floor(rng() * 90);
    context.fillStyle = `rgb(${shade},${shade},${shade})`;
    context.fillRect(x, spotY, 1, 1);
  }
  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export const PLANET_TEXTURES: Record<string, BandedTextureOptions> = {
  Venus: { base: '#d8c08a', bands: ['#f0dcae', '#c2a673', '#e8d49b'], seed: 11, bandCount: 7, noise: 0.08 },
  Marte: { base: '#b4552f', bands: ['#d97b4a', '#8c3f22', '#e0a070'], seed: 23, bandCount: 5, noise: 0.14 },
  Júpiter: { base: '#cba07a', bands: ['#efd7b8', '#9d6b4a', '#e3b98c', '#7d4f33'], seed: 37, bandCount: 12, noise: 0.07 },
  Saturno: { base: '#d9c48f', bands: ['#f0e2bb', '#bfa773', '#e8d7a5'], seed: 53, bandCount: 9, noise: 0.06 },
};
