import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

function RevueltoModel() {
  const { scene } = useGLTF(
    "/models/free_-_high_quality_lamborghini_revuelto.glb"
  );

  const box = new THREE.Box3().setFromObject(scene);

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  console.log("===== REVUELTO MODEL =====");

  console.log("MIN X:", box.min.x);
  console.log("MIN Y:", box.min.y);
  console.log("MIN Z:", box.min.z);

  console.log("MAX X:", box.max.x);
  console.log("MAX Y:", box.max.y);
  console.log("MAX Z:", box.max.z);

  console.log("SIZE X:", size.x);
  console.log("SIZE Y:", size.y);
  console.log("SIZE Z:", size.z);

  console.log("CENTER X:", center.x);
  console.log("CENTER Y:", center.y);
  console.log("CENTER Z:", center.z);

  console.log("==========================");


  scene.traverse((object) => {

    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;


    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];


    materials.forEach((material) => {

      if (!(material instanceof THREE.MeshPhysicalMaterial)) {
        return;
      }


      const name = material.name.toLowerCase();


      /*
       * MAIN BODY PAINT
       */

      if (name.includes("mat_carpaintmain")) {

        material.color.set("#5a5a5a");

        material.metalness = 0.85;

        material.roughness = 0.12;

        material.clearcoat = 1;

        material.clearcoatRoughness = 0.04;

        material.needsUpdate = true;
      }


      /*
       * BLACK BODY PARTS
       */

      else if (name === "carpaintblack") {

        material.color.set("#202020");

        material.metalness = 0.65;

        material.roughness = 0.2;

        material.clearcoat = 0.8;

        material.clearcoatRoughness = 0.08;

        material.needsUpdate = true;
      }


      /*
       * LOW GLOSS BLACK
       */

      else if (name.includes("nerolowgloss")) {

        material.color.set("#161616");

        material.metalness = 0.05;

        material.roughness = 0.55;

        material.needsUpdate = true;
      }

    });

  });


  // Center's `top` alignment places the model's bottom at Y = 0.
  // The old centered-on-Y setup put half of the vehicle below the floor.
  return (
    <Center top>
      <primitive
        object={scene}
        scale={1}
      />
    </Center>
  );
}


useGLTF.preload(
  "/models/free_-_high_quality_lamborghini_revuelto.glb"
);


export default RevueltoModel;