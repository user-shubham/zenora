
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { Group } from 'three'

const FloatingObjects = () => {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* Soft pastel colored spheres */}
      <Sphere args={[0.6, 32, 32]} position={[-4, 1, -5]}>
        <meshBasicMaterial color="#E5DEFF" transparent opacity={0.6} />
      </Sphere>
      
      <Sphere args={[0.8, 32, 32]} position={[5, -2, -8]}>
        <meshBasicMaterial color="#D3F4E5" transparent opacity={0.4} />
      </Sphere>
      
      <Sphere args={[1.2, 32, 32]} position={[2, 3, -10]}>
        <meshBasicMaterial color="#D3E4FD" transparent opacity={0.5} />
      </Sphere>
      
      <Sphere args={[0.7, 32, 32]} position={[-3, -2.5, -6]}>
        <meshBasicMaterial color="#FDE1D3" transparent opacity={0.6} />
      </Sphere>
      
      <Sphere args={[0.5, 32, 32]} position={[4, 0, -5]}>
        <meshBasicMaterial color="#E897B9" transparent opacity={0.3} />
      </Sphere>
    </group>
  )
}

const FloatingBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <FloatingObjects />
      </Canvas>
    </div>
  )
}

export default FloatingBackground
