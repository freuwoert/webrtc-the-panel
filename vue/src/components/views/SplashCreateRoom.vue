<template>
    <div class="splash-screen">
        <div class="content">
            <div class="centered">
                <h1>Create Room</h1>
                <select v-model="roomCreate.overlayId" placeholder="Overlay ID">
                    <option v-for="overlay in overlays" :key="overlay" :value="overlay">{{overlay}}</option>
                </select>
                <input type="text" v-model="roomCreate.name" placeholder="Your Name">
                <button v-on:click="createRoomAs(roomCreate.overlayId, roomCreate.name)">Create Room</button>
            </div>
        </div>
        <div class="background"></div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                roomCreate: {
                    overlayId: null,
                    name: '',
                },
            }
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
            createRoomAs(id, name) {
                this.socket.emit('create.room', {
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