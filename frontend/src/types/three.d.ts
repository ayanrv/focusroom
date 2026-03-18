import { Object3DNode } from '@react-three/fiber'
import { extend } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D>
  }
}