<script setup lang="ts">
import ZoomVideo from "@zoom/videosdk";

const size = ref({
  width: 300,
  height: 170,
});

const client = ZoomVideo.createClient();
const stream = ref();
const liveStreamClient = ref();

const authEndpoint = "https://mafia-test.caspadm.com/api/v1/game/generateToken";
const config = ref({
  videoSDKJWT: "",
  sessionName: "test game",
  sessionKey: "test game",
  userName: "reza2",
  userIdentity: "reza2",
});
const role = ref(0);
const death = ref(0);
const forceMute = ref(0);

function getVideoSDKJWT() {
  const token =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBfa2V5IjoiNVV6a2N4ejhUd1NiYVc5SjcyZmZuQSIsInJvbGVfdHlwZSI6MCwidHBjIjoidGVzdCBnYW1lIiwibmFtZSI6InJlemEyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzE2NTA0MDkzLCJleHAiOjE3MTY1MTEyOTMsInVzZXJfaWRlbnRpdHkiOiJyZXphMiIsInNlc3Npb25fa2V5IjoidGVzdCBnYW1lIn0.m3O2GWUO3Zmy7XbOlSBWif7HejL5yxHVtrUjC5U3bWE";
  config.value.videoSDKJWT = token;
  joinSession();
  // fetch(authEndpoint, {
  //   method: "POST",
  //   body: JSON.stringify({
  //     sessionName: config.value.sessionName,
  //     role: role.value,
  //     sessionKey: config.value.sessionName,
  //     userIdentity: config.value.userIdentity,
  //     username: config.value.userName,
  //   }),
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  // })
  //   .then((response) => {
  //     return response.json();
  //   })
  //   .then((data) => {
  //     config.value.videoSDKJWT = data.token;
  //     joinSession();
  //   })
  //   .catch((error) => {
  //     alert(error);
  //   });
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
        liveStreamClient.value = client.getLiveStreamClient();
        if (!subsession.value) {
          subsession.value = client.getSubsessionClient();
        }
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
  // if (!document.querySelector(`#user_box_${userId}`)) {
  //   return false;
  // }

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

  // const audio = document.createElement("div");
  // audio.id = `user_audio_${userId}`;
  // audio.textContent = "audio";

  master.appendChild(canvas);
  master.appendChild(name);
  // master.appendChild(audio);

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
  // payload.map((p) => {
  //   if (p.hasOwnProperty("muted")) {
  //     console.log(
  //       document.querySelector(`#user_audio_${p.userId}`),
  //       "ssssssssss"
  //     );
  //     if (p.muted) {
  //       document.querySelector(`#user_audio_${p.userId}`).textContent = "Mute";
  //     } else {
  //       document.querySelector(`#user_audio_${p.userId}`).textContent =
  //         "Unmute";
  //     }
  //   }
  // });
});

client.on("connection-change", (payload) => {
  console.log(payload, "connection-change");
  if (payload.state === "Closed") {
    // document.querySelector("video-player-container").innerHTML = "";
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

client.on("host-ask-unmute-audio", (payload) => {
  console.log("Host asked me to unmute", payload);
});

function leaveSession() {
  client.leave();
}
setTimeout(() => {
  //getVideoSDKJWT();
});

function setForceMute() {
  if (forceMute.value) {
    stream.value.muteAudio(forceMute.value);
  } else {
    stream.value.muteAudio();
  }
}
function setFourceUnMute() {
  if (forceMute.value) {
    stream.value.unmuteAudio(forceMute.value);
  } else {
    stream.value.unmuteAudio();
  }
}

function setMuteShareAudio() {
  stream.value.muteShareAudio();
}

// Edited By beh
function startLiveStream() {
  liveStreamClient.value.startLiveStream(
    "rtmps://2b36d8e379e5.global-contribute.live-video.net:443/app/",
    "sk_eu-central-1_SyKy2weJC0yV_10I36uZPJJ46qvISgo7r9jilLcBRke",
    "https://2b36d8e379e5.eu-central-1.playback.live-video.net/api/video/v1/eu-central-1.485735471812.channel.jqofjZmiu05a.m3u8"
  );
}

function stopLiveStream() {
  liveStreamClient.value.stopLiveStream();
}

client.on("live-stream-status", (payload) => {
  console.log(`live streaming status: ${payload}`);
});

const subsession = ref();
const subSessionList = ref();
const subsessionId = ref("");
const userId = ref(0);

async function createSubSession() {
  // createSubsessions:
  await subsession.value.createSubsessions(
    ["mafia", "user-1", "user-2", "user-3", "user-4"],
    2
  );
  await getSubSessionList();
  openSubsessions();
}
async function getSubSessionList() {
  subSessionList.value = await subsession.value.getSubsessionList();
}
function joinSubSession() {
  // joinSubsession :
  subsession.value.joinSubsession(subsessionId.value);
  getSubSessionList();
}
function leaveSubSession() {
  subsession.value.leaveSubsession();
  getSubSessionList();
}
function assignUserToSubSession() {
  // assignUserToSubsession:
  subsession.value.assignUserToSubsession(userId.value, subsessionId.value);
  getSubSessionList();
}

function moveBackToMainSession() {
  // moveBackToMainSession :
  subsession.value.moveBackToMainSession(userId.value);
  getSubSessionList();
}

function moveUserToSubSession() {
  // moveUserToSubsession:
  subsession.value.moveUserToSubsession(userId.value, subsessionId.value);
  getSubSessionList();
}

function openSubsessions() {
  subsession.value.openSubsessions(subSessionList.value, {
    // isTimerEnabled: true,
    // timerDuration: 1800,
    isBackToMainSessionEnabled: true,
  });
}
function initialSubSession() {
  getSubSessionList();
  // openSubsessions();
}
</script>

<template>
  <div>
    <div class="" style="display: flex; margin: 10px 0; gap: 10px">
      <div class="">
        <label>Role</label>
        <input v-model.number="role" />
      </div>
      <div class="">
        <label>Username</label>
        <input v-model="config.userName" />
      </div>
      <div class="">
        <label>User Identify</label>
        <input v-model="config.userIdentity" />
      </div>
      <!-- <div class="">
        <label>death</label>
        <input v-model="death" />
      </div> -->
      <button @click="getVideoSDKJWT">Join Session</button>
      <div class="">
        <label>Mute and stop video</label>
        <button @click="leaveSession">Mute and stop video</button>
      </div>

      <div class="">
        <label>User ID</label>
        <input v-model.number="forceMute" />
        <button @click="setForceMute">Force mute</button>
        <button @click="setFourceUnMute">Force Unmute</button>
        <!-- <button @click="setMuteShareAudio">Set Mute Share Audio</button> -->
      </div>
      <div class="">
        <label>LiveStream video</label>
        <button @click="startLiveStream">LiveStream</button>
      </div>
      <div class="">
        <label>Stop LiveStream video</label>
        <button @click="stopLiveStream">Stop LiveStream</button>
      </div>
    </div>
    <div class="" style="display: flex; margin: 10px 0; gap: 10px">
      <div class="" v-if="role == 0">
        <label>User ID</label>
        <input v-model.number="userId" />
      </div>
      <div class="" v-if="role == 0">
        <label>Subsession Id</label>
        <input v-model="subsessionId" />
      </div>
      <div class="">
        <button @click="moveBackToMainSession">
          Move Back To Main Session
        </button>
      </div>
      <div class="">
        <button @click="joinSubSession">Join Subsession</button>
      </div>
      <div class="">
        <button @click="leaveSubSession">Leave Subsession</button>
      </div>
    </div>
    <div
      class=""
      style="display: flex; margin: 10px 0; gap: 10px"
      v-if="role == 1"
    >
      <div class="">
        <button @click="createSubSession">Create Sub Session</button>
      </div>
      <div class="">
        <label>User ID</label>
        <input v-model.number="userId" />
      </div>
      <div class="">
        <label>Subsession Id</label>
        <input v-model="subsessionId" />
      </div>

      <div class="">
        <button @click="assignUserToSubSession">
          Assign User To SubSession
        </button>
      </div>

      <div class="">
        <button @click="moveUserToSubSession">Move User To SubSession</button>
      </div>
    </div>
    <div>
      <button @click="initialSubSession">get Sub Session List</button>
    </div>
    <div class="">
      {{ subSessionList }}
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
