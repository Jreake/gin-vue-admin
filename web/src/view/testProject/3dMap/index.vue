<template>
  <div id="vr-page">
    <div id="vr-model"></div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import vrRenderModel from "./vrRenderModel";
onMounted(async () => {
  const modelApi = new vrRenderModel("#vr-model");
  // 17
  const load = await modelApi.init("threeFile/glb/glb-6.glb", "glb");
});
</script>

<style lang="scss" scoped>
#vr-page {
  position: relative;
  width: 100%;
  height: 100vh;
  #vr-model {
    width: 100%;
    height: 100%;
  }
}
#video {
  display: none;
  object-fit: cover;
}
</style>
