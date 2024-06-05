<template>
  <div>
    <div v-if="state">
      <JoinGame
        :state="state"
        :user="user"
        :sides="sides"
        :joinGame="setJoinToGame"
        :setShoot="setShoot"
        :gameId="gameId"
        v-if="!isHost"
      />
      <HostAction
        v-if="isHost"
        :state="state"
        :setJoinHostToGame="setJoinHostToGame"
        :setStartGame="setStartGame"
        :setDay="setDay"
        :setNight="setNight"
        :gameId="gameId"
      />
    </div>

    <div v-if="state && (userGame || hostGame)">
      <VideoSdk
        :userGame="userGame"
        :hostGame="hostGame"
        :gameId="gameId"
        :user="user"
        :socket="socket"
      />
    </div>
  </div>
</template>

<script setup>
const {
  state,
  user,
  sides,
  setJoinToGame,
  setJoinHostToGame,
  setStartGame,
  setDay,
  setNight,
  setShoot,

  socket,

  gameId,
  userGame,
  hostGame,
} = useEvents();

const route = useRoute();

const isHost = route.query.isHost;
</script>
