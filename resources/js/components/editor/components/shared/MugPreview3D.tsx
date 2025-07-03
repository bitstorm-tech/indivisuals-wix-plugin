import { getCroppedImgFromArea } from '@/lib/imageCropUtils';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GeneratedImageCropData, MugOption } from '../../types';

interface MugPreview3DProps {
  mug: MugOption;
  imageUrl: string;
  cropData: GeneratedImageCropData | null;
}

interface MugModelProps {
  textureUrl: string;
}

function MugModel({ textureUrl }: MugModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  // Configure texture wrapping and repeating
  useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.center.set(0.5, 0.5);
    texture.needsUpdate = true;
  }, [texture]);

  // Gentle rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  // Create mug geometry
  const mugRadius = 1.5;
  const mugHeight = 3.5;
  const handleRadius = 0.15;
  const handleWidth = 1.2;

  return (
    <group ref={meshRef}>
      {/* Mug body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[mugRadius, mugRadius * 0.9, mugHeight, 32]} />
        <meshStandardMaterial map={texture} metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Mug handle */}
      <mesh position={[mugRadius + 0.3, 0, 0]} castShadow>
        <torusGeometry args={[handleWidth / 2, handleRadius, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Mug bottom */}
      <mesh position={[0, -mugHeight / 2, 0]} receiveShadow>
        <cylinderGeometry args={[mugRadius * 0.9, mugRadius * 0.9, 0.1, 32]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Mug rim */}
      <mesh position={[0, mugHeight / 2, 0]}>
        <torusGeometry args={[mugRadius, 0.05, 8, 32]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="border-t-primary h-12 w-12 animate-spin rounded-full border-4 border-gray-300"></div>
    </div>
  );
}

export default function MugPreview3D({ imageUrl, cropData }: MugPreview3DProps) {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      try {
        if (cropData?.croppedAreaPixels) {
          const croppedImage = await getCroppedImgFromArea(imageUrl, cropData.croppedAreaPixels);
          setProcessedImageUrl(croppedImage);
        } else {
          setProcessedImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessedImageUrl(imageUrl);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [imageUrl, cropData]);

  if (isProcessing || !processedImageUrl) {
    return (
      <div className="h-[400px] w-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={45} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* Mug Model */}
        <Suspense fallback={null}>
          <MugModel textureUrl={processedImageUrl} />
        </Suspense>

        {/* Shadow plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>

      {/* Instructions */}
      <div className="mt-2 text-center text-sm text-gray-600">Drag to rotate • Scroll to zoom</div>
    </div>
  );
}
