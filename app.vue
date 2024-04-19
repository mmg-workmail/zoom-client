<template>
  <div>
    <button @click="joinGame">
      Meeting
    </button>
    <pre>
      {{ tokenData?.data }}
    </pre>
  </div>
</template>


<script setup lang="ts">
import ZoomVideo from '@zoom/videosdk'

interface CreateMeeting {
  data: {
    meeting: {
      id: number,
      password: string
    }
  }
}

interface  JoinMeeting {
  data:{
    clientId: string,
    meetingId: number,
    password: string,
    token: string,
  }
}

const {data: meetingData, execute: meetingExecute, error: meetingError} = await useFetch<CreateMeeting>(
  'http://mafia-test.caspadm.com/api/v1/game/meeting',
  {
    headers: {
      Authorization : 'Basic '+btoa(`mafia:ae7404e5a091788fd829bb04463f9832`)
    },
    method: 'post',
    immediate: false
  }
)


const paramsToken = reactive({
    "meetingId": meetingData.value?.data.meeting.id,
    "username": "mohammadreza",
    "side": "mafia"
})
const { data: tokenData, execute: tokenExecute, error: tokenError } = await useFetch<JoinMeeting>('http://mafia-test.caspadm.com/api/v1/game/generateToken', {
  method: 'post',
  body: paramsToken,
  immediate: false
})

async function joinGame() {
  await meetingExecute()
  if (meetingData.value) {
    paramsToken.meetingId = meetingData.value.data.meeting.id
  }
  //await tokenExecute()
  //await createZoomVideo();
}


async function createZoomVideo () {
  console.log('testGame', tokenData.value?.data.token, paramsToken.username)
  var client = ZoomVideo.createClient()
  var stream

  await client.init('en-US', 'Global', { patchJsMedia: true })
  await client.join('testGame', tokenData.value?.data.token, paramsToken.username)

  stream = client.getMediaStream()
}

</script>