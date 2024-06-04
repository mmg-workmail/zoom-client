
import { io } from "socket.io-client";
export const useConnectWebSocket = () => {

  const socketUrl = 'ws://54.93.228.211:4000';
  const state = reactive({
    connected: false,
  });


  const URL = socketUrl
  const socket = ref();

  function setupSocket(fn: Function) {
    socket.value = io(URL);
    socket.value.on("connect", () => {
      state.connected = true;

      fn()

    });
    socket.value.on("disconnect", () => {
      state.connected = false;
    });
  }

  function disconnectSocket() {
    if (state.connected) {
      socket.value.disconnect();
    }
  }

  onMounted(() => {
    window.socket = socket;
  });

  onBeforeUnmount(() => {
    disconnectSocket()
  })

  return {
    state,
    socket,
    setupSocket
  }

};

