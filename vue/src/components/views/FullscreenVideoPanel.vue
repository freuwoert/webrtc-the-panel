<template>
    <div class="video-wrapper">
        <button class="exit-fullscreen-button icon" v-tooltip="'Exit Fullscreen'" @click="$store.commit('setVisibleContentPanel', 'main-panel')">&#983700;</button>

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

            <video v-if="!user.isSelf" autoplay muted class="video" :id="'fullscreen_video_'+user.id"></video>
            <video v-else autoplay muted class="video" id="fullscreen_video_local"></video>
        </div>

        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
        mounted() {

            this.updateVideoDOM('fullscreen_video_local', this.localStream)
        },

        watch: {
            localVideoTrack() {
                this.updateVideoDOM('fullscreen_video_local', this.localStream)
            },

            room() {
                for (const user of this.room.user)
                {
                    const remoteVideo = document.getElementById('fullscreen_video_'+user.id)
                    
                    if (remoteVideo)
                    {
                        remoteVideo.srcObject = user.video.stream
                        remoteVideo.play()
                    }
                }
            }
        },

        computed: {
            controlPanelSetup() {
                return this.$store.getters.controlPanelSetup
            },

            room() {
                return this.$store.getters.room
            },

            socket() {
                return this.$store.getters.socket
            },

            localStream() {
                return this.$store.getters.localStream
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
        },

        components: {},
    }
</script>

<style lang="sass" scoped>
    .video-wrapper
        width: 100%
        height: 100%
        position: relative
        border-radius: 4px
        background: var(--bg)

        .exit-fullscreen-button
            position: absolute
            top: 10px
            right: 10px

        .user
            width: 400px
            height: 225px
            position: relative
            vertical-align: top
            display: inline-block
            margin-left: 10px
            border-radius: 5px
            overflow: hidden

            #fullscreen_video_local
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