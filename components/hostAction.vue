<template>
  <div style="display: flex; margin: 10px 0; gap: 10px" v-if="state">
    <button @click="setJoinHostToGame">Join Host To Game</button>
    <button @click="setStartGame">Start Game</button>
    <button @click="setDay">Set Day</button>
    <button @click="setNight">Set Night</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps([
  "state",
  "setJoinHostToGame",
  "setStartGame",
  "setDay",
  "setNight",
]);
</script>
