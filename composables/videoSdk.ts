
import ZoomVideo from "@zoom/videosdk";
import type { Socket } from "socket.io-client";
export const useVideoSdk = (socket: Socket, userZoom: any, props: any) => {

    const client = ZoomVideo.createClient();
    const stream = ref();
    const streamUsers = ref<{ [key: string]: {} }>({})
    const currentUser = ref({})

    const round = ref('Day')

    const size = ref({
        width: 300,
        height: 170,
    });

    function joinSession(config: { sessionName: string, token: string, username: string }) {
        client.init("en-US", "Global", { patchJsMedia: true }).then(() => {
            client
                .join(
                    config.sessionName,
                    config.token,
                    config.username
                )
                .then(() => {
                    stream.value = client.getMediaStream();
                    renderSelfVideo();
                });
        });
    }

    async function renderSelfVideo() {
        if (stream.value.isRenderSelfViewWithVideoElement()) {

            await stream.value.startVideo({
                videoElement: document.querySelector("#my-self-view-video"),
            });
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
        currentUser.value = client.getCurrentUserInfo()
        startAudioButton();
    }

    client.on("peer-video-state-change", async (payload) => {
        console.log("peer-video-state-change", payload);

        if (payload.action === "Start") {

            mergeTwoObject(payload)

            setTimeout(async () => {
                await stream.value.renderVideo(
                    document.querySelector(`#user_${payload.userId}`),
                    payload.userId,
                    size.value.width,
                    size.value.height,
                    0,
                    0,
                    3
                );
            }, 2000)

        } else if (payload.action === "Stop") {

            await stream.value.stopRenderVideo(
                document.querySelector(`#user_${payload.userId}`),
                payload.userId
            );

            // streamUsers.value = streamUsers.value.filter(s => s.userId !== payload.userId)
            delete streamUsers.value[payload.userId]
        }
    });

    client.on("video-active-change", (payload) => {
        console.log("Active speaker, use for any video adjustments", payload); // new active speaker, for example, use for video rendering changes, size changes, depending on your use case.

        mergeTwoObject(payload)
    });

    client.on("host-ask-unmute-audio", (payload) => {
        // console.log("Host asked me to unmute", payload);
        currentUser.value.reason = 'Host asked me to unmute';
        setUnmute()

    });
    client.on("user-updated", (payload) => {
        console.log(payload, " properties were updated");
        payload.map(p => {
            mergeTwoObject(p);
            // if (currentUser.value.userId === p.userId) {
            //     currentUser.value.muted = p.muted
            // }
        })
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

    client.on("connection-change", (payload) => {
        console.log(payload, "connection-change");
        if (payload.state === "Closed") {
            // document.querySelector("video-player-container").innerHTML = "";
            // session ended by the host or the SDK kicked the user from the session (use payload.reason to see why the SDK kicked the user)

            currentUser.value = {};
            streamUsers.value = {};

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

    async function setMute(userId = undefined) {
        if (userId) {
            await stream.value.muteAudio(userId);
        } else {
            await stream.value.muteAudio();
        }
        currentUser.value = client.getCurrentUserInfo()
    }
    async function setUnmute(userId = undefined) {
        if (userId) {
            await stream.value.unmuteAudio(userId);
        } else {
            await stream.value.unmuteAudio();
        }
        currentUser.value = client.getCurrentUserInfo()
    }


    //  Initial Session
    joinSession({
        sessionName: userZoom.sessionName,
        token: userZoom.token,
        username: props.user.username
    });


    // Socket Listener
    socket.on("getSessionToken", (item: any) => {
        console.log('getSessionToken', item)
        setTimeout(() => {
            joinSession({
                sessionName: item.sessionName,
                token: item.token,
                username: props.user.username,
            });
        }, 2000)
    });
    socket.on("night", (item: any) => {
        console.log('night', item, props.isHost)
        round.value = "Night";
        client.leave(props.isHost || false);
    });
    socket.on("day", (item: any) => {
        console.log('day', item, props.isHost)
        round.value = "Day";
        client.leave(props.isHost || false);
    });

    function mergeTwoObject(target: { userId: number } = { userId: 0 }) {
        const item = streamUsers.value[target.userId]
        if (item) {

            if (target.hasOwnProperty('action')) {
                streamUsers.value[target.userId].action = target.action;
            }
            if (target.hasOwnProperty('state')) {
                streamUsers.value[target.userId].state = target.state;
            }
            if (target.hasOwnProperty('userId')) {
                streamUsers.value[target.userId].userId = target.userId;
            }
            if (target.hasOwnProperty('isHost')) {
                streamUsers.value[target.userId].isHost = target.isHost;
            }
            if (target.hasOwnProperty('userGuid')) {
                streamUsers.value[target.userId].userGuid = target.userGuid;
            }
            if (target.hasOwnProperty('audio')) {
                streamUsers.value[target.userId].audio = target.audio;
            }
            if (target.hasOwnProperty('muted')) {
                streamUsers.value[target.userId].muted = target.muted;
            }
            if (target.hasOwnProperty('isVideoConnect')) {
                streamUsers.value[target.userId].isVideoConnect = target.isVideoConnect;
            }
            if (target.hasOwnProperty('bVideoOn')) {
                streamUsers.value[target.userId].bVideoOn = target.bVideoOn;
            }

            // streamUsers.value[target.userId] = { ...item, ...target };

            // { "state": "Active", "userId": 16802816, "isHost": true, "userGuid": "1106EFA5-18A8-6757-566E-87E565D3EA9E", "audio": "computer", "muted": false, "isVideoConnect": true, "bVideoOn": true }

        } else {
            streamUsers.value[target.userId] = target;
        }
    }

    window.client = client;

    return {
        client,
        joinSession,
        stream,
        size,
        streamUsers,
        currentUser,
        round,

        setMute,
        setUnmute
    }
}