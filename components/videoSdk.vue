<template>
  <div id="video-player-container">
    <div>{{ round }}</div>
    <div style="display: flex; gap: 10px">
      <div v-if="userGame || hostGame">
        <video
          id="my-self-view-video"
          :height="size.height"
          :width="size.width"
          class="avatar"
        ></video>
        <div
          style="display: flex; justify-content: space-between; font-size: 13px"
          v-if="currentUser.userId"
        >
          <div>ID : {{ currentUser.userId }}</div>
          <div v-if="!hostGame">Name : {{ currentUser.displayName }}</div>
          <div>
            <button
              @click="setUnmute()"
              v-if="streamUsers[currentUser.userId].muted"
            >
              Audio : Unmuted
            </button>
            <button @click="setMute()" v-else>Audio : Muted</button>
          </div>
        </div>
        <div v-if="currentUser.reason">{{ currentUser.reason }}</div>
      </div>
      <div class="" v-for="(item, key) of streamUsers" :key="key">
        <!-- <div v-if="key != currentUser.userId && item?.state == 'Active'"> -->
        <div
          v-if="
            key != currentUser.userId && item?.isVideoConnect && item?.bVideoOn
          "
        >
          <canvas
            :id="`user_${item.userId}`"
            :height="size.height"
            :width="size.width"
            class="avatar"
          ></canvas>
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 13px;
            "
            v-if="item.userId"
          >
            <div>ID : {{ item.userId }}</div>
            <div v-if="item.displayName">Name : {{ item.displayName }}</div>
            <div v-if="hostGame">
              <button @click="setUnmute(item.userId)" v-if="item.muted">
                Audio : Unmuted
              </button>
              <button @click="setMute(item.userId)" v-else>
                Audio : Muted
              </button>
            </div>
            <div v-else>
              {{ item.muted ? "Muted" : "Unmuted" }}
            </div>
          </div>
        </div>
      </div>
    </div>
    {{ streamUsers }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps(["gameId", "userGame", "hostGame", "user", "socket"]);

const userZoom = props.userGame || props.hostGame;

const {
  joinSession,
  size,
  currentUser,
  setMute,
  setUnmute,
  streamUsers,
  round,
} = useVideoSdk(props.socket, userZoom, props);
</script>
