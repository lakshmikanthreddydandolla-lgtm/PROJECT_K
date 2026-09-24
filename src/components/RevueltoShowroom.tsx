import { useEffect, useRef, useState } from "react";
import {
  CameraControls,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import RevueltoModel from "./RevueltoModel";
import Hotspot from "./Hotspot";
import VehicleInfoPanel from "./VehicleInfoPanel";
import PartInspectionViewer from "./PartInspectionViewer";

/* =========================================================
   TYPES
========================================================= */

interface InspectionTarget {
  cameraPosition: [number, number, number];
  target: [number, number, number];
}

type ViewSection = "front" | "side" | "rear";

type ComponentSystem =
  | "exterior"
  | "lighting"
  | "wheels"
  | "glass"
  | "interior"
  | "powertrain";

interface ComponentSystemInfo {
  id: ComponentSystem;
  name: string;
  code: string;
  count: string;
}

interface ComponentPart {
  id: string;
  name: string;
  code: string;
  description: string;
  modelPath: string;
  modelScale?: number;
  modelPosition?: [number, number, number];
  cameraDistance?: number;
}

/* =========================================================
   COMPONENT SYSTEMS
========================================================= */

const COMPONENT_SYSTEMS: ComponentSystemInfo[] = [
  {
    id: "exterior",
    name: "EXTERIOR",
    code: "EXT",
    count: "07",
  },
  {
    id: "lighting",
    name: "LIGHTING",
    code: "LGT",
    count: "03",
  },
  {
    id: "wheels",
    name: "WHEELS & BRAKES",
    code: "WHL",
    count: "04",
  },
  {
    id: "glass",
    name: "GLASS",
    code: "GLS",
    count: "03",
  },
  {
    id: "interior",
    name: "INTERIOR",
    code: "INT",
    count: "05",
  },
  {
    id: "powertrain",
    name: "POWERTRAIN",
    code: "PWR",
    count: "05",
  },
];

/* =========================================================
   COMPONENT PARTS
========================================================= */

const COMPONENT_PARTS: Record<
  ComponentSystem,
  ComponentPart[]
> = {
  exterior: [
    {
      id: "front-bumper",
      name: "FRONT BUMPER",
      code: "EXT-01",
      description:
        "Front aerodynamic bodywork and structural exterior surface.",
      modelPath: "/models/inspection/front-bumper.glb",
    },
    {
      id: "hood",
      name: "HOOD",
      code: "EXT-02",
      description:
        "Sculpted front body panel forming the upper front profile.",
      modelPath: "/models/inspection/hood.glb",
    },
    {
      id: "left-door",
      name: "LEFT DOOR",
      code: "EXT-03",
      description:
        "Driver-side door assembly and exterior body surface.",
      modelPath: "/models/inspection/left-door.glb",
    },
    {
      id: "right-door",
      name: "RIGHT DOOR",
      code: "EXT-04",
      description:
        "Passenger-side door assembly and exterior body surface.",
      modelPath: "/models/inspection/right-door.glb",
    },
    {
      id: "side-panels",
      name: "SIDE PANELS",
      code: "EXT-05",
      description:
        "Sculpted side bodywork shaping the vehicle's aerodynamic profile.",
      modelPath: "/models/inspection/side-panels.glb",
    },
    {
      id: "rear-bumper",
      name: "REAR BUMPER",
      code: "EXT-06",
      description:
        "Rear exterior bodywork surrounding the diffuser and exhaust region.",
      modelPath: "/models/inspection/rear-bumper.glb",
    },
    {
      id: "rear-diffuser",
      name: "REAR DIFFUSER",
      code: "EXT-07",
      description:
        "Rear aerodynamic component managing airflow beneath the vehicle.",
      modelPath: "/models/inspection/rear-diffuser.glb",
    },
  ],

  lighting: [
    {
      id: "headlights",
      name: "HEADLIGHTS",
      code: "LGT-01",
      description:
        "Front LED lighting assembly forming the vehicle's signature lighting design.",
      modelPath: "/models/inspection/headlights.glb",
    },
    {
      id: "front-indicators",
      name: "FRONT INDICATORS",
      code: "LGT-02",
      description:
        "Front directional lighting elements integrated into the exterior lighting system.",
      modelPath: "/models/inspection/front-indicators.glb",
    },
    {
      id: "rear-lights",
      name: "REAR LIGHTS",
      code: "LGT-03",
      description:
        "Rear lighting assembly integrated into the angular rear design.",
      modelPath: "/models/inspection/rear-lights.glb",
    },
  ],

  wheels: [
    {
      id: "front-wheels",
      name: "FRONT WHEEL",
      code: "WHL-01",
      description:
        "Front wheel and tire assembly for the vehicle's performance-oriented chassis.",
      modelPath: "/models/inspection/wheels.glb",
      modelScale: 0.62,
      modelPosition: [0, 0.15, 0],
      cameraDistance: 4.8,
    },
    {
      id: "rear-wheels",
      name: "REAR WHEEL",
      code: "WHL-02",
      description:
        "Rear wheel and tire assembly emphasizing the vehicle's wide performance stance.",
      modelPath: "/models/inspection/wheels.glb",
      modelScale: 0.62,
      modelPosition: [0, 0.15, 0],
      cameraDistance: 4.8,
    },
    {
      id: "front-brakes",
      name: "FRONT BRAKES",
      code: "WHL-03",
      description:
        "High-performance front braking hardware located behind the wheel assembly.",
      modelPath: "/models/inspection/wheels.glb",
      modelScale: 0.55,
      modelPosition: [0, 0.15, 0],
      cameraDistance: 5.2,
    },
    {
      id: "rear-brakes",
      name: "REAR BRAKES",
      code: "WHL-04",
      description:
        "Rear braking hardware designed for repeated high-performance deceleration.",
      modelPath: "/models/inspection/wheels.glb",
      modelScale: 0.55,
      modelPosition: [0, 0.15, 0],
      cameraDistance: 5.2,
    },
  ],

  glass: [
    {
      id: "windshield",
      name: "WINDSHIELD",
      code: "GLS-01",
      description:
        "Front transparent body element forming the main forward visibility area.",
      modelPath: "/models/inspection/windshield.glb",
    },
    {
      id: "side-glass",
      name: "SIDE GLASS",
      code: "GLS-02",
      description:
        "Side glazing integrated into the vehicle's aerodynamic profile.",
      modelPath: "/models/inspection/side-glass.glb",
    },
    {
      id: "rear-glass",
      name: "REAR GLASS",
      code: "GLS-03",
      description:
        "Rear glazing integrated into the engine and rear body architecture.",
      modelPath: "/models/inspection/rear-glass.glb",
    },
  ],

  interior: [
    {
      id: "driver-seat",
      name: "DRIVER SEAT",
      code: "INT-01",
      description:
        "Driver seating assembly positioned within the cockpit.",
      modelPath: "/models/inspection/driver-seat.glb",
    },
    {
      id: "passenger-seat",
      name: "PASSENGER SEAT",
      code: "INT-02",
      description:
        "Passenger seating assembly integrated into the cabin.",
      modelPath: "/models/inspection/passenger-seat.glb",
    },
    {
      id: "dashboard",
      name: "DASHBOARD",
      code: "INT-03",
      description:
        "Main cockpit dashboard and instrument architecture.",
      modelPath: "/models/inspection/dashboard.glb",
    },
    {
      id: "steering-wheel",
      name: "STEERING WHEEL",
      code: "INT-04",
      description:
        "Driver control interface positioned at the center of the cockpit.",
      modelPath: "/models/inspection/steering-wheel.glb",
    },
    {
      id: "center-console",
      name: "CENTER CONSOLE",
      code: "INT-05",
      description:
        "Central interior control and storage structure.",
      modelPath: "/models/inspection/center-console.glb",
    },
  ],

  powertrain: [
    {
      id: "v12-engine",
      name: "V12 ENGINE",
      code: "PWR-01",
      description:
        "6.5-litre naturally aspirated V12 combustion engine.",
      modelPath: "/models/inspection/v12-engine.glb",
    },
    {
      id: "hybrid-motor",
      name: "HYBRID MOTOR",
      code: "PWR-02",
      description:
        "Electric motor component forming part of the hybrid powertrain.",
      modelPath: "/models/inspection/hybrid-motor.glb",
    },
    {
      id: "battery",
      name: "BATTERY",
      code: "PWR-03",
      description:
        "Lithium-ion battery system used by the hybrid powertrain.",
      modelPath: "/models/inspection/battery.glb",
    },
    {
      id: "exhaust",
      name: "EXHAUST",
      code: "PWR-04",
      description:
        "Performance exhaust hardware integrated into the rear powertrain architecture.",
      modelPath: "/models/inspection/exhaust.glb",
    },
    {
      id: "transmission",
      name: "TRANSMISSION",
      code: "PWR-05",
      description:
        "Eight-speed dual-clutch transmission system.",
      modelPath: "/models/inspection/transmission.glb",
    },
  ],
};

/* =========================================================
   VIEW CAMERA POSITIONS
========================================================= */

const VIEW_TARGETS: Record<
  ViewSection,
  InspectionTarget
> = {
  front: {
    cameraPosition: [-6, 2.3, 0],
    target: [0, 0.55, 0],
  },

  side: {
    cameraPosition: [0, 2.2, 6],
    target: [0, 0.55, 0],
  },

  rear: {
    cameraPosition: [6, 2.3, 0],
    target: [0, 0.55, 0],
  },
};

/* =========================================================
   HERO CAMERA
========================================================= */

const HERO_CAMERA: InspectionTarget = {
  cameraPosition: [6.5, 2.4, 5.2],
  target: [0, 0.55, 0],
};

/* =========================================================
   CAMERA CONTROLLER
========================================================= */

interface SmoothCameraControllerProps {
  target: InspectionTarget | null;
  section: ViewSection | null;
  resetToken: number;
}

function SmoothCameraController({
  target,
  section,
  resetToken,
}: SmoothCameraControllerProps) {
  const controlsRef =
    useRef<CameraControls | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    const destination =
      target ??
      (section
        ? VIEW_TARGETS[section]
        : HERO_CAMERA);

    controls.setLookAt(
      destination.cameraPosition[0],
      destination.cameraPosition[1],
      destination.cameraPosition[2],
      destination.target[0],
      destination.target[1],
      destination.target[2],
      true
    );
  }, [target, section, resetToken]);

  return (
    <CameraControls
      ref={controlsRef}
      minDistance={3}
      maxDistance={12}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2.05}
      smoothTime={0.8}
      dollyToCursor={false}
    />
  );
}

/* =========================================================
   SPECIFICATION DATA
========================================================= */

const SPECIFICATIONS = {
  powertrain: [
    {
      label: "ENGINE",
      value: "6.5 L V12",
    },
    {
      label: "DISPLACEMENT",
      value: "6,498.5 cm³",
    },
    {
      label: "ICE POWER",
      value: "825 CV",
    },
    {
      label: "COMBINED POWER",
      value: "1,015 CV",
    },
    {
      label: "HYBRID SYSTEM",
      value: "V12 + 3 Electric Motors",
    },
    {
      label: "BATTERY",
      value: "Lithium-ion",
    },
    {
      label: "TRANSMISSION",
      value: "8-speed Dual Clutch",
    },
  ],

  performance: [
    {
      label: "0–100 KM/H",
      value: "2.5 s",
    },
    {
      label: "TOP SPEED",
      value: ">350 km/h",
    },
    {
      label: "MAX ICE TORQUE",
      value: "725 Nm",
    },
    {
      label: "WEIGHT / POWER",
      value: "1.75 kg/CV",
    },
  ],

  dimensions: [
    {
      label: "LENGTH",
      value: "4,947 mm",
    },
    {
      label: "WIDTH",
      value: "2,033 mm",
    },
    {
      label: "HEIGHT",
      value: "1,160 mm",
    },
    {
      label: "WHEELBASE",
      value: "2,779 mm",
    },
    {
      label: "DRY WEIGHT",
      value: "1,772 kg",
    },
  ],

  vehicle: [
    {
      label: "DRIVE",
      value: "Four-Wheel Drive",
    },
    {
      label: "GEARBOX",
      value: "8-speed E-DCT",
    },
    {
      label: "BRAKES",
      value: "Carbon Ceramic",
    },
    {
      label: "FRONT SUSPENSION",
      value: "Double Wishbone",
    },
    {
      label: "REAR SUSPENSION",
      value: "Double Wishbone",
    },
    {
      label: "STEERING",
      value: "Electric Power Steering",
    },
  ],
};

/* =========================================================
   MAIN SHOWROOM
========================================================= */

interface RevueltoShowroomProps {
  onBack: () => void;
}

function RevueltoShowroom({
  onBack,
}: RevueltoShowroomProps) {
  const [section, setSection] =
    useState<ViewSection | null>(null);

  const [inspectionTarget, setInspectionTarget] =
    useState<InspectionTarget | null>(null);

  const [selectedDetail, setSelectedDetail] =
    useState<{
      title: string;
      description: string;
    } | null>(null);

  const [resetToken, setResetToken] =
    useState(0);

  const [showSpecifications, setShowSpecifications] =
    useState(false);

  const [introComplete, setIntroComplete] =
    useState(false);

  /* =====================================================
     COMPONENT INSPECTION STATE
  ===================================================== */

  const [showComponents, setShowComponents] =
    useState(false);

  const [selectedSystem, setSelectedSystem] =
    useState<ComponentSystem | null>(null);

  const [selectedPart, setSelectedPart] =
    useState<ComponentPart | null>(null);

  /* =====================================================
     INTRO
  ===================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroComplete(true);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =====================================================
     OPEN COMPONENTS
  ===================================================== */

  function openComponents() {
    setShowSpecifications(false);
    setInspectionTarget(null);
    setSelectedDetail(null);
    setShowComponents(true);
    setSelectedSystem(null);
    setSelectedPart(null);
  }

  /* =====================================================
     CLOSE COMPONENTS
  ===================================================== */

  function closeComponents() {
    setSelectedPart(null);
    setSelectedSystem(null);
    setShowComponents(false);

    setResetToken(
      (previous) => previous + 1
    );
  }

  /* =====================================================
     SELECT SYSTEM
  ===================================================== */

  function selectSystem(
    system: ComponentSystem
  ) {
    setSelectedSystem(system);
    setSelectedPart(null);
  }

  /* =====================================================
     SELECT PART
  ===================================================== */

  function selectPart(part: ComponentPart) {
    setSelectedPart(part);
  }

  /* =====================================================
     BACK TO SYSTEMS
  ===================================================== */

  function backToSystems() {
    setSelectedPart(null);
  }

  /* =====================================================
     INSPECT
  ===================================================== */

  function inspect(
    cameraPosition: [number, number, number],
    target: [number, number, number],
    title: string,
    description: string
  ) {
    setShowSpecifications(false);

    setInspectionTarget({
      cameraPosition,
      target,
    });

    setSelectedDetail({
      title,
      description,
    });
  }

  /* =====================================================
     CHANGE VIEW
  ===================================================== */

  function changeSection(
    newSection: ViewSection
  ) {
    setShowSpecifications(false);
    setShowComponents(false);
    setSelectedSystem(null);
    setSelectedPart(null);

    setSection(newSection);
    setInspectionTarget(null);
    setSelectedDetail(null);
  }

  /* =====================================================
     CLOSE INSPECTION
  ===================================================== */

  function closeInspection() {
    setInspectionTarget(null);
    setSelectedDetail(null);
  }

  /* =====================================================
     TOGGLE SPECS
  ===================================================== */

  function toggleSpecifications() {
    setShowSpecifications(
      (previous) => !previous
    );

    setShowComponents(false);
    setSelectedSystem(null);
    setSelectedPart(null);

    setInspectionTarget(null);
    setSelectedDetail(null);
  }

  /* =====================================================
     RETURN TO EXPLORE
  ===================================================== */

  function returnToExplore() {
    setShowSpecifications(false);
    setShowComponents(false);

    setSelectedSystem(null);
    setSelectedPart(null);

    setSection(null);
    setInspectionTarget(null);
    setSelectedDetail(null);

    setResetToken(
      (previous) => previous + 1
    );
  }

  /* =====================================================
     COMPONENT INSPECTION SCREEN
  ===================================================== */

  if (selectedPart) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          background: "#050505",
        }}
      >
        <PartInspectionViewer
          modelPath={selectedPart.modelPath}
          modelScale={selectedPart.modelScale}
          modelPosition={selectedPart.modelPosition}
          cameraDistance={
            selectedPart.cameraDistance
          }
        />

        {/* TOP LEFT NAVIGATION */}

        <div
          style={{
            position: "fixed",
            top: 26,
            left: 28,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            onClick={backToSystems}
            style={{
              height: 38,
              padding: "0 17px",
              border:
                "1px solid rgba(255,255,255,0.18)",
              background:
                "rgba(5,5,5,0.82)",
              color:
                "rgba(255,255,255,0.82)",
              fontSize: 9,
              letterSpacing: "2px",
              cursor: "pointer",
              backdropFilter: "blur(14px)",
            }}
          >
            ← ALL SYSTEMS
          </button>

          <button
            onClick={closeComponents}
            style={{
              width: 38,
              height: 38,
              border:
                "1px solid rgba(255,255,255,0.18)",
              background:
                "rgba(5,5,5,0.82)",
              color: "white",
              fontSize: 17,
              cursor: "pointer",
              backdropFilter: "blur(14px)",
            }}
            aria-label="Close component inspection"
          >
            ×
          </button>
        </div>

        {/* PART INFORMATION */}

        <div
          style={{
            position: "fixed",
            left: 28,
            bottom: 32,
            zIndex: 100,
            maxWidth: 430,
            padding: "22px 24px",
            background:
              "rgba(5,5,5,0.82)",
            border:
              "1px solid rgba(255,255,255,0.13)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              fontSize: 8,
              letterSpacing: "3px",
              color:
                "rgba(255,255,255,0.38)",
              marginBottom: 9,
            }}
          >
            {selectedPart.code}
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 300,
              letterSpacing: "3px",
              color: "white",
              marginBottom: 9,
            }}
          >
            {selectedPart.name}
          </div>

          <div
            style={{
              fontSize: 10,
              lineHeight: 1.7,
              letterSpacing: "0.4px",
              color:
                "rgba(255,255,255,0.48)",
            }}
          >
            {selectedPart.description}
          </div>
        </div>

        {/* TOP RIGHT BRAND */}

        <div
          style={{
            position: "fixed",
            top: 28,
            right: 30,
            zIndex: 100,
            textAlign: "right",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 8,
              letterSpacing: "4px",
              color:
                "rgba(255,255,255,0.4)",
              marginBottom: 6,
            }}
          >
            LAMBORGHINI
          </div>

          <div
            style={{
              fontSize: 13,
              letterSpacing: "4px",
              color:
                "rgba(255,255,255,0.88)",
            }}
          >
            REVUELTO
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="revuelto-showroom"
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#030303",
      }}
    >
      {/* =================================================
          CINEMATIC INTRO
      ================================================= */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#030303",
          color: "white",
          opacity: introComplete ? 0 : 1,
          pointerEvents:
            introComplete ? "none" : "auto",
          transition: "opacity 1.2s ease",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: "1px",
            background:
              "rgba(255,255,255,0.18)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "calc(50% - 70px)",
            left: 0,
            width: "100%",
            height: "1px",
            background:
              "rgba(255,255,255,0.08)",
          }}
        />

        <p
          style={{
            margin: 0,
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize: 11,
            letterSpacing: "7px",
            fontWeight: 400,
            opacity: 0.65,
          }}
        >
          LAMBORGHINI
        </p>

        <h1
          style={{
            margin: "16px 0 10px",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize:
              "clamp(42px, 8vw, 96px)",
            fontWeight: 300,
            letterSpacing: "12px",
            lineHeight: 1,
          }}
        >
          REVUELTO
        </h1>

        <p
          style={{
            margin: 0,
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize: 9,
            letterSpacing: "4px",
            color:
              "rgba(255,255,255,0.5)",
          }}
        >
          INTERACTIVE VEHICLE EXPERIENCE
        </p>
      </div>

      {/* =================================================
          MAIN HEADER
      ================================================= */}

      <div
        style={{
          position: "absolute",
          zIndex: 20,
          top: 26,
          left: 30,
          opacity: introComplete ? 1 : 0,
          transition: "opacity 1.2s ease",
          pointerEvents:
            introComplete ? "auto" : "none",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 8,
            letterSpacing: "4px",
            color:
              "rgba(255,255,255,0.4)",
          }}
        >
          LAMBORGHINI
        </p>

        <h1
          style={{
            margin: "7px 0 4px",
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: "5px",
            color: "white",
          }}
        >
          REVUELTO
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 7,
            letterSpacing: "2.5px",
            color:
              "rgba(255,255,255,0.32)",
          }}
        >
          INTERACTIVE VEHICLE INSPECTION
        </p>
      </div>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        className="showroom-back"
        onClick={onBack}
        style={{
          position: "absolute",
          top: 28,
          right: 30,
          zIndex: 30,
          padding: "10px 15px",
          border:
            "1px solid rgba(255,255,255,0.15)",
          background:
            "rgba(5,5,5,0.5)",
          color:
            "rgba(255,255,255,0.7)",
          cursor: "pointer",
          fontSize: 8,
          letterSpacing: "2px",
          backdropFilter: "blur(12px)",
          opacity: introComplete ? 1 : 0,
          transition: "opacity 1.2s ease",
          pointerEvents:
            introComplete ? "auto" : "none",
        }}
      >
        ← BACK
      </button>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        style={{
          position: "absolute",
          zIndex: 25,
          left: "50%",
          top: 118,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: 5,
          background:
            "rgba(5,5,5,0.76)",
          border:
            "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(18px)",
          boxShadow:
            "0 12px 45px rgba(0,0,0,0.35)",
          opacity: introComplete ? 1 : 0,
          transition: "opacity 1.2s ease",
          pointerEvents:
            introComplete ? "auto" : "none",
          whiteSpace: "nowrap",
        }}
      >
        <NavButton
          label="FRONT"
          active={section === "front"}
          onClick={() =>
            changeSection("front")
          }
        />

        <NavButton
          label="SIDE"
          active={section === "side"}
          onClick={() =>
            changeSection("side")
          }
        />

        <NavButton
          label="REAR"
          active={section === "rear"}
          onClick={() =>
            changeSection("rear")
          }
        />

        <NavDivider />

        <NavButton
          label="EXPLORE"
          active={
            section === null &&
            !showSpecifications
          }
          onClick={returnToExplore}
        />

        <NavButton
          label="SPECS"
          active={showSpecifications}
          onClick={toggleSpecifications}
        />

        <NavButton
          label="COMPONENTS"
          active={showComponents}
          onClick={openComponents}
        />
      </div>

      {/* =================================================
          3D SHOWROOM
      ================================================= */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: introComplete ? 1 : 0,
          transition: "opacity 1.4s ease",
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [6.5, 2.4, 5.2],
            fov: 42,
          }}
        >
          <SmoothCameraController
            target={inspectionTarget}
            section={section}
            resetToken={resetToken}
          />

          <Environment preset="studio" />

          <ambientLight intensity={0.42} />

          <directionalLight
            position={[4, 6, 4]}
            intensity={1.8}
            castShadow
          />

          <directionalLight
            position={[-4, 3, 2]}
            intensity={0.45}
          />

          <mesh
            rotation={[
              -Math.PI / 2,
              0,
              0,
            ]}
            position={[1.3, -0.08, 0]}
            receiveShadow
          >
            <planeGeometry
              args={[30, 30]}
            />

            <meshStandardMaterial
              color="#090909"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          <ContactShadows
            position={[
              1.3,
              -0.07,
              0,
            ]}
            opacity={0.65}
            scale={10}
            blur={2.5}
            far={4}
          />

          <RevueltoModel />

          {/* =================================================
              FRONT HOTSPOTS
          ================================================= */}

          {section === "front" && (
            <>
              <Hotspot
                position={[
                  -1.69,
                  0.48,
                  0.99,
                ]}
                label="LEFT HEADLIGHT"
                description="Signature LED headlight."
                onClick={() => {
                  inspect(
                    [-3.2, 0.8, 2.25],
                    [
                      -1.69,
                      0.48,
                      0.99,
                    ],
                    "LEFT HEADLIGHT",
                    "The distinctive LED headlight forms an important part of the Revuelto's sharp front-end design."
                  );
                }}
              />

              <Hotspot
                position={[
                  -1.69,
                  0.48,
                  -0.99,
                ]}
                label="RIGHT HEADLIGHT"
                description="Signature LED headlight."
                onClick={() => {
                  inspect(
                    [-3.2, 0.8, -2.25],
                    [
                      -1.69,
                      0.48,
                      -0.99,
                    ],
                    "RIGHT HEADLIGHT",
                    "The sharp LED lighting signature emphasizes the aggressive geometry of the Revuelto's front fascia."
                  );
                }}
              />

              <Hotspot
                position={[
                  -2.15,
                  0.3,
                  0,
                ]}
                label="FRONT AERO"
                description="Front aerodynamic elements."
                onClick={() => {
                  inspect(
                    [-3.5, 0.7, 1.6],
                    [-2.15, 0.3, 0],
                    "FRONT AERO",
                    "The front aerodynamic surfaces manage airflow around the vehicle and contribute to its aggressive front design."
                  );
                }}
              />

              <Hotspot
                position={[
                  -2.2,
                  0.55,
                  0.55,
                ]}
                label="FRONT BODY"
                description="Sculpted front bodywork."
                onClick={() => {
                  inspect(
                    [-3.3, 1.2, 1.7],
                    [-2.2, 0.55, 0.55],
                    "FRONT BODY",
                    "The sculpted front bodywork uses sharp surfaces and aerodynamic geometry to create the vehicle's distinctive front profile."
                  );
                }}
              />
            </>
          )}

          {/* =================================================
              SIDE HOTSPOTS
          ================================================= */}

          {section === "side" && (
            <>
              <Hotspot
                position={[
                  -0.65,
                  0.45,
                  1,
                ]}
                label="FRONT WHEEL"
                description="Front wheel and tire."
                onClick={() => {
                  inspect(
                    [0, 1, 3],
                    [
                      -0.65,
                      0.45,
                      1,
                    ],
                    "FRONT WHEEL",
                    "The front wheel and tire package is designed around the vehicle's high-performance character."
                  );
                }}
              />

              <Hotspot
                position={[
                  -0.65,
                  0.55,
                  1.05,
                ]}
                label="BRAKE"
                description="Performance braking system."
                onClick={() => {
                  inspect(
                    [-0.1, 0.85, 2.8],
                    [
                      -0.65,
                      0.55,
                      1.05,
                    ],
                    "BRAKES",
                    "The braking hardware is designed to handle the high speeds and repeated deceleration expected from a high-performance vehicle."
                  );
                }}
              />

              <Hotspot
                position={[
                  0.9,
                  0.65,
                  0.75,
                ]}
                label="SIDE INTAKE"
                description="Side aerodynamic intake."
                onClick={() => {
                  inspect(
                    [1.7, 1.35, 3],
                    [
                      0.9,
                      0.65,
                      0.75,
                    ],
                    "SIDE INTAKE",
                    "The side intake helps shape airflow around the vehicle while becoming an important part of the Revuelto's visual identity."
                  );
                }}
              />

              <Hotspot
                position={[
                  2.1,
                  0.45,
                  0.95,
                ]}
                label="REAR WHEEL"
                description="Rear wheel and tire."
                onClick={() => {
                  inspect(
                    [2.8, 1, 2.8],
                    [
                      2.1,
                      0.45,
                      0.95,
                    ],
                    "REAR WHEEL",
                    "The rear wheel area emphasizes the vehicle's wide stance and performance-focused proportions."
                  );
                }}
              />
            </>
          )}

          {/* =================================================
              REAR HOTSPOTS
          ================================================= */}

          {section === "rear" && (
            <>
              <Hotspot
                position={[
                  2.85,
                  0.28,
                  0,
                ]}
                label="REAR DIFFUSER"
                description="Rear aerodynamic diffuser."
                onClick={() => {
                  inspect(
                    [4.5, 0.55, 1.15],
                    [
                      2.85,
                      0.28,
                      0,
                    ],
                    "REAR DIFFUSER",
                    "The rear diffuser manages airflow beneath the vehicle and contributes to its aggressive rear appearance."
                  );
                }}
              />

              <Hotspot
                position={[
                  2.35,
                  0.68,
                  0.5,
                ]}
                label="REAR LIGHT"
                description="Rear lighting design."
                onClick={() => {
                  inspect(
                    [4.45, 0.95, 1.15],
                    [
                      2.35,
                      0.68,
                      0.5,
                    ],
                    "REAR LIGHTS",
                    "The rear lighting design continues the sharp geometric language used throughout the vehicle."
                  );
                }}
              />

              <Hotspot
                position={[
                  2.85,
                  0.88,
                  0,
                ]}
                label="EXHAUST"
                description="Rear exhaust area."
                onClick={() => {
                  inspect(
                    [4.35, 0.5, 1.05],
                    [
                      2.85,
                      0.88,
                      0,
                    ],
                    "EXHAUST",
                    "The rear exhaust area forms part of the Revuelto's performance-focused rear design."
                  );
                }}
              />
            </>
          )}
        </Canvas>
      </div>

      {/* =================================================
          COMPONENT SYSTEM SELECTOR
      ================================================= */}

      {showComponents && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background:
              "rgba(3,3,3,0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter:
              "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 30,
          }}
        >
          <div
            style={{
              width: "min(980px, 92vw)",
              maxHeight: "82vh",
              overflowY: "auto",
              background: "#070707",
              border:
                "1px solid rgba(255,255,255,0.13)",
              boxShadow:
                "0 30px 100px rgba(0,0,0,0.65)",
            }}
          >
            {/* PANEL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                padding:
                  "28px 30px 24px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 8,
                    letterSpacing: "3px",
                    color:
                      "rgba(255,255,255,0.35)",
                    marginBottom: 8,
                  }}
                >
                  VEHICLE ARCHITECTURE
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 25,
                    fontWeight: 300,
                    letterSpacing: "5px",
                    color: "white",
                  }}
                >
                  COMPONENTS
                </h2>
              </div>

              <button
                onClick={closeComponents}
                style={{
                  width: 34,
                  height: 34,
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  background:
                    "rgba(255,255,255,0.04)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 17,
                }}
              >
                ×
              </button>
            </div>

            {/* SYSTEM GRID */}

            <div
              style={{
                padding: 30,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
              }}
            >
              {COMPONENT_SYSTEMS.map(
                (system) => {
                  const active =
                    selectedSystem ===
                    system.id;

                  return (
                    <button
                      key={system.id}
                      onClick={() =>
                        selectSystem(
                          system.id
                        )
                      }
                      style={{
                        position:
                          "relative",
                        minHeight: 112,
                        padding:
                          "20px 22px",
                        textAlign: "left",
                        border:
                          active
                            ? "1px solid rgba(255,255,255,0.52)"
                            : "1px solid rgba(255,255,255,0.10)",
                        background:
                          active
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.025)",
                        color: "white",
                        cursor:
                          "pointer",
                        transition:
                          "all 0.25s ease",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          marginBottom:
                            20,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 8,
                            letterSpacing:
                              "2px",
                            color:
                              "rgba(255,255,255,0.35)",
                          }}
                        >
                          {system.code}
                        </span>

                        <span
                          style={{
                            fontSize: 8,
                            letterSpacing:
                              "2px",
                            color:
                              "rgba(255,255,255,0.28)",
                          }}
                        >
                          {system.count}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          letterSpacing:
                            "2.5px",
                          fontWeight: 400,
                        }}
                      >
                        {system.name}
                      </div>

                      <div
                        style={{
                          position:
                            "absolute",
                          bottom: 0,
                          left: 0,
                          height: 1,
                          width:
                            active
                              ? "100%"
                              : "0%",
                          background:
                            "white",
                          transition:
                            "width 0.3s ease",
                        }}
                      />
                    </button>
                  );
                }
              )}
            </div>

            {/* PART LIST */}

            {selectedSystem && (
              <div
                style={{
                  borderTop:
                    "1px solid rgba(255,255,255,0.08)",
                  padding: 30,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 8,
                        letterSpacing:
                          "2.5px",
                        color:
                          "rgba(255,255,255,0.32)",
                        marginBottom:
                          6,
                      }}
                    >
                      SELECT COMPONENT
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        letterSpacing:
                          "3px",
                        color:
                          "rgba(255,255,255,0.9)",
                      }}
                    >
                      {
                        COMPONENT_SYSTEMS.find(
                          (item) =>
                            item.id ===
                            selectedSystem
                        )?.name
                      }
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedSystem(
                        null
                      )
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color:
                        "rgba(255,255,255,0.4)",
                      cursor:
                        "pointer",
                      fontSize: 8,
                      letterSpacing:
                        "2px",
                    }}
                  >
                    ALL SYSTEMS
                  </button>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 8,
                  }}
                >
                  {COMPONENT_PARTS[
                    selectedSystem
                  ].map((part) => (
                    <button
                      key={part.id}
                      onClick={() =>
                        selectPart(
                          part
                        )
                      }
                      style={{
                        minHeight: 88,
                        padding:
                          "17px 18px",
                        textAlign:
                          "left",
                        border:
                          "1px solid rgba(255,255,255,0.09)",
                        background:
                          "rgba(255,255,255,0.025)",
                        color: "white",
                        cursor:
                          "pointer",
                        transition:
                          "all 0.22s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 7,
                          letterSpacing:
                            "2px",
                          color:
                            "rgba(255,255,255,0.3)",
                          marginBottom:
                            9,
                        }}
                      >
                        {part.code}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing:
                            "2px",
                          marginBottom:
                            7,
                        }}
                      >
                        {part.name}
                      </div>

                      <div
                        style={{
                          fontSize: 8,
                          lineHeight:
                            1.5,
                          color:
                            "rgba(255,255,255,0.35)",
                        }}
                      >
                        {part.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          INFORMATION PANEL
      ================================================= */}

      {selectedDetail &&
        !showSpecifications &&
        !showComponents && (
          <VehicleInfoPanel
            title={
              selectedDetail.title
            }
            description={
              selectedDetail.description
            }
            onClose={
              closeInspection
            }
          />
        )}

      {/* =================================================
          SPECIFICATIONS
      ================================================= */}

      {showSpecifications && (
        <div
          style={{
            position: "fixed",
            zIndex: 30,
            top: "150px",
            right: "28px",
            bottom: "28px",
            width: "390px",
            maxWidth:
              "calc(100vw - 56px)",
            overflowY: "auto",
            padding: "30px",
            boxSizing:
              "border-box",
            background:
              "rgba(7,7,7,0.88)",
            border:
              "1px solid rgba(255,255,255,0.13)",
            backdropFilter:
              "blur(24px)",
            WebkitBackdropFilter:
              "blur(24px)",
            boxShadow:
              "0 25px 70px rgba(0,0,0,0.55)",
            color: "white",
            animation:
              "projectKSpecsIn 0.45s ease forwards",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
              marginBottom: 30,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 9,
                  letterSpacing: "3px",
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                LAMBORGHINI
              </p>

              <h2
                style={{
                  margin:
                    "8px 0 0",
                  fontSize: 25,
                  fontWeight: 300,
                  letterSpacing: "4px",
                }}
              >
                SPECIFICATIONS
              </h2>
            </div>

            <button
              onClick={() =>
                setShowSpecifications(
                  false
                )
              }
              style={{
                border: "none",
                background:
                  "rgba(255,255,255,0.07)",
                color: "white",
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>

          <SpecificationCategory
            title="POWERTRAIN"
            items={
              SPECIFICATIONS.powertrain
            }
          />

          <SpecificationCategory
            title="PERFORMANCE"
            items={
              SPECIFICATIONS.performance
            }
          />

          <SpecificationCategory
            title="DIMENSIONS"
            items={
              SPECIFICATIONS.dimensions
            }
          />

          <SpecificationCategory
            title="VEHICLE"
            items={
              SPECIFICATIONS.vehicle
            }
          />

          <div
            style={{
              marginTop: 28,
              paddingTop: 18,
              borderTop:
                "1px solid rgba(255,255,255,0.08)",
              fontSize: 8,
              lineHeight: 1.7,
              letterSpacing:
                "0.8px",
              color:
                "rgba(255,255,255,0.32)",
            }}
          >
            TECHNICAL DATA BASED ON
            LAMBORGHINI REVUELTO
            OFFICIAL SPECIFICATIONS.
          </div>
        </div>
      )}

      {/* =================================================
          BOTTOM CONTROLS
      ================================================= */}

      <div
        className="showroom-controls"
        style={{
          opacity:
            introComplete ? 1 : 0,
          transition:
            "opacity 1.2s ease",
          pointerEvents:
            introComplete
              ? "auto"
              : "none",
        }}
      >
        DRAG TO ROTATE
        <span>•</span>
        SCROLL TO ZOOM
        <span>•</span>
        HOVER HOTSPOTS
        <span>•</span>
        CLICK TO INSPECT
      </div>

      {/* =================================================
          ANIMATION
      ================================================= */}

      <style>
        {`
          @keyframes projectKSpecsIn {
            from {
              opacity: 0;
              transform: translateX(35px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   NAV BUTTON
========================================================= */

interface NavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({
  label,
  active,
  onClick,
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        padding: "11px 17px",
        border:
          "1px solid " +
          (active
            ? "rgba(255,255,255,0.55)"
            : "transparent"),
        background:
          active
            ? "rgba(255,255,255,0.09)"
            : "transparent",
        color:
          active
            ? "white"
            : "rgba(255,255,255,0.52)",
        cursor: "pointer",
        fontSize: 8,
        letterSpacing: "2.3px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        transition:
          "all 0.22s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color =
          "white";

        if (!active) {
          event.currentTarget.style.background =
            "rgba(255,255,255,0.055)";
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color =
          active
            ? "white"
            : "rgba(255,255,255,0.52)";

        if (!active) {
          event.currentTarget.style.background =
            "transparent";
        }
      }}
    >
      {label}

      {active && (
        <span
          style={{
            position:
              "absolute",
            left: "50%",
            bottom: -1,
            transform:
              "translateX(-50%)",
            width: 22,
            height: 1,
            background: "white",
          }}
        />
      )}
    </button>
  );
}

/* =========================================================
   NAV DIVIDER
========================================================= */

function NavDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background:
          "rgba(255,255,255,0.14)",
        margin: "0 3px",
      }}
    />
  );
}

/* =========================================================
   SPECIFICATION CATEGORY
========================================================= */

interface SpecificationItem {
  label: string;
  value: string;
}

interface SpecificationCategoryProps {
  title: string;
  items: SpecificationItem[];
}

function SpecificationCategory({
  title,
  items,
}: SpecificationCategoryProps) {
  return (
    <section
      style={{
        marginBottom: 28,
      }}
    >
      <h3
        style={{
          margin:
            "0 0 12px",
          fontSize: 9,
          letterSpacing: "3px",
          fontWeight: 500,
          color:
            "rgba(255,255,255,0.55)",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          borderTop:
            "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: 20,
              minHeight: 42,
              borderBottom:
                "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              style={{
                fontSize: 8,
                letterSpacing:
                  "1.4px",
                color:
                  "rgba(255,255,255,0.42)",
              }}
            >
              {item.label}
            </span>

            <span
              style={{
                fontSize: 11,
                letterSpacing:
                  "0.4px",
                textAlign: "right",
                color:
                  "rgba(255,255,255,0.9)",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RevueltoShowroom;