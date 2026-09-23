import { Html } from "@react-three/drei";
import { useState } from "react";

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

  return (
    <group position={position}>

      {/* HOTSPOT MARKER */}

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerEnter={() => {
          setHovered(true);
        }}
        onPointerLeave={() => {
          setHovered(false);
        }}
      >
        <sphereGeometry args={[0.045, 12, 12]} />

        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* LABEL */}

      {hovered && (
        <Html
          distanceFactor={10}
          position={[0.1, 0, 0]}
          center
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            title={description}
            style={{
              background: "rgba(0, 0, 0, 0.75)",

              border:
                "1px solid rgba(255, 255, 255, 0.35)",

              color: "white",

              padding: "4px 7px",

              cursor: "pointer",

              fontSize: "7px",

              letterSpacing: "1.5px",

              whiteSpace: "nowrap",

              fontFamily:
                "Arial, Helvetica, sans-serif",

              lineHeight: "1",

              opacity: 0.9,

              pointerEvents: "auto",
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