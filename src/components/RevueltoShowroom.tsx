import { useRef, useState } from "react";
import {
  CameraControls,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import RevueltoModel from "./RevueltoModel";
import Hotspot from "./Hotspot";
import VehicleInfoPanel from "./VehicleInfoPanel";

interface InspectionTarget {
  cameraPosition: [number, number, number];
  target: [number, number, number];
}

type ViewSection = "front" | "side" | "rear";

interface SmoothCameraControllerProps {
  target: InspectionTarget | null;
  section: ViewSection | null;
}


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
   CAMERA CONTROLLER
========================================================= */

function SmoothCameraController({
  target,
  section,
}: SmoothCameraControllerProps) {

  const controlsRef =
    useRef<CameraControls | null>(null);

  useFrame(() => {

    const controls =
      controlsRef.current;

    if (!controls) {
      return;
    }


    /* =====================================================
       COMPONENT INSPECTION
    ===================================================== */

    if (target) {

      controls.setLookAt(
        target.cameraPosition[0],
        target.cameraPosition[1],
        target.cameraPosition[2],

        target.target[0],
        target.target[1],
        target.target[2],

        true
      );

      return;
    }


    /* =====================================================
       SELECTED VIEW
    ===================================================== */

    if (section) {

      const view =
        VIEW_TARGETS[section];

      controls.setLookAt(
        view.cameraPosition[0],
        view.cameraPosition[1],
        view.cameraPosition[2],

        view.target[0],
        view.target[1],
        view.target[2],

        true
      );

      return;
    }

  });


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
   MAIN SHOWROOM
========================================================= */

interface RevueltoShowroomProps {
  onBack: () => void;
}

function RevueltoShowroom({
  onBack,
}: RevueltoShowroomProps) {


  /* =====================================================
     VIEW SECTION

     NULL = NO VIEW SELECTED
===================================================== */

  const [
    section,
    setSection,
  ] = useState<ViewSection | null>(null);


  /* =====================================================
     INSPECTION
===================================================== */

  const [
    inspectionTarget,
    setInspectionTarget,
  ] = useState<InspectionTarget | null>(null);


  /* =====================================================
     INFORMATION PANEL
===================================================== */

  const [
    selectedDetail,
    setSelectedDetail,
  ] = useState<{
    title: string;
    description: string;
  } | null>(null);


  /* =====================================================
     INSPECT FUNCTION
===================================================== */

  function inspect(
    cameraPosition: [number, number, number],
    target: [number, number, number],
    title: string,
    description: string
  ) {

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

    setSection(newSection);

    /*
     * Remove any previous component inspection.
     * This lets the selected view camera take control.
     */

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


  return (
    <div className="revuelto-showroom">


      {/* =================================================
          TOP UI
      ================================================= */}

      <div className="showroom-ui">

        <div>

          <p className="showroom-brand">
            LAMBORGHINI
          </p>

          <h1>
            REVUELTO
          </h1>

          <p className="showroom-subtitle">
            INTERACTIVE VEHICLE INSPECTION
          </p>

        </div>


        <button
          className="showroom-back"
          onClick={onBack}
        >
          ← BACK
        </button>

      </div>


      {/* =================================================
          VIEW SELECTOR
      ================================================= */}

      <div
        style={{
          position: "absolute",
          zIndex: 15,
          left: "50%",
          top: "45px",
          transform: "translateX(-50%)",

          display: "flex",
          gap: "8px",
        }}
      >


        {/* =================================================
            FRONT BUTTON
        ================================================= */}

        <button
          onClick={() =>
            changeSection("front")
          }

          style={{
            padding: "10px 18px",

            border:
              section === "front"
                ? "1px solid white"
                : "1px solid #444",

            background:
              section === "front"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.35)",

            color: "white",

            cursor: "pointer",

            fontSize: "10px",

            letterSpacing: "2px",
          }}
        >
          FRONT
        </button>


        {/* =================================================
            SIDE BUTTON
        ================================================= */}

        <button
          onClick={() =>
            changeSection("side")
          }

          style={{
            padding: "10px 18px",

            border:
              section === "side"
                ? "1px solid white"
                : "1px solid #444",

            background:
              section === "side"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.35)",

            color: "white",

            cursor: "pointer",

            fontSize: "10px",

            letterSpacing: "2px",
          }}
        >
          SIDE
        </button>


        {/* =================================================
            REAR BUTTON
        ================================================= */}

        <button
          onClick={() =>
            changeSection("rear")
          }

          style={{
            padding: "10px 18px",

            border:
              section === "rear"
                ? "1px solid white"
                : "1px solid #444",

            background:
              section === "rear"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.35)",

            color: "white",

            cursor: "pointer",

            fontSize: "10px",

            letterSpacing: "2px",
          }}
        >
          REAR
        </button>

      </div>


      {/* =================================================
          3D SCENE
      ================================================= */}

      <Canvas
        shadows

        camera={{
          position: [
            6,
            2.5,
            6,
          ],

          fov: 45,
        }}
      >


        {/* =================================================
            CAMERA
        ================================================= */}

        <SmoothCameraController
          target={inspectionTarget}
          section={section}
        />


        {/* =================================================
            ENVIRONMENT
        ================================================= */}

        <Environment
          preset="studio"
        />


        {/* =================================================
            LIGHTING
        ================================================= */}

        <ambientLight
          intensity={0.45}
        />

        <directionalLight
          position={[4, 6, 4]}
          intensity={2}
          castShadow
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

          position={[
            1.3,
            -0.08,
            0,
          ]}

          receiveShadow
        >

          <planeGeometry
            args={[
              30,
              30,
            ]}
          />

          <meshStandardMaterial
            color="#090909"
            roughness={0.8}
            metalness={0.1}
          />

        </mesh>


        {/* =================================================
            CONTACT SHADOW
        ================================================= */}

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


        {/* =================================================
            VEHICLE
        ================================================= */}

        <RevueltoModel />


        {/* =================================================
            FRONT HOTSPOTS
        ================================================= */}

        {section === "front" && (
          <>


            {/* =================================================
                LEFT HEADLIGHT
            ================================================= */}

            <Hotspot

              position={[
                -1.69,
                0.48,
                0.99,
              ]}

              label="LEFT HEADLIGHT"

              description={
                "Signature LED headlight."
              }

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


            {/* =================================================
                RIGHT HEADLIGHT
            ================================================= */}

            <Hotspot

              position={[
                -1.69,
                0.48,
                -0.99,
              ]}

              label="RIGHT HEADLIGHT"

              description={
                "Signature LED headlight."
              }

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


            {/* =================================================
                FRONT AERO
            ================================================= */}

            <Hotspot

              position={[
                -2.15,
                0.30,
                0,
              ]}

              label="FRONT AERO"

              description={
                "Front aerodynamic elements."
              }

              onClick={() => {

                inspect(

                  [
                    -3.5,
                    0.7,
                    1.6,
                  ],

                  [
                    -2.15,
                    0.30,
                    0,
                  ],

                  "FRONT AERO",

                  "The front aerodynamic surfaces manage airflow around the vehicle and contribute to its aggressive front design."
                );

              }}

            />


            {/* =================================================
                FRONT BODY
            ================================================= */}

            <Hotspot

              position={[
                -2.20,
                0.55,
                0.55,
              ]}

              label="FRONT BODY"

              description={
                "Sculpted front bodywork."
              }

              onClick={() => {

                inspect(

                  [
                    -3.3,
                    1.2,
                    1.7,
                  ],

                  [
                    -2.20,
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

        {section === "side" && (
          <>


            {/* =================================================
                FRONT WHEEL
            ================================================= */}

            <Hotspot

              position={[
                -0.65,
                0.45,
                1.0,
              ]}

              label="FRONT WHEEL"

              description={
                "Front wheel and tire."
              }

              onClick={() => {

                inspect(

                  [
                    0,
                    1.0,
                    3.0,
                  ],

                  [
                    -0.65,
                    0.45,
                    1.0,
                  ],

                  "FRONT WHEEL",

                  "The front wheel and tire package is designed around the vehicle's high-performance character."
                );

              }}

            />


            {/* =================================================
                BRAKE
            ================================================= */}

            <Hotspot

              position={[
                -0.65,
                0.55,
                1.05,
              ]}

              label="BRAKE"

              description={
                "Performance braking system."
              }

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


            {/* =================================================
                SIDE INTAKE
            ================================================= */}

            <Hotspot

              position={[
                0.9,
                0.65,
                0.75,
              ]}

              label="SIDE INTAKE"

              description={
                "Side aerodynamic intake."
              }

              onClick={() => {

                inspect(

                  [
                    1.7,
                    1.35,
                    3.0,
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


            {/* =================================================
                REAR WHEEL
            ================================================= */}

            <Hotspot

              position={[
                2.1,
                0.45,
                0.95,
              ]}

              label="REAR WHEEL"

              description={
                "Rear wheel and tire."
              }

              onClick={() => {

                inspect(

                  [
                    2.8,
                    1.0,
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

{section === "rear" && (
  <>

    {/* =================================================
        REAR DIFFUSER
    ================================================= */}

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


    {/* =================================================
        REAR LIGHTS
    ================================================= */}

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


    {/* =================================================
        EXHAUST
    ================================================= */}

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


      {/* =================================================
          INFORMATION PANEL
      ================================================= */}

      {selectedDetail && (

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
          BOTTOM CONTROLS
      ================================================= */}

      <div className="showroom-controls">

        DRAG TO ROTATE

        <span>
          •
        </span>

        SCROLL TO ZOOM

        <span>
          •
        </span>

        HOVER HOTSPOTS

        <span>
          •
        </span>

        CLICK TO INSPECT

      </div>

    </div>
  );
}


export default RevueltoShowroom;