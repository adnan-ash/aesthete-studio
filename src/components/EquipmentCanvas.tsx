import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ProceduralAccessory({ isDark, accentColor, category }: { isDark: boolean, accentColor: string, category: string }) {
  const group = useRef<THREE.Group>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const detailMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2;
    }

    const targetBodyColor = new THREE.Color(isDark ? '#333333' : '#e0e0e0');
    const targetAccentColor = new THREE.Color(accentColor);
    
    if (bodyMatRef.current) {
       bodyMatRef.current.color.lerp(targetBodyColor, 0.1);
    }
    if (detailMatRef.current) {
       detailMatRef.current.color.lerp(targetAccentColor, 0.1);
    }
  });

  const renderGeometry = () => {
    switch (category) {
      case 'book':
        return (
          <>
            {/* Lamp Base */}
            <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.5, 0.6, 0.1, 32]} />
              <meshStandardMaterial ref={bodyMatRef} roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Lamp Arm */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.05, 0.05, 1.8, 16]} />
              <meshStandardMaterial color={isDark ? '#333333' : '#e0e0e0'} roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Lamp Head */}
            <mesh position={[0.4, 1.3, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
              <coneGeometry args={[0.3, 0.6, 32]} />
              <meshStandardMaterial ref={detailMatRef} roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Light bulb */}
            <mesh position={[0.25, 1.15, 0]} rotation={[0, 0, Math.PI / 4]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </>
        );
      case 'glasses':
        return (
          <>
            {/* Premium Leather Case */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.4, 0.8]} />
              <meshStandardMaterial ref={bodyMatRef} roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Case lid / wrap */}
            <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI/2]} castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.4, 1.8, 32, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color={isDark ? '#333333' : '#e0e0e0'} roughness={0.7} metalness={0.1} />
            </mesh>
            {/* Button */}
            <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
              <meshStandardMaterial ref={detailMatRef} roughness={0.2} metalness={0.9} />
            </mesh>
          </>
        );
      case 'watch':
        return (
          <>
            {/* Watch Winder Box */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial ref={bodyMatRef} roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Window */}
            <mesh position={[0, 0.5, 0.76]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
              <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} transmission={0.9} />
            </mesh>
            {/* Inside holder */}
            <mesh position={[0, 0.5, 0.6]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
              <meshStandardMaterial ref={detailMatRef} roughness={0.2} metalness={0.9} />
            </mesh>
          </>
        );
      case 'coffee':
      default:
        return (
          <>
            {/* Base */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.8, 1, 1, 32]} />
              <meshStandardMaterial ref={bodyMatRef} roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.8, 1.6, 32]} />
              <meshStandardMaterial color={isDark ? '#333333' : '#e0e0e0'} roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Hopper (Glass/Acrylic look) */}
            <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
              <coneGeometry args={[1, 1.2, 32]} />
              <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} transmission={0.9} />
            </mesh>
            {/* Dial / Details */}
            <mesh position={[0, 2, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
              <meshStandardMaterial ref={detailMatRef} roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[0, 2, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.4, 0.05]} />
              <meshStandardMaterial color="#222" roughness={0.2} />
            </mesh>
          </>
        );
    }
  };

  return (
    <group ref={group} position={[0, -1, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {renderGeometry()}
      </Float>
    </group>
  );
}

function AnimatedLights({ isDark, accentColor }: { isDark: boolean, accentColor: string }) {
  const spotRef = useRef<THREE.SpotLight>(null);
  const pointRef = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  
  useFrame(() => {
    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, isDark ? 0.3 : 0.6, 0.1);
    if (spotRef.current) spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, isDark ? 2 : 4, 0.1);
    if (pointRef.current) {
        pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, isDark ? 0.5 : 1, 0.1);
        pointRef.current.color.lerp(new THREE.Color(accentColor), 0.1);
    }
  });

  return (
    <>
       <ambientLight ref={ambientRef} intensity={0.3} />
       <spotLight ref={spotRef} position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
       <pointLight ref={pointRef} position={[-5, 5, -5]} intensity={0.5} />
    </>
  );
}

export default function EquipmentCanvas({ isDark, category = 'coffee', accentColor = '#ceb693' }: { isDark: boolean, category?: string, accentColor?: string }) {
  return (
    <div className="w-full h-[60vh] bg-transparent cursor-grab active:cursor-grabbing relative rounded-xl overflow-hidden pointer-events-auto">
      <Canvas camera={{ position: [0, 2, 8], fov: 40 }} shadows dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        
        <AnimatedLights isDark={isDark} accentColor={accentColor} />
        
        <ProceduralAccessory isDark={isDark} accentColor={accentColor} category={category} />
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2} far={4} color="#000000" />
        <Environment resolution={128}>
          <ambientLight intensity={0.8} />
          {/* Top key light */}
          <mesh position={[0, 8, 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          {/* Side soft light using the accent color */}
          <mesh position={[-6, 3, -2]} rotation={[0, Math.PI / 3, 0]}>
            <planeGeometry args={[8, 12]} />
            <meshBasicMaterial color={accentColor} toneMapped={false} />
          </mesh>
          {/* Subtle back reflection */}
          <mesh position={[6, 2, -4]} rotation={[0, -Math.PI / 3, 0]}>
            <planeGeometry args={[6, 10]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </Environment>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  );
}
