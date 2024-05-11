<script setup lang="ts">
import ZoomVideo from "@zoom/videosdk";

const size = ref({
  width: 300,
  height: 170,
});

const client = ZoomVideo.createClient();
const stream = ref();

const authEndpoint = "https://mafia-test.caspadm.com/api/v1/game/generateToken";
const config = ref({
  videoSDKJWT: "",
  sessionName: "test game",
  sessionKey: "test game",
  userName: "reza",
  userIdentity: "reza",
});
const role = ref(1);
const death = ref(0);
const forceMute = ref(0);

function getVideoSDKJWT() {
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
      alert(error);
    });
}

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
        renderSelfVideo();
        //if (!death.value) {
        startAudioButton();
        //}
      });
  });
}

async function renderSelfVideo() {
  if (stream.value.isRenderSelfViewWithVideoElement()) {
    if (!death.value) {
      await stream.value.startVideo({
        videoElement: document.querySelector("#my-self-view-video"),
      });
    }
    // video successfully started and rendered
  } else {
    await stream.value.startVideo();
    await stream.value.renderVideo(
      document.querySelector("#my-self-view-canvas"),
      client.getCurrentUserInfo().userId,
      size.value.width,
      size.value.height,
      0,
      0,
      3
    );
    // video successfully started and rendered
  }
  document.querySelector("#self_username").textContent = config.value.userName;
}

function createCanvas(userId) {
  const master = document.createElement("div");
  master.id = `user_box_${userId}`;
  master.className = "avatar";
  const canvas = document.createElement("canvas");

  canvas.id = `user_${userId}`;
  canvas.width = size.value.width;
  canvas.height = size.value.height;

  const name = document.createElement("div");
  name.id = `user_name_${userId}`;
  name.textContent = userId;

  master.appendChild(canvas);
  master.appendChild(name);

  document.querySelector("video-player-container").appendChild(master);
}

client.on("peer-video-state-change", (payload) => {
  console.log("peer-video-state-change", payload);
  if (payload.action === "Start") {
    createCanvas(payload.userId);
    stream.value.renderVideo(
      document.querySelector(`#user_${payload.userId}`),
      payload.userId,
      size.value.width,
      size.value.height,
      0,
      0,
      3
    );
  } else if (payload.action === "Stop") {
    stream.value.stopRenderVideo(
      document.querySelector(`#user_${payload.userId}`),
      payload.userId
    );
    document.querySelector(`#user_box_${payload.userId}`)?.remove();
  }
});

client.on("video-active-change", (payload) => {
  console.log("Active speaker, use for any video adjustments", payload); // new active speaker, for example, use for video rendering changes, size changes, depending on your use case.
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
      alert("safari audio has not finished initializing");
    }
  } else {
    // not desktop Safari, continue to start audio
    stream.value.startAudio();
  }
}

// client.on("user-added", (payload) => {
//   console.log(payload, " joined the session");
//   payload.map((p) => {
//     // const querySelector = document.querySelector(`#user_name_${p.userId}`);
//     // if (querySelector) {
//     //   querySelector.textContent = `Username : ${p.displayName}`;
//     // }
//   });
// });

client.on("user-removed", (payload) => {
  console.log(payload, " left the session");
});

client.on("user-updated", (payload) => {
  console.log(payload, " properties were updated");
});

client.on("connection-change", (payload) => {
  console.log(payload, "connection-change");
  if (payload.state === "Closed") {
    // session ended by the host or the SDK kicked the user from the session (use payload.reason to see why the SDK kicked the user)
  } else if (payload.state === "Reconnecting") {
    // the client side has lost connection with the server (like when driving through a tunnel)
    // will try to reconnect for a few minutes
  } else if (payload.state === "Connected") {
    // SDK reconnected the session after a reconnecting state
  } else if (payload.state === "Fail") {
    // session failed to reconnect after a few minutes
    // user flushed from Zoom Video SDK session
  }
});

function leaveSession() {
  client.leave();
}
getVideoSDKJWT();

function setForceMute() {
  stream.value.unmuteAudio(forceMute.value);
}
</script>

<template>
  <div>
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
      <div class="">
        <label>death</label>
        <input v-model="death" />
      </div>
      <button @click="getVideoSDKJWT">Join Session</button>
      <div class="">
        <label>Mute and stop video</label>
        <button @click="leaveSession">Mute and stop video</button>
      </div>

      <div class="">
        <label>User ID</label>
        <input v-model="forceMute" />
        <button @click="setForceMute">Force mute</button>
      </div>
    </div>
    <video-player-container>
      <div>
        <video
          id="my-self-view-video"
          :height="size.height"
          :width="size.width"
          class="avatar"
        ></video>
        <!-- <canvas
          class="video"
          id="my-self-view-canvas"
          :width="size.width"
          :height="size.height"
        ></canvas> -->
        <div id="self_username" style="text-align: center"></div>
      </div>
    </video-player-container>
  </div>
</template>
