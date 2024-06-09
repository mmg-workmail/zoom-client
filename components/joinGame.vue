<template>
  <div class="" style="display: flex; margin: 10px 0; gap: 10px" v-if="state">
    <div class="">
      <label>Username</label>
      <input v-model="user.username" />
    </div>
    <div class="">
      <label>User Id</label>
      <input v-model.number="user.userId" />
    </div>
    <div class="">
      <label>Side</label>
      <select v-model="user.side">
        <option :value="s" v-for="s of sides" :key="s">
          {{ s }}
        </option>
      </select>
    </div>
    <button @click="joinGame">Join to game</button>

    <div
      style="display: flex; margin: 0 0; gap: 10px"
      v-if="user.side == 'mafia'"
    >
      <button @click="setShoot(userIdForShoot)">Set Shoot</button>
      <div class="">
        <label>User Id</label>
        <input v-model.number="userIdForShoot" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(["state", "user", "joinGame", "sides", "setShoot"]);

const userIdForShoot = ref(0);
</script>
