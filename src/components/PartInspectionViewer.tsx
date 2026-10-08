import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Canvas,
} from "@react-three/fiber";

import {
  Environment,
  OrbitControls,
  useGLTF,
  Html,
} from "@react-three/drei";

import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import gsap from "gsap";

/* =========================================================
   TYPES
========================================================= */

type PartInspectionViewerProps = {
  modelPath: string;
  modelScale?: number;
  modelPosition?: [number, number, number];
  cameraDistance?: number;
};

type InspectionModelProps = {
  modelPath: string;
  modelScale: number;
  modelPosition: [number, number, number];
  isExploded: boolean;
  resetSignal: number;
  onFloorCalculated: (floorY: number) => void;
  activeLabel: string | null;
};

/* =========================================================
   EXACT SEMANTIC GROUPING & LABELS
========================================================= */

const EXPLODED_LABELS = [
  {
    id: "brakes",
    name: "BRAKING SYSTEM",
    x: -8.5,
    y: 0.5,
    z: 0,
    description:
      "Carbon-ceramic rotors and high-performance calipers for optimal thermal management.",
  },
  {
    id: "rim",
    name: "FORGED ALLOY RIM",
    x: -3.2,
    y: 0.5,
    z: 0,
    description:
      "Aerospace-grade lightweight forged aluminum structure.",
  },
  {
    id: "ring",
    name: "INNER BARREL",
    x: 1.8,
    y: 0.5,
    z: 0,
    description:
      "Structural reinforcement barrel providing high-speed stability.",
  },
  {
    id: "tire",
    name: "PERFORMANCE TIRE",
    x: 5.5,
    y: 0.5,
    z: 0,
    description:
      "Custom asymmetric tread compound for maximum track grip.",
  },
];

/* =========================================================
   EXPLOSION GROUP TARGET
   DO NOT CHANGE
========================================================= */

function getExplosionGroupTargetX(
  mesh: THREE.Mesh
): number {
  const meshName = (
    mesh.name +
    " " +
    (mesh.parent?.name || "")
  ).toLowerCase();

  const mat = Array.isArray(mesh.material)
    ? mesh.material[0]
    : mesh.material;

  const matName =
    mat?.name?.toLowerCase() || "";

  // BRAKES
  if (
    meshName.includes("empty_11") ||
    meshName.includes("brake") ||
    matName.includes("004")
  ) {
    return -5.5;
  }

  // OUTER TIRE
  if (
    meshName.includes("plane.002_1") ||
    matName.includes("pneu") ||
    matName.includes("pzeo") ||
    matName.includes("012")
  ) {
    return EXPLODED_LABELS[3].x;
  }

  // INNER BARREL
  if (
    meshName.includes("circle_4") ||
    meshName.includes("circle") ||
    matName.includes("032") ||
    matName.includes("ring")
  ) {
    return EXPLODED_LABELS[2].x;
  }

  // FORGED ALLOY RIM
  if (
    meshName.includes("<wheel_6") ||
    meshName.includes("wheel")
  ) {
    return EXPLODED_LABELS[1].x;
  }

  // DEFAULT
  return EXPLODED_LABELS[1].x;
}

/* =========================================================
   COMPONENT ID
   HIGHLIGHTING LOGIC ONLY
========================================================= */

function getMeshComponentId(
  mesh: THREE.Mesh
): string {
  /*
   * Use the existing mesh + parent information.
   *
   * IMPORTANT:
   * This does NOT modify the GLB hierarchy.
   *
   * We only use more precise matching for highlighting.
   */

  const meshName = (
    mesh.name +
    " " +
    (mesh.parent?.name || "")
  ).toLowerCase();

  const mat = Array.isArray(mesh.material)
    ? mesh.material[0]
    : mesh.material;

  const matName =
    mat?.name?.toLowerCase() || "";

  // BRAKES
  if (
    meshName.includes("empty_11") ||
    meshName.includes("brake") ||
    matName.includes("004")
  ) {
    return "brakes";
  }

  // PERFORMANCE TIRE
  if (
    meshName.includes("plane.002_1") ||
    matName.includes("pneu") ||
    matName.includes("pzeo") ||
    matName.includes("012")
  ) {
    return "tire";
  }

  /*
   * INNER BARREL
   *
   * IMPORTANT:
   * Removed the broad:
   *
   * meshName.includes("circle")
   *
   * because that can classify rim meshes as the
   * inner barrel.
   *
   * We keep the exact existing identifiers.
   */
  if (
    meshName.includes("circle_4") ||
    matName.includes("032") ||
    matName.includes("ring")
  ) {
    return "ring";
  }

  // FORGED ALLOY RIM
  if (
    meshName.includes("<wheel_6") ||
    meshName.includes("wheel")
  ) {
    return "rim";
  }

  /*
   * Keep the existing default behavior.
   */
  return "rim";
}

/* =========================================================
   MODEL HELPERS
========================================================= */

function prepareModel(
  scene: THREE.Object3D
) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          if (material) {
            material.needsUpdate = true;
          }
        });
      }
    }
  });
}

function calculateFloorY(
  scene: THREE.Object3D,
  modelScale: number
) {
  const box = new THREE.Box3().setFromObject(scene);

  if (!Number.isFinite(box.min.y)) {
    return 0;
  }

  return box.min.y * modelScale;
}

/* =========================================================
   3D INSPECTION MODEL
========================================================= */

function InspectionModel({
  modelPath,
  modelScale,
  modelPosition,
  isExploded,
  resetSignal,
  onFloorCalculated,
  activeLabel,
}: InspectionModelProps) {
  const { scene } = useGLTF(modelPath);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    prepareModel(clone);
    return clone;
  }, [scene]);

  const originalPositionsRef =
    useRef<Map<string, THREE.Vector3>>(
      new Map()
    );

  const explodedPositionsRef =
    useRef<Map<string, THREE.Vector3>>(
      new Map()
    );

  const movableMeshesRef =
    useRef<THREE.Mesh[]>([]);

  /*
   * HIGHLIGHT ONLY:
   *
   * When a selected mesh shares a material with another
   * mesh in the GLB, changing emissive on that material
   * would make both meshes glow.
   *
   * We therefore remember the original material and give
   * only the selected mesh a temporary material copy.
   *
   * This does NOT alter the GLB file or hierarchy.
   */
  const highlightedMaterialRef =
    useRef<
      Map<
        THREE.Mesh,
        THREE.Material | THREE.Material[]
      >
    >(new Map());

  /* =======================================================
     CALCULATE ORIGINAL + EXPLODED POSITIONS
  ======================================================= */

  useEffect(() => {
    const floorY = calculateFloorY(
      clonedScene,
      modelScale
    );

    onFloorCalculated(floorY);

    const meshes: THREE.Mesh[] = [];

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });

    if (meshes.length === 0) {
      return;
    }

    movableMeshesRef.current = meshes;

    originalPositionsRef.current.clear();
    explodedPositionsRef.current.clear();

    const carWorldX = modelPosition[0];

    meshes.forEach((mesh) => {
      originalPositionsRef.current.set(
        mesh.uuid,
        mesh.position.clone()
      );

      const targetOffset =
        getExplosionGroupTargetX(mesh);

      const originalWorldPos =
        new THREE.Vector3();

      mesh.getWorldPosition(
        originalWorldPos
      );

      const targetWorldPos =
        new THREE.Vector3(
          carWorldX + targetOffset,
          originalWorldPos.y,
          originalWorldPos.z
        );

      const targetLocalPos =
        targetWorldPos.clone();

      if (mesh.parent) {
        mesh.parent.worldToLocal(
          targetLocalPos
        );
      }

      explodedPositionsRef.current.set(
        mesh.uuid,
        targetLocalPos
      );
    });
  }, [
    clonedScene,
    modelScale,
    modelPosition,
    onFloorCalculated,
  ]);

  /* =======================================================
     EXPLODE / ASSEMBLE ANIMATION
========================================================= */

  useEffect(() => {
    const meshes =
      movableMeshesRef.current;

    if (meshes.length === 0) {
      return;
    }

    meshes.forEach((mesh) => {
      const original =
        originalPositionsRef.current.get(
          mesh.uuid
        );

      const exploded =
        explodedPositionsRef.current.get(
          mesh.uuid
        );

      if (!original || !exploded) {
        return;
      }

      const target =
        isExploded
          ? exploded
          : original;

      gsap.to(mesh.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 1.1,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    });
  }, [isExploded]);

  /* =======================================================
     ACTIVE COMPONENT HIGHLIGHT
     ONLY HIGHLIGHTING LOGIC CHANGED
  ======================================================= */

  useEffect(() => {
    const meshes =
      movableMeshesRef.current;

    if (meshes.length === 0) {
      return;
    }

    meshes.forEach((mesh) => {
      /*
       * Restore the original material first if this mesh
       * was previously highlighted.
       */
      const previousMaterial =
        highlightedMaterialRef.current.get(
          mesh
        );

      if (previousMaterial) {
        mesh.material =
          previousMaterial;

        highlightedMaterialRef.current.delete(
          mesh
        );
      }

      const componentId =
        getMeshComponentId(mesh);

      const isSelected =
        isExploded &&
        activeLabel === componentId;

      if (!isSelected) {
        return;
      }

      /*
       * Clone the material ONLY for the selected mesh.
       *
       * This prevents shared GLB materials from causing
       * another component to glow.
       */
      const originalMaterial =
        mesh.material;

      const clonedMaterial =
        Array.isArray(originalMaterial)
          ? originalMaterial.map(
              (material) =>
                material.clone()
            )
          : originalMaterial.clone();

      highlightedMaterialRef.current.set(
        mesh,
        originalMaterial
      );

      mesh.material =
        clonedMaterial;

      const materials =
        Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

      materials.forEach((material) => {
        if (
          !material ||
          !(
            material instanceof THREE.MeshStandardMaterial
          ) &&
          !(
            material instanceof THREE.MeshPhysicalMaterial
          ) &&
          !(
            material instanceof THREE.MeshPhongMaterial
          ) &&
          !(
            material instanceof THREE.MeshLambertMaterial
          )
        ) {
          return;
        }

        material.emissive.set(
          "#ffffff"
        );

        material.emissiveIntensity =
          0.18;

        material.needsUpdate = true;
      });
    });
  }, [
    activeLabel,
    isExploded,
  ]);

  /* =======================================================
     RESET
========================================================= */

  useEffect(() => {
    if (resetSignal === 0) {
      return;
    }

    const meshes =
      movableMeshesRef.current;

    /*
     * Restore any temporary highlight materials
     * during reset as well.
     */
    meshes.forEach((mesh) => {
      const originalMaterial =
        highlightedMaterialRef.current.get(
          mesh
        );

      if (originalMaterial) {
        mesh.material =
          originalMaterial;

        highlightedMaterialRef.current.delete(
          mesh
        );
      }

      const original =
        originalPositionsRef.current.get(
          mesh.uuid
        );

      if (original) {
        gsap.killTweensOf(
          mesh.position
        );

        mesh.position.copy(original);
      }
    });
  }, [resetSignal]);

  return (
    <group
      scale={modelScale}
      position={modelPosition}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

/* =========================================================
   3D FLOATING HOTSPOTS & LABELS
========================================================= */

function ExplodedLabels({
  isExploded,
  carWorldX,
  activeLabel,
  setActiveLabel,
}: {
  isExploded: boolean;
  carWorldX: number;
  activeLabel: string | null;
  setActiveLabel: (
    id: string | null
  ) => void;
}) {
  if (!isExploded) {
    return null;
  }

  return (
    <group>
      {EXPLODED_LABELS.map((label) => {
        const isActive =
          activeLabel === label.id;

        return (
          <Html
            key={label.id}
            position={[
              carWorldX + label.x,
              label.y,
              label.z,
            ]}
            center
            zIndexRange={[100, 0]}
          >
            <div
              style={{
                position: "relative",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              {/* HOTSPOT RING */}

              <div
                style={{
                  position: "absolute",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border:
                    "1px solid rgba(255,255,255,0.45)",
                  animation:
                    "hotspotPulse 2s ease-out infinite",
                  pointerEvents: "none",
                }}
              />

              {/* MAIN HOTSPOT */}

              <div
                onClick={(event) => {
                  event.stopPropagation();

                  setActiveLabel(
                    isActive
                      ? null
                      : label.id
                  );
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform =
                    "scale(1.35)";

                  event.currentTarget.style.boxShadow =
                    "0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.35)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform =
                    "scale(1)";

                  event.currentTarget.style.boxShadow =
                    isActive
                      ? "0 0 18px rgba(255,255,255,0.95), 0 0 35px rgba(255,255,255,0.35)"
                      : "0 0 8px rgba(255,255,255,0.55)";
                }}
                style={{
                  position: "absolute",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isActive
                    ? "#ffffff"
                    : "rgba(255,255,255,0.82)",
                  border:
                    "1px solid rgba(255,255,255,0.95)",
                  boxShadow: isActive
                    ? "0 0 18px rgba(255,255,255,0.95), 0 0 35px rgba(255,255,255,0.35)"
                    : "0 0 8px rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  transition:
                    "transform 180ms ease, background 180ms ease, box-shadow 180ms ease",
                  zIndex: 5,
                }}
              />

              {/* INFORMATION PANEL */}

              <div
                style={{
                  position: "absolute",
                  bottom: 26,
                  left: "50%",
                  transform: isActive
                    ? "translate(-50%, 0)"
                    : "translate(-50%, 8px)",
                  width: 230,
                  padding: "16px 18px",
                  background:
                    "rgba(4,6,8,0.95)",
                  border:
                    "1px solid rgba(255,255,255,0.16)",
                  backdropFilter:
                    "blur(14px)",
                  color: "#ffffff",
                  fontFamily:
                    "Inter, Arial, Helvetica, sans-serif",
                  opacity: isActive ? 1 : 0,
                  visibility: isActive
                    ? "visible"
                    : "hidden",
                  pointerEvents: isActive
                    ? "auto"
                    : "none",
                  transition:
                    "opacity 220ms ease, transform 220ms ease",
                  zIndex: 10,
                  boxShadow:
                    "0 12px 40px rgba(0,0,0,0.45)",
                }}
              >
                {/* CLOSE BUTTON */}

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveLabel(null);
                  }}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 22,
                    height: 22,
                    padding: 0,
                    border:
                      "1px solid rgba(255,255,255,0.18)",
                    background:
                      "rgba(255,255,255,0.05)",
                    color:
                      "rgba(255,255,255,0.65)",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition:
                      "all 160ms ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "rgba(255,255,255,0.15)";

                    event.currentTarget.style.color =
                      "#ffffff";

                    event.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.45)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background =
                      "rgba(255,255,255,0.05)";

                    event.currentTarget.style.color =
                      "rgba(255,255,255,0.65)";

                    event.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.18)";
                  }}
                >
                  ×
                </button>

                {/* TITLE */}

                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.20em",
                    marginBottom: 8,
                    paddingRight: 25,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label.name}
                </div>

                {/* DIVIDER */}

                <div
                  style={{
                    width: 24,
                    height: 1,
                    background:
                      "rgba(255,255,255,0.45)",
                    marginBottom: 10,
                  }}
                />

                {/* DESCRIPTION */}

                <div
                  style={{
                    fontSize: 11,
                    color:
                      "rgba(255,255,255,0.62)",
                    lineHeight: 1.6,
                  }}
                >
                  {label.description}
                </div>
              </div>

              {/* LEADER LINE */}

              <div
                style={{
                  position: "absolute",
                  bottom: 9,
                  width: 1,
                  height: 18,
                  background:
                    "linear-gradient(to top, rgba(255,255,255,0.8), rgba(255,255,255,0))",
                  opacity: isActive ? 1 : 0,
                  transition:
                    "opacity 220ms ease",
                  pointerEvents: "none",
                }}
              />
            </div>
          </Html>
        );
      })}
    </group>
  );
}

/* =========================================================
   FLOOR
========================================================= */

function InspectionFloor({
  floorY,
}: {
  floorY: number;
}) {
  const FLOOR_PADDING = 1;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[
        0,
        floorY - FLOOR_PADDING,
        0,
      ]}
      receiveShadow
    >
      <planeGeometry args={[60, 60]} />

      <meshStandardMaterial
        color="#080808"
        roughness={0.92}
        metalness={0.05}
      />
    </mesh>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PartInspectionViewer({
  modelPath,
  modelScale = 0.72,
  modelPosition = [0, 0, 0],
  cameraDistance = 12.5,
}: PartInspectionViewerProps) {
  const [floorY, setFloorY] =
    useState(0);

  const [isExploded, setIsExploded] =
    useState(false);

  const [resetSignal, setResetSignal] =
    useState(0);

  const [activeLabel, setActiveLabel] =
    useState<string | null>(null);

  const controlsRef =
    useRef<OrbitControlsImpl>(null);

  const handleFloorCalculated =
    useMemo(
      () => (value: number) => {
        setFloorY(value);
      },
      []
    );

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setIsExploded(false);
    setActiveLabel(null);

    setResetSignal(
      (previous) => previous + 1
    );
  };

  /* =======================================================
     EXPLODE / ASSEMBLE
  ======================================================= */

  const handleExplodeToggle = () => {
    setIsExploded((previous) => {
      const next = !previous;

      if (!next) {
        setActiveLabel(null);
      }

      return next;
    });
  };

  /* =======================================================
     PREVIOUS COMPONENT
  ======================================================= */

  const handlePreviousLabel = () => {
    if (!isExploded) {
      return;
    }

    const currentIndex =
      EXPLODED_LABELS.findIndex(
        (label) =>
          label.id === activeLabel
      );

    const previousIndex =
      currentIndex <= 0
        ? EXPLODED_LABELS.length - 1
        : currentIndex - 1;

    setActiveLabel(
      EXPLODED_LABELS[
        previousIndex
      ].id
    );
  };

  /* =======================================================
     NEXT COMPONENT
  ======================================================= */

  const handleNextLabel = () => {
    if (!isExploded) {
      return;
    }

    const currentIndex =
      EXPLODED_LABELS.findIndex(
        (label) =>
          label.id === activeLabel
      );

    const nextIndex =
      currentIndex === -1 ||
      currentIndex >=
        EXPLODED_LABELS.length - 1
        ? 0
        : currentIndex + 1;

    setActiveLabel(
      EXPLODED_LABELS[nextIndex].id
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "500px",
        overflow: "hidden",
        background: "#050607",
      }}
    >
      {/* =================================================
          HOTSPOT ANIMATION
      ================================================= */}

      <style>{`
        @keyframes hotspotPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.35;
          }

          50% {
            transform: scale(1);
            opacity: 0.7;
          }

          100% {
            transform: scale(1.25);
            opacity: 0;
          }
        }
      `}</style>

      {/* =================================================
          3D CANVAS
      ================================================= */}

      <Canvas
        shadows
        camera={{
          position: [
            0,
            1.2,
            cameraDistance,
          ],
          fov: 40,
          near: 0.01,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
        }}
        dpr={[1, 2]}
      >
        {/* ENVIRONMENT */}

        <Environment
          preset="studio"
          environmentIntensity={0.62}
        />

        {/* KEY LIGHT */}

        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.25}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* FILL LIGHT */}

        <directionalLight
          position={[-5, 4, 2]}
          intensity={0.55}
        />

        {/* RIM LIGHT */}

        <directionalLight
          position={[0, 5, -7]}
          intensity={0.72}
        />

        {/* SOFT AMBIENT */}

        <ambientLight
          intensity={0.18}
        />

        {/* MODEL */}

        <InspectionModel
          modelPath={modelPath}
          modelScale={modelScale}
          modelPosition={modelPosition}
          isExploded={isExploded}
          resetSignal={resetSignal}
          onFloorCalculated={
            handleFloorCalculated
          }
          activeLabel={activeLabel}
        />

        {/* HOTSPOTS */}

        <ExplodedLabels
          isExploded={isExploded}
          carWorldX={
            modelPosition[0]
          }
          activeLabel={activeLabel}
          setActiveLabel={
            setActiveLabel
          }
        />

        {/* FLOOR */}

        <InspectionFloor
          floorY={floorY}
        />

        {/* CAMERA CONTROLS */}

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={2.0}
          maxDistance={30}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* =================================================
          3D TECHNICAL OVERLAY
      ================================================= */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {/* GRID */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage: `
              linear-gradient(
                rgba(255,255,255,0.04) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.04) 1px,
                transparent 1px
              )
            `,
            backgroundSize:
              "50px 50px",
          }}
        />

        {/* =================================================
            TOP CENTER TITLE
        ================================================= */}

        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform:
              "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.30em",
              color:
                "rgba(255,255,255,0.38)",
              marginBottom: 5,
            }}
          >
            PROJECT_K
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            COMPONENT INSPECTION
          </div>
        </div>

        {/* =================================================
            CROSSHAIR
        ================================================= */}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform:
              "translate(-50%, -50%)",
            width: 22,
            height: 22,
            opacity: 0.32,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 1,
              background:
                "rgba(255,255,255,0.6)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              background:
                "rgba(255,255,255,0.6)",
            }}
          />
        </div>

        {/* =================================================
            INSTRUCTIONS
        ================================================= */}

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 24,
            transform:
              "translateX(-50%)",
            fontSize: 9,
            letterSpacing: "0.20em",
            color:
              "rgba(255,255,255,0.34)",
            whiteSpace: "nowrap",
          }}
        >
          DRAG TO ROTATE • SCROLL / PINCH TO ZOOM
        </div>

        {/* =================================================
            COMPONENT NAVIGATION
        ================================================= */}

        {isExploded && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 40,
              transform:
                "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={
                handlePreviousLabel
              }
              style={{
                height: 42,
                padding: "0 15px",
                border:
                  "1px solid rgba(255,255,255,0.22)",
                background:
                  "rgba(5,7,9,0.78)",
                color:
                  "rgba(255,255,255,0.72)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.16em",
                backdropFilter:
                  "blur(10px)",
                transition:
                  "all 180ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.50)";

                event.currentTarget.style.color =
                  "#ffffff";

                event.currentTarget.style.background =
                  "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.22)";

                event.currentTarget.style.color =
                  "rgba(255,255,255,0.72)";

                event.currentTarget.style.background =
                  "rgba(5,7,9,0.78)";
              }}
            >
              PREVIOUS
            </button>

            <button
              onClick={
                handleNextLabel
              }
              style={{
                height: 42,
                padding: "0 15px",
                border:
                  "1px solid rgba(255,255,255,0.22)",
                background:
                  "rgba(5,7,9,0.78)",
                color:
                  "rgba(255,255,255,0.72)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.16em",
                backdropFilter:
                  "blur(10px)",
                transition:
                  "all 180ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.50)";

                event.currentTarget.style.color =
                  "#ffffff";

                event.currentTarget.style.background =
                  "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.22)";

                event.currentTarget.style.color =
                  "rgba(255,255,255,0.72)";

                event.currentTarget.style.background =
                  "rgba(5,7,9,0.78)";
              }}
            >
              NEXT
            </button>
          </div>
        )}

        {/* =================================================
            3D ACTION BUTTONS
        ================================================= */}

        <div
          style={{
            position: "absolute",
            right: 28,
            bottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "auto",
          }}
        >
          {/* EXPLODE / ASSEMBLE */}

          <button
            onClick={
              handleExplodeToggle
            }
            style={{
              height: 42,
              padding: "0 18px",
              border: isExploded
                ? "1px solid rgba(255,255,255,0.70)"
                : "1px solid rgba(255,255,255,0.35)",
              background: isExploded
                ? "rgba(255,255,255,0.14)"
                : "rgba(5,7,9,0.78)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              backdropFilter:
                "blur(10px)",
              transition:
                "all 180ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor =
                "rgba(255,255,255,0.75)";

              event.currentTarget.style.background =
                "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor =
                isExploded
                  ? "rgba(255,255,255,0.70)"
                  : "rgba(255,255,255,0.35)";

              event.currentTarget.style.background =
                isExploded
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(5,7,9,0.78)";
            }}
          >
            {isExploded
              ? "ASSEMBLE"
              : "EXPLODE"}
          </button>

          {/* RESET */}

          <button
            onClick={handleReset}
            style={{
              height: 42,
              padding: "0 16px",
              border:
                "1px solid rgba(255,255,255,0.22)",
              background:
                "rgba(5,7,9,0.78)",
              color:
                "rgba(255,255,255,0.65)",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              backdropFilter:
                "blur(10px)",
              transition:
                "all 180ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor =
                "rgba(255,255,255,0.50)";

              event.currentTarget.style.color =
                "#ffffff";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor =
                "rgba(255,255,255,0.22)";

              event.currentTarget.style.color =
                "rgba(255,255,255,0.65)";
            }}
          >
            RESET
          </button>
        </div>

        {/* =================================================
            CORNER ACCENTS
        ================================================= */}

        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            width: 30,
            height: 30,
            borderLeft:
              "1px solid rgba(255,255,255,0.24)",
            borderBottom:
              "1px solid rgba(255,255,255,0.24)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            width: 30,
            height: 30,
            borderRight:
              "1px solid rgba(255,255,255,0.24)",
            borderTop:
              "1px solid rgba(255,255,255,0.24)",
          }}
        />
      </div>
    </div>
  );
}