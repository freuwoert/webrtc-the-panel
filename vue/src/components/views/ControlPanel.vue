<template>
    <div id="wrapper">
        <div class="users">
            <div class="user" v-for="(user, i) in room.users" :key="i">
                <span class="name">{{user.name}}</span>

                <video v-if="user.id !== socket.id" autoplay muted class="remote-video" :ref="'video_'+user.id"></video>
                <video v-else autoplay muted class="video" id="local-video"></video>
            </div>
        </div>
        <div class="controls">
            <a :href="'/?room='+room.id" target="_blank">Simulate other user</a>
        </div>
        <div class="player"></div>
        <div class="chat"></div>
        <div class="mixer"></div>
    </div>
</template>

<script>
    export default {
        mounted() {
            navigator.getUserMedia({
                video: true,
                audio: true,
            },
            stream => {
                document.getElementById('local-video').srcObject = stream
            },
            error => {
                console.log(error.message)
            })
        },

        computed: {
            room() {
                return this.$store.getters.room
            },

            socket() {
                return this.$store.getters.socket
            },
        },
    }
</script>

<style lang="sass" scoped>
    #wrapper
        width: 100%
        height: 100%
        display: grid
        grid-template-columns: 400px 1fr 400px
        grid-template-rows: 150px 1fr 350px
        grid-template-areas: "users users users" "controls player chat" "controls mixer mixer"
        gap: 10px
        padding: 10px

    .users, .controls, .player, .chat, .mixer
        background: var(--bg)
        filter: drop-shadow(0 1px 1.5px #00000030)
        border-radius: 5px

    .users
        grid-area: users
        display: flex
        padding: 10px
        gap: 10px

    .controls
        grid-area: controls
        padding: 10px

    .player
        grid-area: player

    .chat
        grid-area: chat

    .mixer
        grid-area: mixer

    .user
        height: 100%
        width: 200px
        position: relative

        .video
            height: 100%
            width: 100%
            object-fit: contain
            background: black
            border-radius: 5px

        .name
            color: white
            text-shadow: 0 1px 2px #00000080
            position: absolute
            top: 10px
            left: 10px
</style>