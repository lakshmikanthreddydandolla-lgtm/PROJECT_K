import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

interface PartInspectionViewerProps {
  modelPath: string;
  modelScale?: number;
  modelPosition?: [number, number, number];
  cameraDistance?: number;
}

interface InspectionModelProps {
  modelPath: string;
  modelScale: number;
  modelPosition: [number, number, number];
}

function InspectionModel({
  modelPath,
  modelScale,
  modelPosition,
}: InspectionModelProps) {
  const { scene } = useGLTF(modelPath);

  const modelRef =
    useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!modelRef.current) {
      return;
    }

    modelRef.current.traverse(
      (object) => {
        if (
          object instanceof THREE.Mesh
        ) {
          object.castShadow = true;
          object.receiveShadow = true;

          if (
            object.material instanceof
            THREE.MeshStandardMaterial
          ) {
            object.material.envMapIntensity =
              1.15;
          }
        }
      }
    );
  }, [scene]);

  return (
    <group
      ref={modelRef}
      position={modelPosition}
      scale={modelScale}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function PartInspectionViewer({
  modelPath,
  modelScale = 0.72,
  modelPosition = [0, 0, 0],
  cameraDistance = 5.2,
}: PartInspectionViewerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at center, #151515 0%, #080808 48%, #020202 100%)",
      }}
    >
      {/* =================================================
          TECHNICAL GRID
      ================================================= */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, transparent 49.9%, rgba(255,255,255,0.025) 50%, transparent 50.1%), linear-gradient(0deg, transparent 49.9%, rgba(255,255,255,0.025) 50%, transparent 50.1%)",
          backgroundSize:
            "90px 90px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 72%)",
        }}
      />

      {/* =================================================
          3D CANVAS
      ================================================= */}

      <Canvas
        shadows
        camera={{
          position: [
            cameraDistance * 0.72,
            cameraDistance * 0.38,
            cameraDistance,
          ],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
      >
        <Environment preset="studio" />

        {/* KEY LIGHT */}

        <directionalLight
          position={[5, 7, 6]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={30}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />

        {/* FRONT FILL */}

        <directionalLight
          position={[-5, 3, 4]}
          intensity={0.8}
        />

        {/* REAR RIM */}

        <directionalLight
          position={[0, 5, -6]}
          intensity={1.1}
        />

        <ambientLight intensity={0.2} />

        {/* =================================================
            MODEL
        ================================================= */}

        <InspectionModel
          modelPath={modelPath}
          modelScale={modelScale}
          modelPosition={modelPosition}
        />

        {/* =================================================
            FLOOR
        ================================================= */}

        <mesh
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          position={[0, -1.45, 0]}
          receiveShadow
        >
          <planeGeometry
            args={[20, 20]}
          />

          <meshStandardMaterial
            color="#050505"
            roughness={0.82}
            metalness={0.18}
          />
        </mesh>

        {/* =================================================
            ORBIT CONTROL
        ================================================= */}

        <OrbitControls
          makeDefault
          enablePan={false}
          enableRotate
          enableZoom
          rotateSpeed={0.62}
          zoomSpeed={0.72}
          enableDamping
          dampingFactor={0.075}
          minPolarAngle={0.3}
          maxPolarAngle={
            Math.PI - 0.3
          }
          minDistance={2.2}
          maxDistance={10}
        />
      </Canvas>

      {/* =================================================
          INSPECTION LABEL
      ================================================= */}

      <div
        style={{
          position: "absolute",
          top: 28,
          left: 30,
          pointerEvents: "none",
          color:
            "rgba(255,255,255,0.42)",
          fontFamily:
            "Arial, Helvetica, sans-serif",
          letterSpacing: "3px",
          fontSize: 8,
          textTransform:
            "uppercase",
        }}
      >
        COMPONENT INSPECTION
      </div>

      {/* =================================================
          CENTER CROSSHAIR
      ================================================= */}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 34,
          height: 34,
          transform:
            "translate(-50%, -50%)",
          pointerEvents: "none",
          opacity: 0.18,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 0,
            width: 1,
            height: 34,
            background: "white",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 16,
            width: 34,
            height: 1,
            background: "white",
          }}
        />
      </div>

      {/* =================================================
          BOTTOM INSTRUCTION
      ================================================= */}

      <div
        style={{
          position: "absolute",
          bottom: 25,
          left: "50%",
          transform:
            "translateX(-50%)",
          pointerEvents: "none",
          color:
            "rgba(255,255,255,0.38)",
          fontFamily:
            "Arial, Helvetica, sans-serif",
          fontSize: 8,
          letterSpacing: "2px",
          whiteSpace: "nowrap",
        }}
      >
        DRAG TO ROTATE
        <span
          style={{
            margin: "0 12px",
            color:
              "rgba(255,255,255,0.18)",
          }}
        >
          •
        </span>
        SCROLL / PINCH TO ZOOM
      </div>

      {/* =================================================
          CORNER MARKERS
      ================================================= */}

      <div
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          width: 32,
          height: 32,
          borderTop:
            "1px solid rgba(255,255,255,0.25)",
          borderRight:
            "1px solid rgba(255,255,255,0.25)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 22,
          width: 32,
          height: 32,
          borderBottom:
            "1px solid rgba(255,255,255,0.25)",
          borderLeft:
            "1px solid rgba(255,255,255,0.25)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}