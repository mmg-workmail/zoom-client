<template>
  <div>
    <div class="">
      <button @click="createMeeting">Create Meeting2</button>
    </div>
    <input v-model="paramsToken.meetingId" />
    <input v-model="paramsToken.username" />
    <select v-model="paramsToken.side">
      <option value="mafia">Mafia</option>
      <option value="citizen">Citizen</option>
    </select>
    <button @click="joinGame">Join to meeting</button>
    <pre>
      {{ tokenData?.data }}
    </pre>
    <div id="meetingSDKElement">
      <!-- Meeting SDK renders here when a user starts or joins a Zoom meeting -->
    </div>
  </div>
</template>

<script setup lang="ts">
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";

interface CreateMeeting {
  data: {
    meeting: {
      id: number;
      password: string;
    };
  };
}

interface JoinMeeting {
  data: {
    clientId: string;
    meetingId: number;
    password: string;
    token: string;
  };
}

const {
  data: meetingData,
  execute: meetingExecute,
  error: meetingError,
} = await useFetch<CreateMeeting>(
  "http://mafia-test.caspadm.com/api/v1/game/meeting",
  {
    headers: {
      Authorization: "Basic " + btoa(`mafia:ae7404e5a091788fd829bb04463f9832`),
    },
    method: "post",
    immediate: false,
  }
);

const paramsToken = reactive({
  meetingId: meetingData.value?.data.meeting.id,
  username: "mohammadreza",
  side: "mafia",
});
const {
  data: tokenData,
  execute: tokenExecute,
  error: tokenError,
} = await useFetch<JoinMeeting>(
  "http://mafia-test.caspadm.com/api/v1/game/generateToken",
  {
    method: "post",
    body: paramsToken,
    immediate: false,
    watch: false,
  }
);

async function createMeeting() {
  await meetingExecute();
  if (meetingData.value) {
    paramsToken.meetingId = meetingData.value.data.meeting.id;
  }
}
async function joinGame() {
  await tokenExecute();
  joinPerson();
}

const client = ref(ZoomMtgEmbedded.createClient());

async function createZoomVideo() {
  let meetingSDKElement = document.getElementById("meetingSDKElement");

  client.value.init({ zoomAppRoot: meetingSDKElement, language: "en-US" });
}

async function joinPerson() {
  client.value.join({
    sdkKey: tokenData.value?.data.clientId,
    signature: tokenData.value?.data.token as string, // role in SDK signature needs to be 1
    meetingNumber: tokenData.value?.data.meetingId?.toString() as string,
    password: tokenData.value?.data.password,
    userName: paramsToken.username,
    // zak: "", // the host's zak token
  });
}

onMounted(() => {
  createZoomVideo();
});
</script>
