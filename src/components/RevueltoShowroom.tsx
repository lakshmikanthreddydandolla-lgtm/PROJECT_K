import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CameraControls,
  ContactShadows,
  Environment,
} from "@react-three/drei";

import {
  Canvas,
} from "@react-three/fiber";

import RevueltoModel from "./RevueltoModel";
import Hotspot from "./Hotspot";
import VehicleInfoPanel from "./VehicleInfoPanel";
import PartInspectionViewer from "./PartInspectionViewer";

/* =========================================================
   TYPES
========================================================= */

interface InspectionTarget {
  cameraPosition: [
    number,
    number,
    number
  ];
  target: [
    number,
    number,
    number
  ];
}

type ViewSection =
  | "front"
  | "side"
  | "rear";

type DisplayMode =
  | "normal"
  | "technical";

interface ComponentPart {
  id: string;
  name: string;
  code: string;
  description: string;
  modelPath?: string;
  modelScale?: number;
  modelPosition?: [
    number,
    number,
    number
  ];
  cameraDistance?: number;
  available: boolean;
}

/* =========================================================
   COMPONENT 3D VIEW DATA
========================================================= */

const COMPONENT_PARTS: ComponentPart[] = [
  {
    id: "wheel",
    name: "WHEEL",
    code: "CMP-01",
    description:
      "Detailed 3D inspection of the performance wheel assembly.",
    modelPath:
      "/models/inspection/wheels.glb",
    modelScale: 0.62,
    modelPosition: [0, 0.15, 0],
    cameraDistance: 4.8,
    available: true,
  },

  {
    id: "brake",
    name: "BRAKE SYSTEM",
    code: "CMP-02",
    description:
      "High-performance braking hardware. Dedicated inspection model pending.",
    available: false,
  },

  {
    id: "caliper",
    name: "BRAKE CALIPER",
    code: "CMP-03",
    description:
      "Performance brake caliper assembly. Dedicated inspection model pending.",
    available: false,
  },

  {
    id: "disc",
    name: "BRAKE DISC",
    code: "CMP-04",
    description:
      "Carbon-ceramic braking disc assembly. Dedicated inspection model pending.",
    available: false,
  },

  {
    id: "engine",
    name: "V12 ENGINE",
    code: "CMP-05",
    description:
      "6.5-litre naturally aspirated V12 power unit. Dedicated inspection model pending.",
    available: false,
  },

  {
    id: "suspension",
    name: "SUSPENSION",
    code: "CMP-06",
    description:
      "Performance suspension architecture. Dedicated inspection model pending.",
    available: false,
  },
];

/* =========================================================
   VIEW CAMERA POSITIONS
========================================================= */

const VIEW_TARGETS: Record<
  ViewSection,
  InspectionTarget
> = {
  front: {
    cameraPosition: [
      -6,
      2.3,
      0,
    ],
    target: [
      0,
      0.55,
      0,
    ],
  },

  side: {
    cameraPosition: [
      0,
      2.2,
      6,
    ],
    target: [
      0,
      0.55,
      0,
    ],
  },

  rear: {
    cameraPosition: [
      6,
      2.3,
      0,
    ],
    target: [
      0,
      0.55,
      0,
    ],
  },
};

/* =========================================================
   HERO CAMERA
========================================================= */

const HERO_CAMERA: InspectionTarget = {
  cameraPosition: [
    6.5,
    2.4,
    5.2,
  ],
  target: [
    0,
    0.55,
    0,
  ],
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
    useRef<CameraControls | null>(
      null
    );

  useEffect(() => {
    const controls =
      controlsRef.current;

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
  }, [
    target,
    section,
    resetToken,
  ]);

  return (
    <CameraControls
      ref={controlsRef}
      minDistance={3}
      maxDistance={12}
      minPolarAngle={
        Math.PI / 4
      }
      maxPolarAngle={
        Math.PI / 2.05
      }
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
      value:
        "V12 + 3 Electric Motors",
    },
    {
      label: "BATTERY",
      value: "Lithium-ion",
    },
    {
      label: "TRANSMISSION",
      value:
        "8-speed Dual Clutch",
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
      value:
        "Electric Power Steering",
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
  const [
    section,
    setSection,
  ] = useState<ViewSection | null>(
    null
  );

  const [
    inspectionTarget,
    setInspectionTarget,
  ] =
    useState<InspectionTarget | null>(
      null
    );

  const [
    selectedDetail,
    setSelectedDetail,
  ] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [
    resetToken,
    setResetToken,
  ] = useState(0);

  const [
    showSpecifications,
    setShowSpecifications,
  ] = useState(false);

  const [
    introComplete,
    setIntroComplete,
  ] = useState(false);

  /* =====================================================
     TECHNICAL MODE
  ===================================================== */

  const [
    displayMode,
    setDisplayMode,
  ] = useState<DisplayMode>(
    "normal"
  );

  const technicalMode =
    displayMode === "technical";

  /* =====================================================
     COMPONENT 3D VIEW STATE
  ===================================================== */

  const [
    showComponents,
    setShowComponents,
  ] = useState(false);

  const [
    selectedPart,
    setSelectedPart,
  ] =
    useState<ComponentPart | null>(
      null
    );

  /* =====================================================
     INTRO
  ===================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
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
    setSection(null);
    setSelectedPart(null);

    setDisplayMode("normal");

    setShowComponents(true);
  }

  /* =====================================================
     CLOSE COMPONENTS
  ===================================================== */

  function closeComponents() {
    setShowComponents(false);
    setSelectedPart(null);

    setResetToken(
      (previous) =>
        previous + 1
    );
  }

  /* =====================================================
     SELECT COMPONENT
  ===================================================== */

  function selectComponent(
    component: ComponentPart
  ) {
    if (!component.available) {
      return;
    }

    setSelectedPart(component);
  }

  /* =====================================================
     INSPECT VEHICLE HOTSPOT
  ===================================================== */

  function inspect(
    cameraPosition: [
      number,
      number,
      number
    ],
    target: [
      number,
      number,
      number
    ],
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
     CHANGE VEHICLE VIEW
  ===================================================== */

  function changeSection(
    newSection: ViewSection
  ) {
    setShowSpecifications(false);
    setShowComponents(false);
    setSelectedPart(null);

    setSection(newSection);
    setInspectionTarget(null);
    setSelectedDetail(null);
  }

  /* =====================================================
     CLOSE HOTSPOT INSPECTION
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
    setSelectedPart(null);

    setInspectionTarget(null);
    setSelectedDetail(null);

    setDisplayMode("normal");
  }

  /* =====================================================
     TECHNICAL MODE
  ===================================================== */

  function toggleTechnicalMode() {
    setDisplayMode(
      (previous) =>
        previous === "normal"
          ? "technical"
          : "normal"
    );

    /*
     * Technical mode is a presentation layer.
     * We keep the current camera/view untouched.
     */

    setShowSpecifications(false);
    setInspectionTarget(null);
    setSelectedDetail(null);
  }

  /* =====================================================
     RETURN TO EXPLORE
  ===================================================== */

  function returnToExplore() {
    setShowSpecifications(false);
    setShowComponents(false);
    setSelectedPart(null);

    setSection(null);
    setInspectionTarget(null);
    setSelectedDetail(null);

    setDisplayMode("normal");

    setResetToken(
      (previous) =>
        previous + 1
    );
  }

  /* =====================================================
     COMPONENT 3D INSPECTION SCREEN
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
          modelPath={
            selectedPart.modelPath!
          }
          modelScale={
            selectedPart.modelScale
          }
          modelPosition={
            selectedPart.modelPosition
          }
        />

        {/* =================================================
            TOP LEFT NAVIGATION
        ================================================= */}

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
            onClick={() =>
              setSelectedPart(null)
            }
            style={{
              height: 38,
              padding:
                "0 17px",
              border:
                "1px solid rgba(255,255,255,0.18)",
              background:
                "rgba(5,5,5,0.82)",
              color:
                "rgba(255,255,255,0.82)",
              fontSize: 9,
              letterSpacing: "2px",
              cursor: "pointer",
              backdropFilter:
                "blur(14px)",
            }}
          >
            ← COMPONENTS
          </button>

          <button
            onClick={
              closeComponents
            }
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
              backdropFilter:
                "blur(14px)",
            }}
            aria-label="Close component inspection"
          >
            ×
          </button>
        </div>

        {/* =================================================
            PART INFORMATION
        ================================================= */}

        <div
          style={{
            position: "fixed",
            left: 28,
            bottom: 32,
            zIndex: 100,
            maxWidth: 430,
            padding:
              "22px 24px",
            background:
              "rgba(5,5,5,0.82)",
            border:
              "1px solid rgba(255,255,255,0.13)",
            backdropFilter:
              "blur(18px)",
          }}
        >
          <div
            style={{
              fontSize: 8,
              letterSpacing:
                "3px",
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
              letterSpacing:
                "3px",
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
              letterSpacing:
                "0.4px",
              color:
                "rgba(255,255,255,0.48)",
            }}
          >
            {selectedPart.description}
          </div>
        </div>

        {/* =================================================
            TOP RIGHT BRAND
        ================================================= */}

        <div
          style={{
            position: "fixed",
            top: 28,
            right: 30,
            zIndex: 100,
            textAlign: "right",
            pointerEvents:
              "none",
          }}
        >
          <div
            style={{
              fontSize: 8,
              letterSpacing:
                "4px",
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
              letterSpacing:
                "4px",
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

  /* =====================================================
     STANDALONE COMPONENTS 3D VIEW
  ===================================================== */

  if (showComponents) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          background: "#030303",
          color: "white",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        {/* =================================================
            BACKGROUND GRID
        ================================================= */}

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            pointerEvents:
              "none",
            backgroundImage: `
              linear-gradient(
                rgba(255,255,255,0.025) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.025) 1px,
                transparent 1px
              )
            `,
            backgroundSize:
              "70px 70px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        {/* =================================================
            TOP LEFT BRAND
        ================================================= */}

        <div
          style={{
            position:
              "absolute",
            top: 28,
            left: 30,
            zIndex: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 8,
              letterSpacing:
                "4px",
              color:
                "rgba(255,255,255,0.4)",
            }}
          >
            LAMBORGHINI
          </p>

          <h1
            style={{
              margin:
                "7px 0 4px",
              fontSize: 22,
              fontWeight: 300,
              letterSpacing:
                "5px",
              color: "white",
            }}
          >
            REVUELTO
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 7,
              letterSpacing:
                "2.5px",
              color:
                "rgba(255,255,255,0.32)",
            }}
          >
            COMPONENT ARCHITECTURE
          </p>
        </div>

        {/* =================================================
            BACK TO SHOWROOM
        ================================================= */}

        <button
          onClick={
            closeComponents
          }
          style={{
            position:
              "absolute",
            top: 28,
            right: 30,
            zIndex: 10,
            padding:
              "10px 15px",
            border:
              "1px solid rgba(255,255,255,0.15)",
            background:
              "rgba(5,5,5,0.72)",
            color:
              "rgba(255,255,255,0.72)",
            cursor:
              "pointer",
            fontSize: 8,
            letterSpacing:
              "2px",
            backdropFilter:
              "blur(12px)",
          }}
        >
          ← SHOWROOM
        </button>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          style={{
            position:
              "relative",
            zIndex: 5,
            width: "100%",
            height: "100%",
            display:
              "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "110px 30px 70px",
            boxSizing:
              "border-box",
          }}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                52,
            }}
          >
            <div
              style={{
                fontSize: 8,
                letterSpacing:
                  "4px",
                color:
                  "rgba(255,255,255,0.34)",
                marginBottom:
                  13,
              }}
            >
              INTERACTIVE 3D INSPECTION
            </div>

            <h2
              style={{
                margin: 0,
                fontSize:
                  "clamp(34px, 5vw, 62px)",
                fontWeight: 300,
                letterSpacing:
                  "10px",
                lineHeight: 1,
              }}
            >
              COMPONENTS
            </h2>

            <p
              style={{
                margin:
                  "18px auto 0",
                maxWidth: 480,
                fontSize: 9,
                lineHeight: 1.8,
                letterSpacing:
                  "1px",
                color:
                  "rgba(255,255,255,0.38)",
              }}
            >
              SELECT A COMPONENT TO ENTER
              ITS DEDICATED 3D INSPECTION
              ENVIRONMENT.
            </p>
          </div>

          {/* =================================================
              COMPONENT GRID
          ================================================= */}

          <div
            style={{
              width:
                "min(1000px, 94vw)",
              display:
                "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {COMPONENT_PARTS.map(
              (component) => (
                <ComponentCard
                  key={component.id}
                  component={
                    component
                  }
                  onClick={() =>
                    selectComponent(
                      component
                    )
                  }
                />
              )
            )}
          </div>

          {/* =================================================
              FOOTER STATUS
          ================================================= */}

          <div
            style={{
              marginTop: 35,
              display:
                "flex",
              alignItems:
                "center",
              gap: 10,
              fontSize: 7,
              letterSpacing:
                "2.5px",
              color:
                "rgba(255,255,255,0.27)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius:
                  "50%",
                background:
                  "white",
                opacity: 0.8,
              }}
            />

            ACTIVE 3D MODELS

            <span
              style={{
                margin:
                  "0 5px",
                opacity: 0.3,
              }}
            >
              /
            </span>

            01
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN SHOWROOM
  ===================================================== */

  return (
    <div
      className="revuelto-showroom"
      style={{
        width: "100%",
        height: "100vh",
        position:
          "relative",
        overflow:
          "hidden",
        background:
          "#030303",
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
          display:
            "flex",
          flexDirection:
            "column",
          alignItems:
            "center",
          justifyContent:
            "center",
          background:
            "#030303",
          color: "white",
          opacity:
            introComplete
              ? 0
              : 1,
          pointerEvents:
            introComplete
              ? "none"
              : "auto",
          transition:
            "opacity 1.2s ease",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            position:
              "absolute",
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
            position:
              "absolute",
            top:
              "calc(50% - 70px)",
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
            letterSpacing:
              "7px",
            fontWeight: 400,
            opacity: 0.65,
          }}
        >
          LAMBORGHINI
        </p>

        <h1
          style={{
            margin:
              "16px 0 10px",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize:
              "clamp(42px, 8vw, 96px)",
            fontWeight: 300,
            letterSpacing:
              "12px",
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
            letterSpacing:
              "4px",
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
          position:
            "absolute",
          zIndex: 20,
          top: 26,
          left: 30,
          opacity:
            introComplete
              ? 1
              : 0,
          transition:
            "opacity 1.2s ease",
          pointerEvents:
            introComplete
              ? "auto"
              : "none",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 8,
            letterSpacing:
              "4px",
            color:
              "rgba(255,255,255,0.4)",
          }}
        >
          LAMBORGHINI
        </p>

        <h1
          style={{
            margin:
              "7px 0 4px",
            fontSize: 22,
            fontWeight: 300,
            letterSpacing:
              "5px",
            color: "white",
          }}
        >
          REVUELTO
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 7,
            letterSpacing:
              "2.5px",
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
          position:
            "absolute",
          top: 28,
          right: 30,
          zIndex: 30,
          padding:
            "10px 15px",
          border:
            "1px solid rgba(255,255,255,0.15)",
          background:
            "rgba(5,5,5,0.5)",
          color:
            "rgba(255,255,255,0.7)",
          cursor:
            "pointer",
          fontSize: 8,
          letterSpacing:
            "2px",
          backdropFilter:
            "blur(12px)",
          opacity:
            introComplete
              ? 1
              : 0,
          transition:
            "opacity 1.2s ease",
          pointerEvents:
            introComplete
              ? "auto"
              : "none",
        }}
      >
        ← BACK
      </button>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        style={{
          position:
            "absolute",
          zIndex: 25,
          left: "50%",
          top: 118,
          transform:
            "translateX(-50%)",
          display:
            "flex",
          alignItems:
            "center",
          gap: 3,
          padding: 5,
          background:
            "rgba(5,5,5,0.76)",
          border:
            "1px solid rgba(255,255,255,0.12)",
          backdropFilter:
            "blur(18px)",
          boxShadow:
            "0 12px 45px rgba(0,0,0,0.35)",
          opacity:
            introComplete
              ? 1
              : 0,
          transition:
            "opacity 1.2s ease",
          pointerEvents:
            introComplete
              ? "auto"
              : "none",
          whiteSpace:
            "nowrap",
        }}
      >
        <NavButton
          label="FRONT"
          active={
            section === "front"
          }
          onClick={() =>
            changeSection(
              "front"
            )
          }
        />

        <NavButton
          label="SIDE"
          active={
            section === "side"
          }
          onClick={() =>
            changeSection(
              "side"
            )
          }
        />

        <NavButton
          label="REAR"
          active={
            section === "rear"
          }
          onClick={() =>
            changeSection(
              "rear"
            )
          }
        />

        <NavDivider />

        <NavButton
          label="EXPLORE"
          active={
            section === null &&
            !showSpecifications &&
            !technicalMode
          }
          onClick={
            returnToExplore
          }
        />

        <NavButton
          label="SPECS"
          active={
            showSpecifications
          }
          onClick={
            toggleSpecifications
          }
        />

        <NavButton
          label="COMPONENTS"
          active={false}
          onClick={
            openComponents
          }
        />

        <NavDivider />

        <NavButton
          label="TECHNICAL"
          active={
            technicalMode
          }
          onClick={
            toggleTechnicalMode
          }
        />
      </div>

      {/* =================================================
          TECHNICAL MODE VISUAL OVERLAY
      ================================================= */}

      <div
        className="technical-overlay"
        style={{
          position:
            "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents:
            "none",
          opacity:
            technicalMode
              ? 1
              : 0,
          transition:
            "opacity 0.8s ease",
          background: `
            linear-gradient(
              rgba(120,150,170,0.025),
              rgba(120,150,170,0.025)
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 7px,
              rgba(150,180,200,0.018) 8px
            )
          `,
        }}
      />

      {/* =================================================
          TECHNICAL MODE CORNER MARKERS
      ================================================= */}

      {technicalMode && (
        <>
          <div
            style={{
              position:
                "absolute",
              zIndex: 15,
              top: 165,
              left: 30,
              pointerEvents:
                "none",
              color:
                "rgba(180,210,225,0.6)",
            }}
          >
            <div
              style={{
                fontSize: 7,
                letterSpacing:
                  "3px",
                marginBottom: 7,
              }}
            >
              SYSTEM VISUALIZATION
            </div>

            <div
              style={{
                fontSize: 10,
                letterSpacing:
                  "2px",
                color:
                  "rgba(210,230,240,0.8)",
              }}
            >
              TECHNICAL MODE
            </div>
          </div>

          <div
            style={{
              position:
                "absolute",
              zIndex: 15,
              right: 30,
              bottom: 30,
              pointerEvents:
                "none",
              textAlign:
                "right",
              color:
                "rgba(180,210,225,0.48)",
            }}
          >
            <div
              style={{
                fontSize: 7,
                letterSpacing:
                  "2.5px",
              }}
            >
              EXTERIOR STRUCTURE
            </div>

            <div
              style={{
                fontSize: 7,
                letterSpacing:
                  "2px",
                marginTop: 6,
              }}
            >
              CONCEPTUAL VISUALIZATION
            </div>
          </div>
        </>
      )}

      {/* =================================================
          3D SHOWROOM
      ================================================= */}

      <div
        style={{
          position:
            "absolute",
          inset: 0,
          opacity:
            introComplete
              ? 1
              : 0,
          transition:
            "opacity 1.4s ease",
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [
              6.5,
              2.4,
              5.2,
            ],
            fov: 42,
          }}
        >
          <SmoothCameraController
            target={
              inspectionTarget
            }
            section={section}
            resetToken={
              resetToken
            }
          />

          <Environment
            preset="studio"
          />

          <ambientLight
            intensity={0.42}
          />

          <directionalLight
            position={[
              4,
              6,
              4,
            ]}
            intensity={1.8}
            castShadow
          />

          <directionalLight
            position={[
              -4,
              3,
              2,
            ]}
            intensity={0.45}
          />

          <mesh
            rotation={[
              -Math.PI / 2,
              0,
              0,
            ]}
            position={[
              1.3,
              -0.08,
              0,
            ]}
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

          <RevueltoModel
            technicalMode={
              technicalMode
            }
          />

          {/* =================================================
              FRONT HOTSPOTS
          ================================================= */}

          {section === "front" &&
            !technicalMode && (
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
                      [
                        -3.2,
                        0.8,
                        2.25,
                      ],
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
                      [
                        -3.2,
                        0.8,
                        -2.25,
                      ],
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
                      [
                        -3.5,
                        0.7,
                        1.6,
                      ],
                      [
                        -2.15,
                        0.3,
                        0,
                      ],
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
                      [
                        -3.3,
                        1.2,
                        1.7,
                      ],
                      [
                        -2.2,
                        0.55,
                        0.55,
                      ],
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

          {section === "side" &&
            !technicalMode && (
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
                      [
                        0,
                        1,
                        3,
                      ],
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
                      [
                        -0.1,
                        0.85,
                        2.8,
                      ],
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
                      [
                        1.7,
                        1.35,
                        3,
                      ],
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
                      [
                        2.8,
                        1,
                        2.8,
                      ],
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

          {section === "rear" &&
            !technicalMode && (
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
                      [
                        4.5,
                        0.55,
                        1.15,
                      ],
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
                      [
                        4.45,
                        0.95,
                        1.15,
                      ],
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
                      [
                        4.35,
                        0.5,
                        1.05,
                      ],
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
          INFORMATION PANEL
      ================================================= */}

      {selectedDetail &&
        !showSpecifications &&
        !technicalMode && (
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
            position:
              "fixed",
            zIndex: 30,
            top: "150px",
            right: "28px",
            bottom: "28px",
            width: "390px",
            maxWidth:
              "calc(100vw - 56px)",
            overflowY:
              "auto",
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
              display:
                "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
              marginBottom:
                30,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 9,
                  letterSpacing:
                    "3px",
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
                  letterSpacing:
                    "4px",
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
                cursor:
                  "pointer",
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
            introComplete
              ? 1
              : 0,
          transition:
            "opacity 1.2s ease",
          pointerEvents:
            introComplete
              ? "auto"
              : "none",
        }}
      >
        {technicalMode
          ? "TECHNICAL VISUALIZATION"
          : "DRAG TO ROTATE"}

        <span>•</span>

        {technicalMode
          ? "CONCEPTUAL SYSTEM LAYER"
          : "SCROLL TO ZOOM"}

        <span>•</span>

        {technicalMode
          ? "SELECT TECHNICAL MODE"
          : "HOVER HOTSPOTS"}

        <span>•</span>

        {technicalMode
          ? "PHASE 01"
          : "CLICK TO INSPECT"}
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

          @media (max-width: 1050px) {
            .revuelto-showroom button {
              font-size: 7px;
            }
          }

          @media (max-width: 800px) {
            .project-k-component-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );
            }
          }

          @media (max-width: 700px) {
            .revuelto-showroom {
              overflow-y: auto;
            }
          }

          @media (max-width: 520px) {
            .project-k-component-grid {
              grid-template-columns:
                1fr;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   COMPONENT CARD
========================================================= */

interface ComponentCardProps {
  component: ComponentPart;
  onClick: () => void;
}

function ComponentCard({
  component,
  onClick,
}: ComponentCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={
        !component.available
      }
      style={{
        position:
          "relative",
        minHeight: 150,
        padding:
          "22px 23px",
        textAlign:
          "left",
        border:
          component.available
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid rgba(255,255,255,0.07)",
        background:
          component.available
            ? "rgba(255,255,255,0.045)"
            : "rgba(255,255,255,0.018)",
        color: "white",
        cursor:
          component.available
            ? "pointer"
            : "not-allowed",
        opacity:
          component.available
            ? 1
            : 0.45,
        transition:
          "all 0.25s ease",
        overflow:
          "hidden",
      }}
      onMouseEnter={(
        event
      ) => {
        if (
          !component.available
        ) {
          return;
        }

        event.currentTarget.style.background =
          "rgba(255,255,255,0.085)";

        event.currentTarget.style.borderColor =
          "rgba(255,255,255,0.42)";

        event.currentTarget.style.transform =
          "translateY(-3px)";
      }}
      onMouseLeave={(
        event
      ) => {
        if (
          !component.available
        ) {
          return;
        }

        event.currentTarget.style.background =
          "rgba(255,255,255,0.045)";

        event.currentTarget.style.borderColor =
          "rgba(255,255,255,0.18)";

        event.currentTarget.style.transform =
          "translateY(0)";
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
            28,
        }}
      >
        <span
          style={{
            fontSize: 7,
            letterSpacing:
              "2.5px",
            color:
              "rgba(255,255,255,0.32)",
          }}
        >
          {component.code}
        </span>

        <span
          style={{
            fontSize: 7,
            letterSpacing:
              "2px",
            color:
              component.available
                ? "rgba(255,255,255,0.75)"
                : "rgba(255,255,255,0.25)",
          }}
        >
          {component.available
            ? "3D READY"
            : "COMING SOON"}
        </span>
      </div>

      <div
        style={{
          fontSize: 13,
          letterSpacing:
            "3px",
          fontWeight: 400,
          marginBottom:
            12,
        }}
      >
        {component.name}
      </div>

      <div
        style={{
          maxWidth: 270,
          fontSize: 8,
          lineHeight: 1.65,
          letterSpacing:
            "0.5px",
          color:
            "rgba(255,255,255,0.36)",
        }}
      >
        {component.description}
      </div>

      <div
        style={{
          position:
            "absolute",
          left: 0,
          bottom: 0,
          width:
            component.available
              ? "100%"
              : "0%",
          height: 1,
          background:
            "rgba(255,255,255,0.8)",
          transition:
            "width 0.3s ease",
        }}
      />
    </button>
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
        position:
          "relative",
        padding:
          "11px 17px",
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
        cursor:
          "pointer",
        fontSize: 8,
        letterSpacing:
          "2.3px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        transition:
          "all 0.22s ease",
      }}
      onMouseEnter={(
        event
      ) => {
        event.currentTarget.style.color =
          "white";

        if (!active) {
          event.currentTarget.style.background =
            "rgba(255,255,255,0.055)";
        }
      }}
      onMouseLeave={(
        event
      ) => {
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
            background:
              "white",
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
        marginBottom:
          28,
      }}
    >
      <h3
        style={{
          margin:
            "0 0 12px",
          fontSize: 9,
          letterSpacing:
            "3px",
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
        {items.map(
          (item) => (
            <div
              key={
                item.label
              }
              style={{
                display:
                  "flex",
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
                  textAlign:
                    "right",
                  color:
                    "rgba(255,255,255,0.9)",
                }}
              >
                {item.value}
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default RevueltoShowroom;