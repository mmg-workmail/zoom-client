export const useEvents = () => {

    const route = useRoute();

    const queryGameId = route.query.gameId;

    const { state, socket, setupSocket } = useConnectWebSocket()

    //be7d5d8d-6efd-415d-8dd0-e4c1be7070eb
    const gameId = queryGameId;
    const sides = ['citizen', 'mafia']
    const user = ref({
        userId: 1005,
        username: 'test',
        side: sides[0]
    })


    const userGame = ref(null)
    const hostGame = ref(null)


    function setJoinToGame() {
        socket.value.emit("joinGame",
            {
                "game_id": gameId,
                "user_id": user.value.userId,
                "username": user.value.username,
                "side": user.value.side,
                "role": 0
            }
        );
    }
    function setJoinHostToGame() {
        socket.value.emit("joinHostToGame",
            {
                "game_id": gameId,
                "user_id": 654213131321,
                "username": "god-1",
                "side": "god",
                "role": 1
            }
        );
    }
    function setStartGame() {
        socket.value.emit("startGame",
            {
                "game_id": gameId
            }
        );
    }
    function setDay() {
        socket.value.emit("day",
            {
                "game_id": gameId
            }
        );
    }
    function setNight() {
        socket.value.emit("night",
            {
                "game_id": gameId
            }
        );
    }
    function setShoot(userId: number) {
        console.log(typeof userId)
        socket.value.emit("shoot",
            {
                "game_id": gameId,
                "user_id": userId
            }
        );
    }
    function getSessionToken() {
        socket.value.emit("getSessionToken");
    }


    function EventListener() {
        socket.value.on("joinGame", (item: any) => {
            console.log('joinGame', item)
            userGame.value = item;
        });
        socket.value.on("joinHostToGame", (item: any) => {
            console.log('joinHostToGame', item)
            hostGame.value = item;
        });
        socket.value.on("startGame", (item: any) => {
            console.log('startGame', item)
        });
        socket.value.on("day", (item: any) => {
            console.log('day', item)
        });

        socket.value.on("shoot", (item: any) => {
            console.log('shoot', item)
        });

    }

    setupSocket(EventListener)

    return {
        state,
        sides,
        user,
        gameId,

        socket,
        setupSocket,
        setJoinToGame,
        setJoinHostToGame,
        setStartGame,
        setDay,
        setNight,
        setShoot,
        getSessionToken,

        userGame,
        hostGame
    }

}