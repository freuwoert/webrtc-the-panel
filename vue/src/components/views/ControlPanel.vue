<template>
    <div id="wrapper">
        <div class="menu">
            <div class="logo-wrapper">
                <img src="../../assets/images/logo_white.svg" alt="The Panel Logo" class="logo">
            </div>
            
            <div class="spacer"></div>

            <!-- <button class="icon" @click="toggleMute()">{{localAudioTrack.enabled ? '&#983916;' : '&#983917;'}}</button> -->
            <button class="icon" @click="toggleCamera()">{{localVideoTrack ? '&#984423;' : '&#984424;'}}</button>
            <a :href="'/?room='+room.id" target="_blank">Get Invite Link</a>

            <ui-screws></ui-screws>
        </div>

        <div class="users">
            <div class="user" v-for="(user, i) in Array.from(room.users.values())" :key="i">
                <span class="name">
                    {{user.name}}
                    <span v-if="user.id === socket.id">(you)</span>
                </span>

                <video v-if="user.id !== socket.id" autoplay class="video" :id="'video_'+user.id"></video>
                <video v-else autoplay muted class="video" id="video_local"></video>
            </div>

            <ui-screws></ui-screws>
        </div>

        <div class="controls">
            <ui-screws></ui-screws>
        </div>

        <div class="player">
            <ui-screws></ui-screws>
        </div>

        <div class="chat">
            <ui-screws></ui-screws>
        </div>

        <div class="mixer">
            <ui-fader label="User Cap" :level="0" :uv="100" :ov="100"></ui-fader>
            <ui-fader label="Guest Cap" :level="0" :uv="100" :ov="100"></ui-fader>

            <div class="minimal-spacer">
                <ui-screws></ui-screws>
            </div>

            <ui-fader v-for="user in Array.from(room.users.values())" :key="user.id" :label="user.name" :level="user.level" :uv="user.vol" @uv="user.vol = $event" :ov="user.overlayVol"></ui-fader>

            <div class="spacer">
                <ui-screws></ui-screws>
                <img src="../../assets/images/logo_white.svg" alt="The Panel Logo" class="logo">
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                level: 0,
                channels: {
                    local: { id: 'local', level: 0, vol: 100, overlayVol: 100, label: 'Local', freq: new Uint8Array(16) },
                },
            }
        },

        mounted() {
            setTimeout(() => {
                let peers = Array.from(this.peers.values())

                for (let peer of peers)
                {
                    this.channels[peer.socketId] = { level: 0, label: 'Remote', freq: new Uint8Array(16) }
                }

                setInterval(() => {
                    this.localAudioAnalyzer.getByteFrequencyData(this.channels.local.freq)
                    this.channels.local.level = (this.channels.local.freq.reduce((a, c) => a + c) / 16 / (this.localAudioAnalyzer.maxDecibels - this.localAudioAnalyzer.minDecibels) * 100)

                    for (let peer of peers)
                    {
                        peer.audioAnalyzer.getByteFrequencyData(this.channels[peer.socketId].freq)
                        this.channels[peer.socketId].level = (this.channels[peer.socketId].freq.reduce((a, c) => a + c) / 16 / (peer.audioAnalyzer.maxDecibels - peer.audioAnalyzer.minDecibels) * 100)
                    }
                }, 80000)
            }, 5000)

            this.updateVideoDOM('video_local', this.localStream)
        },

        watch: {
            localVideoTrack() {
                this.updateVideoDOM('video_local', this.localStream)
            }
        },

        computed: {
            room() {
                return this.$store.getters.room
            },

            socket() {
                return this.$store.getters.socket
            },

            peers() {
                return this.$store.getters.peers
            },

            localStream() {
                return this.$store.getters.localStream
            },

            localAudioTrack() {
                return this.$store.getters.localAudioTrack
            },

            localVideoTrack() {
                return this.$store.getters.localVideoTrack
            },

            localAudioContext() {
                return this.$store.getters.localAudioContext
            },

            localAudioAnalyzer() {
                return this.$store.getters.localAudioAnalyzer
            },
        },

        methods: {
            toggleMute() {
                this.$store.commit('setMuteOnLocalAudioTrack', !this.localAudioTrack.enabled)
                this.$forceUpdate()
            },

            toggleCamera() {
                this.$store.dispatch(this.localVideoTrack ? 'turnOffUserCam' : 'turnOnUserCam')
            },

            updateVideoDOM(id, stream) {
                document.getElementById(id).srcObject = stream
            },
        },

        components: {},
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
        position: relative

    .menu
        grid-area: menu
        padding: 10px
        background-image: url('../../assets/images/terrain_white.svg')
        background-size: cover
        display: flex
        gap: 10px

        .logo-wrapper
            height: 40px
            padding: 7px
            background: var(--bg)
            border-radius: 4px

            .logo
                height: 100%
                opacity: 0.5

        .spacer
            flex: 1

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
        background: var(--bg-dark)
        gap: 4px
        display: flex

        .minimal-spacer,
        .spacer
            flex: 1
            border-radius: 4px
            background: var(--bg)
            height: 100%
            position: relative
            display: grid
            place-content: center

            .logo
                height: 30px
                opacity: 0.2

        .minimal-spacer
            width: 40px
            flex: unset


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