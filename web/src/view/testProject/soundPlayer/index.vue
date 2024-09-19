<script setup>
import SoundPlayback from "@/components/soundPlayback/index.vue";
import TestSound from "./test.vue";
</script>

<template>
  <div class="player-container">
    <SoundPlayback />

    <TestSound />
  </div>
</template>

<style lang="scss" scoped>
.player-container {
  height: 300px;
  width: 100%;
}
</style>
