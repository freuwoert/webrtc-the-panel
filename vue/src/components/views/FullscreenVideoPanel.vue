<template>
    <div class="video-wrapper">
        <button class="exit-fullscreen-button icon" v-tooltip="'Exit Fullscreen'" @click="$store.commit('setVisibleContentPanel', 'main-panel')">&#983700;</button>

        <div class="user-sidebar">
            <div class="user" v-for="user in room.users" :key="user.id" @click="updateVideoDOM('main_fullscreen_video', user.video.stream)">
                <span class="name" v-tooltip="user.name">
                    {{user.name}}
                    <span v-if="user.isSelf"> (you)</span>
                </span>

                <div class="indicators">
                    <span class="icon moderator" v-tooltip="'Room moderator'" v-if="user.isModerator">&#984421;</span>
                    <span class="icon owner" v-tooltip="'Room owner'" v-if="user.isOwner">&#983461;</span>
                    <span class="icon muted" v-tooltip="'User is muted'" v-if="user.audio.isMuted">&#983917;</span>
                </div>

                <video autoplay muted class="video" :class="{'local-video': user.isSelf}" :id="'fullscreen_video_'+user.id"></video>
            </div>
        </div>
        
        <video autoplay muted class="fullscreen-video" id="main_fullscreen_video"></video>

        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
        mounted() {
            this.$store.subscribe((mutation, state) => {
                if (mutation.type === 'setUserVideoStream')
                {
                    this.updateVideoDOM('fullscreen_video_'+mutation.payload.id, mutation.payload.data)
                }
            })
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
                let el = document.getElementById(id)
                
                if (!el) return
                el.srcObject = stream
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
            z-index: 1

        .user-sidebar
            position: absolute
            top: 0px
            right: 0px
            height: 100%
            padding: 60px 10px
            display: flex
            flex-direction: column
            gap: 10px

            &:after
                content: ''
                position: absolute
                top: 5px
                left: -1px
                width: 0
                height: calc(100% - 10px)
                border-left: 2px solid var(--bg-dark)

        .fullscreen-video
            width: calc(100% - 220px)
            height: calc(100% - 20px)
            position: absolute
            top: 10px
            left: 10px
            background: black
            border-radius: 5px
            object-fit: contain

        .user
            width: 180px
            height: 115px
            position: relative
            vertical-align: top
            display: inline-block
            border-radius: 5px
            overflow: hidden

            .video
                height: 100%
                width: 100%
                object-fit: cover
                background: black
                pointer-events: none
                
                &.local-video
                    transform: scaleX(-1)

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