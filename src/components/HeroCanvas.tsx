import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const THEME_COLORS = {
  dark: {
    podBody: new THREE.Color('#1f1612'), // Dark espresso brown
    podAccent: new THREE.Color('#d88147'), // Caramel accent
    pedestal1: new THREE.Color('#0f0a08'),
    pedestal2: new THREE.Color('#1c130f'),
    ring: new THREE.Color('#ffffff'),
    lights: {
      spotAccent: '#d88147'
    }
  },
  light: {
    podBody: new THREE.Color('#ede3d5'), // Creamy latte
    podAccent: new THREE.Color('#c4682c'), // Burnt orange / mocha
    pedestal1: new THREE.Color('#e0d5c4'),
    pedestal2: new THREE.Color('#f0e6d2'),
    ring: new THREE.Color('#5c3826'),
    lights: {
      spotAccent: '#c4682c'
    }
  }
};

function ProceduralProduct({ 
  isDark, 
  category, 
  accentColor,
  materialFinish = 'standard',
  customScale = 1.0,
  isZen = false
}: { 
  isDark: boolean, 
  category: string, 
  accentColor: string,
  materialFinish?: string,
  customScale?: number,
  isZen?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const accentMats = useRef<THREE.MeshBasicMaterial[]>([]);

  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const userRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isZen) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousPointer.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousPointer.current.x;
      const deltaY = e.clientY - previousPointer.current.y;
      
      userRotation.current.y += deltaX * 0.007;
      userRotation.current.x += deltaY * 0.007;

      // Clamp vertical rotation (X axis) to prevent flipping upside down
      userRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, userRotation.current.x));

      previousPointer.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isZen]);

  const target = useRef({
     position: new THREE.Vector3(0, 0, 0),
     scale: new THREE.Vector3(1, 1, 1),
     rotation: new THREE.Euler(0, 0, 0)
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const scrolled = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollProgress = windowHeight > 0 ? scrolled / windowHeight : 0;
    
    // Transform Animation
    if (isZen) {
       // Slow drifting orbit in Zen Mode
       target.current.position.set(0, Math.sin(state.clock.elapsedTime * 0.8) * 0.2, 0);
       target.current.scale.set(1.6, 1.6, 1.6).multiplyScalar(customScale);
       
       if (!isDragging.current) {
         // Auto spin slowly when idle
         userRotation.current.y += 0.004;
         // Slowly self-center vertical angle back to 0 when idle
         userRotation.current.x = THREE.MathUtils.lerp(userRotation.current.x, 0, 0.015);
       }
       
       target.current.rotation.set(
         userRotation.current.x + Math.sin(state.clock.elapsedTime * 0.2) * 0.05, 
         userRotation.current.y, 
         Math.cos(state.clock.elapsedTime * 0.3) * 0.03
       );
    }
    else if (scrollProgress < 0.5) {
       target.current.position.set(0, 0, 0);
       target.current.scale.set(1.5, 1.5, 1.5).multiplyScalar(customScale);
       target.current.rotation.set(0, state.clock.elapsedTime * 0.5, 0);
    } 
    else if (scrollProgress < 1.5) {
       const offset = state.viewport.width * 0.25;
       target.current.position.set(offset, 0, 0);
       target.current.scale.set(2, 2, 2).multiplyScalar(customScale);
       target.current.rotation.set(0.2, -0.6, 0.1);
    }
    else if (scrollProgress < 2.5) {
       const offset = state.viewport.width * 0.25;
       target.current.position.set(-offset, 0, 0);
       target.current.scale.set(2, 2, 2).multiplyScalar(customScale);
       target.current.rotation.set(-0.2, 0.6, -0.1);
    }
    else if (scrollProgress < 3.5) {
       target.current.position.set(0, 0, 0);
       target.current.scale.set(1.2, 1.2, 1.2).multiplyScalar(customScale);
       target.current.rotation.set(Math.PI/2, 0, state.clock.elapsedTime * 0.5); // Spin like a dial
    }
    else if (scrollProgress < 4.5) {
       target.current.position.set(0, 0.5, 0);
       target.current.scale.set(1.5, 1.5, 1.5).multiplyScalar(customScale);
       target.current.rotation.set(0, state.clock.elapsedTime * 0.5, 0);
    }
    else {
       target.current.position.set(0, 2, 0);
       target.current.scale.set(0.6, 0.6, 0.6).multiplyScalar(customScale);
       target.current.rotation.set(0, state.clock.elapsedTime * 1.5, 0);
    }

    groupRef.current.position.lerp(target.current.position, 0.05);
    groupRef.current.scale.lerp(target.current.scale, 0.05);
    
    const targetQuat = new THREE.Quaternion().setFromEuler(target.current.rotation);
    groupRef.current.quaternion.slerp(targetQuat, 0.05);

    // Color & Physical Material Animation
    const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
    const dynamicAccent = new THREE.Color(accentColor);
    if (bodyMat.current) {
      bodyMat.current.color.lerp(colors.podBody, 0.1);
      
      // Real-time custom finishes
      let targetRoughness = 0.15;
      let targetMetalness = 0.8;
      
      if (materialFinish === 'matte') {
        targetRoughness = 0.95;
        targetMetalness = 0.05;
      } else if (materialFinish === 'chroma') {
        targetRoughness = 0.02;
        targetMetalness = 1.0;
      }
      
      bodyMat.current.roughness = THREE.MathUtils.lerp(bodyMat.current.roughness, targetRoughness, 0.1);
      bodyMat.current.metalness = THREE.MathUtils.lerp(bodyMat.current.metalness, targetMetalness, 0.1);
    }
    accentMats.current.forEach(mat => mat && mat.color.lerp(dynamicAccent, 0.1));
  });

  const addAccentMat = (el: THREE.MeshBasicMaterial | null) => {
     if (el && !accentMats.current.includes(el)) accentMats.current.push(el);
  };

  const renderGeometry = () => {
    switch(category) {
      case 'book':
        return (
          <>
            <mesh castShadow receiveShadow>
               <boxGeometry args={[1.5, 2, 0.3]} />
               <meshStandardMaterial ref={bodyMat} roughness={0.8} metalness={0.1} />
            </mesh>
            <mesh position={[-0.7, 0, 0]}>
               <boxGeometry args={[0.1, 2.05, 0.35]} />
               <meshBasicMaterial ref={addAccentMat} />
            </mesh>
          </>
        );
      case 'glasses':
        return (
          <>
            <mesh castShadow receiveShadow position={[-0.8, 0, 0]}>
               <torusGeometry args={[0.5, 0.1, 16, 64]} />
               <meshStandardMaterial ref={bodyMat} roughness={0.15} metalness={0.8} />
            </mesh>
            <mesh castShadow receiveShadow position={[0.8, 0, 0]}>
               <torusGeometry args={[0.5, 0.1, 16, 64]} />
               <meshStandardMaterial ref={bodyMat} roughness={0.15} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0]}>
               <boxGeometry args={[0.6, 0.05, 0.05]} />
               <meshBasicMaterial ref={addAccentMat} />
            </mesh>
          </>
        );
      case 'watch':
        return (
          <>
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
               <cylinderGeometry args={[1, 1, 0.2, 64]} />
               <meshStandardMaterial ref={bodyMat} roughness={0.15} metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
               <boxGeometry args={[0.8, 2, 0.05]} />
               <meshBasicMaterial ref={addAccentMat} />
            </mesh>
            <mesh position={[0, -1.2, 0]}>
               <boxGeometry args={[0.8, 2, 0.05]} />
               <meshBasicMaterial ref={addAccentMat} />
            </mesh>
          </>
        );
      case 'coffee':
      default:
        return (
          <>
            <mesh castShadow receiveShadow>
               <capsuleGeometry args={[1, 1.5, 32, 64]} />
               <meshStandardMaterial ref={bodyMat} roughness={0.15} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
               <torusGeometry args={[1.01, 0.02, 16, 64]} />
               <meshBasicMaterial ref={addAccentMat} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
               <torusGeometry args={[1.01, 0.02, 16, 64]} />
               <meshBasicMaterial ref={addAccentMat} />
            </mesh>
          </>
        );
    }
  };

  return (
    <group ref={groupRef}>
      {renderGeometry()}
    </group>
  );
}

function Pedestal({ isDark, isZen = false }: { isDark: boolean, isZen?: boolean }) {
   const groupRef = useRef<THREE.Group>(null);
   const mat1 = useRef<THREE.MeshStandardMaterial>(null);
   const mat2 = useRef<THREE.MeshStandardMaterial>(null);
   const ringMat = useRef<THREE.MeshBasicMaterial>(null);

   useFrame(() => {
      if (!groupRef.current) return;
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollProgress = windowHeight > 0 ? scrolled / windowHeight : 0;
      
      const targetY = isZen ? -15 : (scrollProgress > 3.5 && scrollProgress < 4.5 ? -2 : -10);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);

      const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
      if (mat1.current) mat1.current.color.lerp(colors.pedestal1, 0.1);
      if (mat2.current) mat2.current.color.lerp(colors.pedestal2, 0.1);
      if (ringMat.current) ringMat.current.color.lerp(colors.ring, 0.1);
   });

   return (
      <group position={[0, -10, 0]} ref={groupRef}>
         <mesh position={[0, -0.5, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 3, 1, 64]} />
            <meshStandardMaterial ref={mat1} roughness={0.8} metalness={0.2} />
         </mesh>
         <mesh position={[0, 0, 0]} receiveShadow>
            <cylinderGeometry args={[2, 2.5, 0.2, 64]} />
            <meshStandardMaterial ref={mat2} roughness={0.3} metalness={0.8} />
         </mesh>
         <mesh position={[0, 0.1, 0]}>
             <torusGeometry args={[1.8, 0.03, 32, 64]} />
             <meshBasicMaterial ref={ringMat} />
         </mesh>
      </group>
   )
}

function FloatingTriangles({ isDark, accentColor, isZen = false }: { isDark: boolean, accentColor: string, isZen?: boolean }) {
   const groupRef = useRef<THREE.Group>(null);
   const matsRef = useRef<THREE.MeshStandardMaterial[]>([]);

   useFrame((state) => {
      if (!groupRef.current) return;
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollProgress = windowHeight > 0 ? scrolled / windowHeight : 0;
      
      const targetScale = isZen ? 0 : (scrollProgress > 4.5 ? 1 : 0);
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
      groupRef.current.rotation.y = state.clock.elapsedTime * (isZen ? 0.05 : 0.1);
      groupRef.current.rotation.x = state.clock.elapsedTime * (isZen ? 0.07 : 0.15);

      const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
      const dynamicAccent = new THREE.Color(accentColor);
      matsRef.current.forEach((mat, i) => {
         if (mat) {
             const targetColor = i % 3 === 0 ? dynamicAccent : colors.pedestal1;
             mat.color.lerp(targetColor, 0.1);
         }
      })
   });

   const addMat = (el: THREE.MeshStandardMaterial | null) => {
      if (el && !matsRef.current.includes(el)) matsRef.current.push(el);
   };

   return (
      <group ref={groupRef} scale={[0,0,0]}>
         {Array.from({length: 20}).map((_, i) => (
            <mesh 
               key={i} 
               position={[
                  (Math.random() - 0.5) * 12, 
                  (Math.random() - 0.5) * 12, 
                  (Math.random() - 0.5) * 8
               ]}
               rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
               <tetrahedronGeometry args={[0.5 + Math.random() * 1]} />
               <meshStandardMaterial ref={addMat} metalness={0.6} roughness={0.4}/>
            </mesh>
         ))}
      </group>
   )
}

function AnimatedLights({ accentColor }: { accentColor: string }) {
  const spotRef1 = useRef<THREE.SpotLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const c = new THREE.Color(accentColor);
    if (spotRef1.current) spotRef1.current.color.lerp(c, 0.1);
    if (dirRef.current) dirRef.current.color.lerp(c, 0.1);
  });

  return (
    <>
      <spotLight 
        ref={spotRef1}
        position={[-8, 5, 5]} 
        angle={0.5} 
        penumbra={0.5} 
        intensity={100} 
      />
      <directionalLight ref={dirRef} position={[0, -5, -5]} intensity={10} />
    </>
  )
}

export default function HeroCanvas({ 
  isDark, 
  category = 'coffee', 
  accentColor = '#ceb693',
  materialFinish = 'standard',
  customScale = 1.0,
  isZen = false
}: { 
  isDark: boolean, 
  category?: string, 
  accentColor?: string,
  materialFinish?: string,
  customScale?: number,
  isZen?: boolean
}) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} shadows dpr={[1, 1.5]} performance={{ min: 0.5 }}>
      <ambientLight intensity={0.2} color="#ffffff" />
      
      <spotLight 
        position={[8, 8, 8]} 
        angle={0.4} 
        penumbra={0.8} 
        intensity={150} 
        color="#ffffff" 
        castShadow
        shadow-bias={-0.0001}
      />
      
      <AnimatedLights accentColor={accentColor} />

      <ProceduralProduct 
        isDark={isDark} 
        category={category} 
        accentColor={accentColor} 
        materialFinish={materialFinish}
        customScale={customScale}
        isZen={isZen}
      />
      <Pedestal isDark={isDark} isZen={isZen} />
      <FloatingTriangles isDark={isDark} accentColor={accentColor} isZen={isZen} />
      
      {/* Dynamic procedural environment map for offline/isolated execution safety */}
      <Environment resolution={128}>
        <ambientLight intensity={0.6} />
        {/* Soft overhead area */}
        <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        {/* Colorful left specular reflection */}
        <mesh position={[-8, 4, 3]} rotation={[0, Math.PI / 4, 0]}>
          <planeGeometry args={[10, 15]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} />
        </mesh>
        {/* White right fill reflection */}
        <mesh position={[8, 3, -2]} rotation={[0, -Math.PI / 4, 0]}>
          <planeGeometry args={[10, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </Environment>
    </Canvas>
  );
}
