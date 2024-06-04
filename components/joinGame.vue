<template>
  <div class="" style="display: flex; margin: 10px 0; gap: 10px" v-if="state">
    <div class="">
      <label>Username</label>
      <input v-model="user.username" />
    </div>
    <div class="">
      <label>User Id</label>
      <input v-model="user.userId" />
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
  </div>
</template>

<script setup lang="ts">
const props = defineProps(["state", "user", "joinGame", "sides"]);
</script>
