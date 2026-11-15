import { BackSide } from 'three';

export function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.3, 32, 32]} />
      <meshBasicMaterial color="#4fd1ff" transparent opacity={0.12} side={BackSide} />
    </mesh>
  );
}
