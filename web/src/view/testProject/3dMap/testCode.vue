<template>
  <div ref="threeContainer"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";

import * as THREE from "three";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

const threeContainer = ref();
let camera, scene, renderer;
let mesh;

const initThreeJS = () => {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // camera.position.z = 5;

  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  threeContainer.value.appendChild(renderer.domElement);

  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();
  mtlLoader.load("/threeMapMode/model.mtl", (materials) => {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load(
      "/threeMapMode/model.obj",
      (object) => {
        scene.add(object);
        camera.position.z = 5;
        animate();
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  });
  console.log("mtlLoader", mtlLoader);
};

const animate = () => {
  requestAnimationFrame(animate);

  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.02;

  renderer.render(scene, camera);
};

onMounted(() => {
  initThreeJS();
  animate();
});
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>
