<template>
    <div id="wrapper">
        <div class="menu">
            <a :href="'/?room='+room.id" target="_blank">Get Invite Link</a>
            <button class="icon" @click="toggleMute()">{{localAudioTrack.enabled ? '&#983916;' : '&#983917;'}}</button>
        </div>
        <div class="users">
            <div class="user" v-for="(user, i) in room.users" :key="i">
                <span class="name">
                    {{user.name}}
                    <span v-if="user.id === socket.id">(you)</span>
                </span>

                <video v-if="user.id !== socket.id" autoplay class="video" :id="'video_'+user.id"></video>
                <video v-else autoplay muted class="video" id="local-video"></video>
            </div>
        </div>
        <div class="controls"></div>
        <div class="player"></div>
        <div class="chat"></div>
        <div class="mixer"></div>
    </div>
</template>

<script>
    export default {
        mounted() {
            
        },

        mounted() {
            document.getElementById('local-video').srcObject = this.mainLocalStream
        },

        computed: {
            room() {
                return this.$store.getters.room
            },

            socket() {
                return this.$store.getters.socket
            },

            mainLocalStream() {
                return this.$store.getters.mainLocalStream
            },

            localAudioTrack() {
                return this.$store.getters.localAudioTrack
            },
        },

        methods: {
            toggleMute() {
                this.$store.commit('setMuteOnLocalAudioTrack', !this.localAudioTrack.enabled)
                this.$forceUpdate()
            }
        },
    }
</script>

<style lang="sass" scoped>
    #wrapper
        width: 100%
        height: 100%
        display: grid
        grid-template-columns: 350px 1fr 350px
        grid-template-rows: 60px 150px 1fr 350px
        grid-template-areas: "menu menu menu" "users users users" "controls player chat" "mixer mixer mixer"
        padding: 3px
        gap: 3px

    .users, .controls, .player, .chat, .mixer, .menu
        background: var(--bg)
        border-radius: 4px

    .menu
        grid-area: menu
        padding: 10px
        background-image: url('../../assets/images/terrain_white.svg')
        background-size: cover
        display: flex
        gap: 10px

    .users
        grid-area: users
        padding: 10px
        padding-left: 0

    .controls
        grid-area: controls

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
        vertical-align: top
        display: inline-block
        margin-left: 10px

        .video
            height: 100%
            width: 100%
            object-fit: cover
            background: black
            border-radius: 5px

        .name
            color: white
            text-shadow: 0 1px 2px #00000080
            position: absolute
            top: 10px
            left: 10px
</style>