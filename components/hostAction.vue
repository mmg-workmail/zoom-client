<template>
  <div style="display: flex; margin: 10px 0; gap: 10px" v-if="state">
    <button @click="setJoinHostToGame">Join Host To Game</button>
    <button @click="setStartGame">Start Game</button>
    <button @click="setDay">Set Day</button>
    <button @click="setNight">Set Night</button>
    <button @click="setShoot(userIdForShoot)">Set Shoot</button>
    <div class="">
      <label>User Id</label>
      <input v-model.number="userIdForShoot" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps([
  "state",
  "setJoinHostToGame",
  "setStartGame",
  "setDay",
  "setNight",
  "setShoot",
]);

const userIdForShoot = ref(0);
</script>
