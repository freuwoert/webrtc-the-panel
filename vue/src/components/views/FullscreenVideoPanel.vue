<template>
    <div class="wrapper">
        <div class="video-wrapper">
            <video autoplay muted class="fullscreen-video" :class="{'local-video': room.users[focusedUserIndex].isSelf}" id="main_fullscreen_video"></video>

            <ui-screws></ui-screws>
        </div>

        <div class="sidebar">
            <div class="button-wrapper">
                <button class="exit-fullscreen-button icon" v-tooltip="'Exit Fullscreen'" @click="$store.commit('setVisibleContentPanel', 'main-panel')">&#983700;</button>
            </div>

            <div class="user-wrapper">
                <div class="user" v-for="(user, i) in room.users" :key="user.id" @click="focusedUserIndex = i">
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

            <ui-screws></ui-screws>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                focusedUserIndex: 0,
            }
        },

        mounted() {
            this.$store.subscribe((mutation, state) => {
                switch (mutation.type)
                {
                    case 'setUserVideoStream':
                        this.updateVideoDOM('fullscreen_video_'+mutation.payload.id, mutation.payload.data)
    
                        if (this.room.users[this.focusedUserIndex].id === mutation.payload.id)
                        {
                            this.updateVideoDOM('main_fullscreen_video', mutation.payload.data)
                        }
                        break

                    case 'removeUserFromRoom':
                        if (this.room.users.length < this.focusedUserIndex + 1)
                        {
                            this.focusedUserIndex = 0
                            this.updateVideoDOM('main_fullscreen_video', this.room.users[this.focusedUserIndex].video.stream)
                        }
                        break
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
    .wrapper
        display: grid
        grid-template-columns: 1fr 200px
        grid-template-rows: 1fr
        grid-template-areas: "video users"
        gap: 3px

        .video-wrapper
            grid-area: video
            position: relative
            border-radius: 4px
            background: var(--bg)

            .fullscreen-video
                width: calc(100% - 20px)
                height: calc(100% - 20px)
                margin: 10px
                position: absolute
                background: black
                border-radius: 5px
                object-fit: contain

                &.local-video
                    transform: scaleX(-1)

        .sidebar
            grid-area: users
            position: relative
            border-radius: 4px
            background: var(--bg)

            .button-wrapper
                display: flex
                justify-content: flex-end
                height: 60px
                padding: 10px
                position: relative
                z-index: 1

                &:after
                    content: ''
                    position: absolute
                    bottom: -6px
                    left: 0
                    width: 100%
                    height: 6px
                    background: linear-gradient(#00000040, #00000000)
                    pointer-events: none

            .user-wrapper
                height: calc(100% - 70px)
                width: 100%
                overflow-x: hidden
                overflow-y: scroll
                position: absolute
                padding-top: 10px

                .user
                    width: 180px
                    height: 115px
                    position: relative
                    vertical-align: top
                    display: inline-block
                    border-radius: 5px
                    overflow: hidden
                    margin: 10px
                    margin-top: 0
                    background: black
                    cursor: pointer

                    &:last-child
                        margin-bottom: 0

                    .video
                        height: 100%
                        width: 100%
                        object-fit: cover
                        background: black
                        pointer-events: none
                        
                        &.local-video
                            transform: scaleX(-1)

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