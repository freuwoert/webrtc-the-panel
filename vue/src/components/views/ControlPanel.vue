<template>
    <div id="wrapper">
        <div class="menu">
            <div class="logo-wrapper">
                <img src="../../assets/images/logo_white.svg" alt="The Panel Logo" class="logo">
            </div>
            
            <div class="spacer"></div>

            <div class="button-wrapper">
                <button class="icon" v-tooltip="'Deafen'">&#983755;</button>
                <button class="icon" v-tooltip="!localVideoTrack ? 'Camera on' : 'Camera off'" :class="{'red': !localVideoTrack}" @click="$store.dispatch('toggleCamera')">{{localVideoTrack ? '&#984423;' : '&#984424;'}}</button>
                <button class="icon" v-tooltip="this.selfUser.audio.isMuted ? 'Unmute' : 'Mute'" :class="{'red': this.selfUser.audio.isMuted}" @click="$store.dispatch('toggleMute')">{{this.selfUser.audio.isMuted ? '&#983917;' : '&#983916;'}}</button>
                <div class="divider"></div>
                <button class="icon" v-tooltip="'Copy invite-link'" v-clipboard:success="copiedInviteLink" v-clipboard="() => roomInviteLink">&#983372;</button>
                <a class="icon" v-tooltip="'Open invite-link'" :href="roomInviteLink" target="_blank">&#984012;</a>
            </div>

            <ui-screws></ui-screws>
        </div>

        <div class="users">
            <div class="user" v-for="user in room.users" :key="user.id">
                <span class="name" v-tooltip="user.name">
                    {{user.name}}
                    <span v-if="user.isSelf"> (you)</span>
                </span>

                <div class="indicators">
                    <span class="icon moderator" v-tooltip="'Room moderator'" v-if="user.isModerator">&#984421;</span>
                    <span class="icon owner" v-tooltip="'Room owner'" v-if="user.isOwner">&#983461;</span>
                    <span class="icon muted" v-tooltip="'User is muted'" v-if="user.audio.isMuted">&#983917;</span>
                </div>

                <video v-if="!user.isSelf" autoplay muted class="video" :id="'video_'+user.id"></video>
                <audio v-if="!user.isSelf" autoplay class="audio" :id="'audio_'+user.id"></audio>

                <video v-else autoplay muted class="video" id="video_local"></video>
            </div>

            <!-- <button class="icon">&#983699;</button> -->

            <ui-screws></ui-screws>
        </div>

        <div class="controls">
            <ui-screws></ui-screws>
        </div>

        <div class="player">
            <ui-screws></ui-screws>
        </div>

        <div class="chat">
            <input placeholder="Message Chat" type="text" class="chat-bar">
            <ui-screws></ui-screws>
        </div>

        <div class="mixer">
            <ui-fader label="User Cap" :level="0" :uv="100" :ov="100"></ui-fader>
            <ui-fader label="Guest Cap" :level="0" :uv="100" :ov="100"></ui-fader>

            <div class="minimal-spacer">
                <ui-screws></ui-screws>
            </div>

            <ui-fader v-for="user in room.users" :key="user.id" :label="user.id !== socket.id ? user.name : 'Local'" :level="levels[user.id]" :uv="user.audio.volume" @uv="setUserVolume(user, $event)" :ov="user.audio.overlayVolume"></ui-fader>

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
                levels: {},
            }
        },

        mounted() {
            setInterval(() => {
                for (let user of this.room.users)
                {
                    if (!user.audio.audioAnalyzer) continue

                    user.audio.audioAnalyzer.getByteFrequencyData(user.audio.freq)
                    let level = (user.audio.freq.reduce((a, c) => a + c) / 16 / (user.audio.audioAnalyzer.maxDecibels - user.audio.audioAnalyzer.minDecibels) * 100) * (user.isSelf ? (user.audio.volume / 100) : 1)
                    this.levels[user.id] = level
                    this.$forceUpdate()
                }
            }, 8)

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

            roomInviteLink() {
                return window.location.origin + '/?room=' + this.room.id
            },

            socket() {
                return this.$store.getters.socket
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

            selfUser() {
                return this.room.users.find(e => e.id === this.socket.id)
            },
        },

        methods: {
            updateVideoDOM(id, stream) {
                document.getElementById(id).srcObject = stream
            },

            setUserVolume(user, volume) {
                this.socket.emit('room.user.set-volume', {
                    userId: user.id,
                    volume,
                })
            },



            copiedInviteLink() {
                alert('Invite link copied to clipboard!')
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
        grid-template-columns: 400px 1fr 400px
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

        .button-wrapper
            background: var(--bg)
            border-radius: 5px
            display: flex

            .divider
                background: var(--bg-dark)
                height: 30px
                width: 1px
                margin: 5px
                vertical-align: top
                pointer-events: none

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
        position: relative

        .chat-bar
            height: 46px
            border-radius: 5px
            width: calc(100% - 20px)
            background: var(--bg-dark)
            color: #fff
            position: absolute
            bottom: 10px
            left: 10px
            letter-spacing: 0.3px

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
        border-radius: 5px
        overflow: hidden

        #video_local
            transform: scaleX(-1)

        .video
            height: 100%
            width: 100%
            object-fit: cover
            background: black
            pointer-events: none

        .audio
            pointer-events: none

        .name
            color: white
            text-shadow: 0 1px 2px #00000080
            position: absolute
            top: 10px
            left: 10px
            width: calc(100% - 20px)
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap
            z-index: 1

        .indicators
            color: white
            position: absolute
            bottom: 5px
            left: 5px
            display: flex
            align-items: center
            z-index: 1
            user-select: none
            background: var(--bg)
            border-radius: 4px

            .icon
                font-family: 'Material Icons'
                font-size: 14px
                display: grid
                place-content: center
                height: 24px
                width: 24px
                color: #ffffff

                &.muted
                    color: #eb4d4b
</style>