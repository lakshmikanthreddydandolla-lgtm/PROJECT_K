import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface HotspotProps {
  position: [number, number, number];
  label: string;
  description: string;
  onClick: () => void;
}

function Hotspot({
  position,
  label,
  description,
  onClick,
}: HotspotProps) {
  const [hovered, setHovered] = useState(false);

  const groupRef =
    useRef<THREE.Group | null>(null);

  const markerRef =
    useRef<THREE.Mesh | null>(null);

  const ringRef =
    useRef<THREE.Mesh | null>(null);


  /* =====================================================
     HOTSPOT ANIMATION
  ===================================================== */

  useFrame((state, delta) => {
    const group = groupRef.current;
    const marker = markerRef.current;
    const ring = ringRef.current;

    if (!group || !marker || !ring) {
      return;
    }

    /* -----------------------------------------------------
       SMOOTH HOVER SCALE
    ----------------------------------------------------- */

    const targetScale = hovered ? 1.35 : 1;

    const newScale = THREE.MathUtils.lerp(
      group.scale.x,
      targetScale,
      1 - Math.pow(0.001, delta)
    );

    group.scale.set(
      newScale,
      newScale,
      newScale
    );


    /* -----------------------------------------------------
       SMALL FLOATING MOTION
    ----------------------------------------------------- */

    const time = state.clock.elapsedTime;

    marker.position.y =
      Math.sin(time * 2.5) * 0.008;


    /* -----------------------------------------------------
       PULSE RING
    ----------------------------------------------------- */

    const pulse =
      1 + Math.sin(time * 3) * 0.08;

    ring.scale.set(
      pulse,
      pulse,
      pulse
    );
  });


  return (
    <group
      ref={groupRef}
      position={position}
    >

      {/* =================================================
          OUTER RING
      ================================================= */}

      <mesh
        ref={ringRef}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            0.075,
            0.008,
            8,
            32,
          ]}
        />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 0.9 : 0.45}
        />
      </mesh>


      {/* =================================================
          MAIN HOTSPOT
      ================================================= */}

      <mesh
        ref={markerRef}

        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}

        onPointerEnter={(event) => {
          event.stopPropagation();

          setHovered(true);

          document.body.style.cursor =
            "pointer";
        }}

        onPointerLeave={(event) => {
          event.stopPropagation();

          setHovered(false);

          document.body.style.cursor =
            "default";
        }}
      >
        <sphereGeometry
          args={[
            0.045,
            16,
            16,
          ]}
        />

        <meshBasicMaterial
          color="#ffffff"
        />
      </mesh>


      {/* =================================================
          CENTER POINT
      ================================================= */}

      <mesh>
        <sphereGeometry
          args={[
            0.018,
            10,
            10,
          ]}
        />

        <meshBasicMaterial
          color="#ffffff"
        />
      </mesh>


      {/* =================================================
          LABEL
      ================================================= */}

      {hovered && (
        <Html
          distanceFactor={10}
          position={[
            0.12,
            0,
            0,
          ]}
          center
          zIndexRange={[
            100,
            0,
          ]}
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}

            title={description}

            style={{
              background:
                "rgba(5, 5, 5, 0.92)",

              border:
                "1px solid rgba(255,255,255,0.35)",

              color: "white",

              padding:
                "7px 11px",

              cursor:
                "pointer",

              fontSize: "8px",

              letterSpacing:
                "2px",

              whiteSpace:
                "nowrap",

              fontFamily:
                "Arial, Helvetica, sans-serif",

              fontWeight: 500,

              lineHeight: 1,

              opacity: 0.96,

              pointerEvents:
                "auto",

              backdropFilter:
                "blur(8px)",

              boxShadow:
                "0 8px 25px rgba(0,0,0,0.4)",
            }}
          >
            {label}
          </button>
        </Html>
      )}

    </group>
  );
}

export default Hotspot;