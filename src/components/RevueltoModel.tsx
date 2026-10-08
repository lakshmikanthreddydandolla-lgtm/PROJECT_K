import {
  useGLTF,
  Center,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  useEffect,
  useRef,
} from "react";

import * as THREE from "three";

interface RevueltoModelProps {
  technicalMode?: boolean;
}

interface MaterialState {
  material: THREE.MeshPhysicalMaterial;

  color: THREE.Color;

  metalness: number;
  roughness: number;

  clearcoat: number;
  clearcoatRoughness: number;

  opacity: number;
  transparent: boolean;

  /*
   * Only exterior body materials should
   * participate in the technical transparency.
   */
  isBodyPaint: boolean;
}

/* =========================================================
   REVUELTO MODEL
========================================================= */

function RevueltoModel({
  technicalMode = false,
}: RevueltoModelProps) {
  const { scene } = useGLTF(
    "/models/free_-_high_quality_lamborghini_revuelto.glb"
  );

  const materialStates =
    useRef<MaterialState[]>([]);

  const initialized =
    useRef(false);

  /* =======================================================
     MODEL INFORMATION
  ======================================================= */

  const box =
    new THREE.Box3().setFromObject(scene);

  const size =
    new THREE.Vector3();

  const center =
    new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  /* =======================================================
     VEHICLE MATERIAL SETUP
  ======================================================= */

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(
        object.material
      )
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (
          !(material instanceof THREE.MeshPhysicalMaterial)
        ) {
          return;
        }

        const name =
          material.name.toLowerCase();

        /*
         * ---------------------------------------------------
         * IDENTIFY BODY MATERIALS
         * ---------------------------------------------------
         *
         * Only these materials are allowed to become
         * transparent during Technical Mode.
         *
         * Tires, glass, brakes, lights, carbon, etc.
         * remain physically solid.
         */

        const isBodyPaint =
          name.includes("mat_carpaintmain") ||
          name === "carpaintblack";

        /*
         * ---------------------------------------------------
         * CURRENT PROJECT_K VEHICLE MATERIAL SETUP
         * ---------------------------------------------------
         */

        if (
          name.includes(
            "mat_carpaintmain"
          )
        ) {
          material.color.set("#5a5a5a");

          material.metalness = 0.85;

          material.roughness = 0.12;

          material.clearcoat = 1;

          material.clearcoatRoughness = 0.04;
        }

        else if (
          name === "carpaintblack"
        ) {
          material.color.set("#202020");

          material.metalness = 0.65;

          material.roughness = 0.2;

          material.clearcoat = 0.8;

          material.clearcoatRoughness = 0.08;
        }

        else if (
          name.includes(
            "nerolowgloss"
          )
        ) {
          material.color.set("#161616");

          material.metalness = 0.05;

          material.roughness = 0.55;
        }

        /*
         * ---------------------------------------------------
         * SAVE NORMAL MATERIAL STATE
         * ---------------------------------------------------
         */

        materialStates.current.push({
          material,

          color:
            material.color.clone(),

          metalness:
            material.metalness,

          roughness:
            material.roughness,

          clearcoat:
            material.clearcoat,

          clearcoatRoughness:
            material.clearcoatRoughness,

          opacity:
            material.opacity,

          transparent:
            material.transparent,

          isBodyPaint,
        });

        material.needsUpdate = true;
      });
    });

    /*
     * -------------------------------------------------------
     * EXISTING MODEL INFORMATION LOGS
     * -------------------------------------------------------
     */

    console.log(
      "===== REVUELTO MODEL ====="
    );

    console.log(
      "MIN X:",
      box.min.x
    );

    console.log(
      "MIN Y:",
      box.min.y
    );

    console.log(
      "MIN Z:",
      box.min.z
    );

    console.log(
      "MAX X:",
      box.max.x
    );

    console.log(
      "MAX Y:",
      box.max.y
    );

    console.log(
      "MAX Z:",
      box.max.z
    );

    console.log(
      "SIZE X:",
      size.x
    );

    console.log(
      "SIZE Y:",
      size.y
    );

    console.log(
      "SIZE Z:",
      size.z
    );

    console.log(
      "CENTER X:",
      center.x
    );

    console.log(
      "CENTER Y:",
      center.y
    );

    console.log(
      "CENTER Z:",
      center.z
    );

    console.log(
      "=========================="
    );
  }, [scene]);

  /* =======================================================
     TECHNICAL MODE TRANSITION
  ======================================================= */

  useFrame(() => {
    const states =
      materialStates.current;

    if (!states.length) {
      return;
    }

    /*
     * Smooth transition.
     */

    const smoothing =
      1 -
      Math.pow(
        0.001,
        1 / 60
      );

    states.forEach((state) => {
      const material =
        state.material;

      /*
       * ===================================================
       * NORMAL MODE
       * ===================================================
       */

      const normalColor =
        state.color;

      const normalMetalness =
        state.metalness;

      const normalRoughness =
        state.roughness;

      const normalClearcoat =
        state.clearcoat;

      const normalClearcoatRoughness =
        state.clearcoatRoughness;

      const normalOpacity =
        state.opacity;

      const normalTransparent =
        state.transparent;

      /*
       * ===================================================
       * TECHNICAL MODE
       * ===================================================
       *
       * The technical presentation is intentionally
       * restrained.
       *
       * The car should still look like a car.
       * It should not become a translucent ghost.
       */

      const technicalColor =
  new THREE.Color(
    "#343b42"
  );

const technicalMetalness =
  0.18;

const technicalRoughness =
  0.58;

const technicalClearcoat =
  0.05;

const technicalClearcoatRoughness =
  0.35;

const technicalOpacity =
  0.48;
      /*
       * ===================================================
       * COLOR
       * ===================================================
       */

      material.color.lerp(
        state.isBodyPaint &&
        technicalMode
          ? technicalColor
          : normalColor,
        smoothing
      );

      /*
       * ===================================================
       * METALNESS
       * ===================================================
       */

      material.metalness =
        THREE.MathUtils.lerp(
          material.metalness,

          state.isBodyPaint &&
          technicalMode
            ? technicalMetalness
            : normalMetalness,

          smoothing
        );

      /*
       * ===================================================
       * ROUGHNESS
       * ===================================================
       */

      material.roughness =
        THREE.MathUtils.lerp(
          material.roughness,

          state.isBodyPaint &&
          technicalMode
            ? technicalRoughness
            : normalRoughness,

          smoothing
        );

      /*
       * ===================================================
       * CLEARCOAT
       * ===================================================
       */

      material.clearcoat =
        THREE.MathUtils.lerp(
          material.clearcoat,

          state.isBodyPaint &&
          technicalMode
            ? technicalClearcoat
            : normalClearcoat,

          smoothing
        );

      /*
       * ===================================================
       * CLEARCOAT ROUGHNESS
       * ===================================================
       */

      material.clearcoatRoughness =
        THREE.MathUtils.lerp(
          material.clearcoatRoughness,

          state.isBodyPaint &&
          technicalMode
            ? technicalClearcoatRoughness
            : normalClearcoatRoughness,

          smoothing
        );

      /*
       * ===================================================
       * OPACITY
       * ===================================================
       *
       * Body:
       *   Technical -> 0.76
       *   Normal    -> original value
       *
       * Everything else:
       *   Always -> original value
       */

      const targetOpacity =
        state.isBodyPaint &&
        technicalMode
          ? technicalOpacity
          : normalOpacity;

      material.opacity =
        THREE.MathUtils.lerp(
          material.opacity,
          targetOpacity,
          smoothing
        );

      /*
       * ===================================================
       * TRANSPARENCY
       * ===================================================
       *
       * Only body paint becomes transparent.
       *
       * When returning to Normal Mode, we explicitly
       * restore the original material state.
       */

      const targetTransparent =
        state.isBodyPaint &&
        technicalMode
          ? true
          : normalTransparent;

      if (
        material.transparent !==
        targetTransparent
      ) {
        material.transparent =
          targetTransparent;

        material.needsUpdate = true;
      }

      /*
       * ---------------------------------------------------
       * DEPTH WRITE
       * ---------------------------------------------------
       *
       * Keep normal depth behavior.
       * We are deliberately NOT turning the entire car
       * into a translucent rendering experiment.
       */

      if (!technicalMode) {
        material.depthWrite = true;
      }

      material.needsUpdate = true;
    });
  });

  /* =======================================================
     MODEL
  ======================================================= */

  return (
    <Center top>
      <primitive
        object={scene}
        scale={1}
      />
    </Center>
  );
}

/* =========================================================
   PRELOAD
========================================================= */

useGLTF.preload(
  "/models/free_-_high_quality_lamborghini_revuelto.glb"
);

export default RevueltoModel;