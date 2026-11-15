import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { DebrisObjectType } from '../../../types/orbital';
import { mulberry32 } from '../../../lib/random';

// Formas de muy pocos polígonos, una por tipo. Cada tipo se dibuja con un InstancedMesh, así que
// todo el campo son cuatro llamadas de dibujo aunque haya cientos de objetos.

// Los poliedros de three vienen sin índice y las cajas con él; mergeGeometries exige que todas
// coincidan, así que se normalizan antes de fusionar.
function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const flat = parts.map((part) => {
    const result = part.index ? part.toNonIndexed() : part;
    if (result !== part) part.dispose();
    return result;
  });
  const merged = mergeGeometries(flat, false);
  if (!merged) return flat[0];
  for (const part of flat) part.dispose();
  merged.computeVertexNormals();
  return merged;
}
function irregularAsteroid(): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(1, 2);
  const position = geometry.getAttribute('position');
  const rng = mulberry32(7);
  const vertex = new THREE.Vector3();

  // Deformación en dos escalas: bultos grandes y luego cráteres pequeños sobre ellos.
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const lumps = 1 + Math.sin(vertex.x * 2.3) * 0.18 + Math.cos(vertex.y * 3.1) * 0.14 + Math.sin(vertex.z * 2.7) * 0.16;
    const craters = 0.9 + rng() * 0.2;
    vertex.normalize().multiplyScalar(lumps * craters * (0.78 + rng() * 0.1));
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function satelliteShape(): THREE.BufferGeometry {
  const body = new THREE.BoxGeometry(0.9, 0.8, 1.1);

  const panelLeft = new THREE.BoxGeometry(2.1, 0.06, 0.75);
  panelLeft.translate(-1.6, 0, 0);
  const panelRight = panelLeft.clone();
  panelRight.translate(3.2, 0, 0);

  const dish = new THREE.ConeGeometry(0.45, 0.5, 7, 1, true);
  dish.rotateX(Math.PI / 2);
  dish.translate(0, 0, 0.8);

  return merge([body, panelLeft, panelRight, dish]);
}

function rocketBodyShape(): THREE.BufferGeometry {
  const tube = new THREE.CylinderGeometry(0.55, 0.55, 2.2, 8, 1, true);
  const nozzle = new THREE.ConeGeometry(0.55, 0.7, 8);
  nozzle.rotateX(Math.PI);
  nozzle.translate(0, -1.4, 0);
  const cap = new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.translate(0, 1.1, 0);

  const merged = merge([tube, nozzle, cap]);
  merged.rotateZ(Math.PI / 2);
  return merged;
}

// Chatarra retorcida: un núcleo irregular con una placa doblada y un trozo de larguero, que es como
// se ve un fragmento real de satélite roto.
function fragmentShape(): THREE.BufferGeometry {
  const rng = mulberry32(19);

  const core = new THREE.DodecahedronGeometry(0.75, 0);
  const corePosition = core.getAttribute('position');
  const vertex = new THREE.Vector3();
  for (let i = 0; i < corePosition.count; i++) {
    vertex.fromBufferAttribute(corePosition, i);
    vertex.multiplyScalar(0.6 + rng() * 0.75);
    corePosition.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  const plate = new THREE.BoxGeometry(1.5, 0.05, 0.85);
  plate.rotateZ(0.5);
  plate.rotateY(0.7);
  plate.translate(0.55, 0.35, -0.2);

  const strut = new THREE.BoxGeometry(0.12, 1.3, 0.12);
  strut.rotateX(0.9);
  strut.translate(-0.45, -0.3, 0.3);

  return merge([core, plate, strut]);
}

export function createDebrisGeometries(): Record<DebrisObjectType, THREE.BufferGeometry> {
  const fragment = fragmentShape();
  return {
    asteroid: irregularAsteroid(),
    satellite: satelliteShape(),
    rocket_body: rocketBodyShape(),
    debris: fragment,
    unknown: fragment.clone(),
  };
}
