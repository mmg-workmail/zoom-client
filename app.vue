<script setup>
import ZoomVideo from "@zoom/videosdk";

let sessionContainer;
const authEndpoint = "https://mafia-test.caspadm.com/api/v1/game/generateToken";
const config = ref({
  videoSDKJWT: "",
  sessionName: "test game",
  sessionKey: "test game",
  userName: "Vue.js",
  userIdentity: "123",
  features: ["video", "audio", "settings", "users", "chat", "share"],
});
const role = ref(0);

function getVideoSDKJWT() {
  sessionContainer = document.getElementById("sessionContainer");

  document.getElementById("join-flow").style.display = "none";

  fetch(authEndpoint, {
    method: "POST",
    body: JSON.stringify({
      sessionName: config.value.sessionName,
      role: role.value,
      sessionKey: config.value.sessionName,
      userIdentity: config.value.userIdentity,
      username: config.value.userName,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      config.value.videoSDKJWT = data.token;
      joinSession();
    })
    .catch((error) => {
      console.log(error);
    });
}

const client = ZoomVideo.createClient();
const stream = ref();
function joinSession() {
  client.init("en-US", "Global", { patchJsMedia: true }).then(() => {
    client
      .join(
        config.value.sessionName,
        config.value.videoSDKJWT,
        config.value.userName
      )
      .then(() => {
        stream.value = client.getMediaStream();
        renderSelfVideo(stream.value);
        renderVideo(stream.value);
      });
  });
}
const nodes = ref();

async function renderSelfVideo(stream) {
  if (stream.isRenderSelfViewWithVideoElement()) {
    await stream.startVideo({
      videoElement: document.querySelector("#my-self-view-video"),
    });
    // video successfully started and rendered
  } else {
    await stream.startVideo();
    await stream.renderVideo(
      document.querySelector("#my-self-view-canvas"),
      client.getCurrentUserInfo().userId,
      300,
      175,
      0,
      0,
      3
    );
    // video successfully started and rendered
  }
}

async function renderVideo(stream) {
  client.getAllUser().forEach((user) => {
    console.log(user);
    if (user.bVideoOn) {
      stream.attachVideo(user.userId, 3).then((userVideo) => {
        document.querySelector("video-player-container").appendChild(userVideo);
      });
    }
  });
}

async function renderOneParticipent(USER_ID) {
  stream.value.attachVideo(USER_ID, 3).then((userVideo) => {
    document.querySelector("video-player-container").appendChild(userVideo);
  });
}

client.on("user-added", (payload) => {
  setTimeout(() => {
    payload.map((item) => {
      console.info(item);
      if (item.bVideoOn) {
        renderOneParticipent(item.userId);
      }
    });
  }, 1000);
});

// declare audio initialization state
let audioDecode;
let audioEncode;

// event listener to see when desktop Safari has initialized audio
client.on("media-sdk-change", (payload) => {
  if (payload.type === "audio" && payload.result === "success") {
    if (payload.action === "encode") {
      // encode for sending audio stream (speak)
      audioEncode = true;
    } else if (payload.action === "decode") {
      // decode for receiving audio stream (hear)
      audioDecode = true;
    }
  }
});

// your start audio button click
function startAudioButton() {
  // if desktop Safari (see for more: https://stackoverflow.com/a/42189492/6592510)
  var isSafari = window.safari !== undefined;

  if (isSafari) {
    // desktop Safari, check if desktop Safari has initialized audio
    if (audioEncode && audioDecode) {
      // desktop Safari has initialized audio, continue to start audio
      stream.value.startAudio();
    } else {
      // desktop Safari has not initialized audio, retry or handle error
      console.log("safari audio has not finished initializing");
    }
  } else {
    // not desktop Safari, continue to start audio
    stream.value.startAudio();
  }
}
</script>

<template>
  <main>
    <div class="" style="display: flex; margin: 10px 0; gap: 10px">
      <div class="">
        <label>Role</label>
        <input v-model="role" />
      </div>
      <div class="">
        <label>Username</label>
        <input v-model="config.userName" />
      </div>
      <div class="">
        <label>User Identify</label>
        <input v-model="config.userIdentity" />
      </div>
    </div>
    <div id="join-flow">
      <h1>Zoom Video SDK Sample Vue.js</h1>
      <p>User interface offered by the Video SDK UI Toolkit</p>

      <button @click="getVideoSDKJWT">Join Session</button>
    </div>
    <button @click="startAudioButton">audio</button>
    <div class="" style="display: flex; gap: 10px">
      <div>
        <video
          class="video"
          id="my-self-view-video"
          width="1920"
          height="1080"
        ></video>
        <canvas
          class="video"
          id="my-self-view-canvas"
          width="1920"
          height="1080"
        ></canvas>
      </div>
    </div>
    <video-player-container></video-player-container>
  </main>
</template>

<style scoped></style>
