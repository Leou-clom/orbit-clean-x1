import { Stars } from '@react-three/drei';

export function Starfield({ count }: { count: number }) {
  return <Stars radius={80} depth={40} count={count} factor={3} saturation={0} fade speed={0} />;
}
