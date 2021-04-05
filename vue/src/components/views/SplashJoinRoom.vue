<template>
    <div class="splash-screen">
        <div class="content">
            <div class="centered">
                <h1>Join Room</h1>
                <input type="text" v-model="roomJoin.name" placeholder="Your Name">
                <button v-on:click="joinRoomAs(roomJoin.roomId, roomJoin.name)">Join Room</button>
            </div>
        </div>
        <div class="background"></div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                roomJoin: {
                    roomId: null,
                    name: '',
                },
            }
        },

        created() {
            this.socket.on('server.checked.room-id', data => {
                if (data.roomExists)
                {
                    this.roomJoin.roomId = data.room.id
                    this.$store.commit('view', 'join-room')
                }
            })
        },

        computed: {
            overlays() {
                return this.$store.getters.overlays
            },

            socket() {
                return this.$store.getters.socket
            },
        },

        methods: {
            joinRoomAs(id, name) {

                this.socket.emit('join.room', {
                    id,
                    name,
                })
            },
        },
    }
</script>

<style lang="sass" scoped>
    .splash-screen
        position: fixed
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: var(--primary)
        z-index: 1000

        .content
            position: absolute
            top: 0
            left: 0
            height: 100%
            width: 100%
            max-width: 500px
            z-index: 1
            display: flex
            align-items: center
            backdrop-filter: blur(50px)
            background: #00000010

        .background
            position: absolute
            top: 0
            left: 0
            width: 100%
            height: 100%
            background-position: center
            background-image: url('../../assets/bg.jpg')
            background-size: cover

    .centered
        text-align: left
        padding: 30px
        width: 100%
        display: flex
        flex-direction: column
        gap: 20px

        h1
            font-size: 50px
            margin: 10px 0
</style>