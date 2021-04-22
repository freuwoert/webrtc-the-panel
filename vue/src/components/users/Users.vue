<template>
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

            <video autoplay muted class="video" :class="{'local-video': user.isSelf}" :id="'video_'+user.id"></video>
            <audio v-if="!user.isSelf" autoplay class="audio" :id="'audio_'+user.id"></audio>
        </div>

        <div class="button-wrapper">
            <button class="icon" v-tooltip="'Fullscreen'" @click="$store.commit('setVisibleContentPanel', 'fullscreen-video-panel')">&#983699;</button>
        </div>


        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
        mounted() {
            this.$store.subscribe((mutation, state) => {
                if (mutation.type === 'setUserVideoStream')
                {
                    this.updateVideoDOM('video_'+mutation.payload.id, mutation.payload.data)
                }
                else if (mutation.type === 'setUserAudioStream')
                {
                    this.updateVideoDOM('audio_'+mutation.payload.id, mutation.payload.data)
                }
            })
        },

        computed: {
            room() {
                return this.$store.getters.room
            },
        },

        methods: {
            updateVideoDOM(id, stream) {
                let el = document.getElementById(id)

                if (!el) return
                el.srcObject = stream
            },
        },
    }
</script>

<style lang="sass" scoped>
    .users
        background: var(--bg)
        border-radius: 4px
        position: relative
        padding: 10px
        padding-left: 0

        .button-wrapper
            display: flex
            flex-direction: column
            width: 60px
            height: 100%
            padding: 10px
            position: absolute
            top: 0
            right: 0

            &:after
                content: ''
                position: absolute
                top: 5px
                left: -1px
                width: 0
                height: calc(100% - 10px)
                border-left: 2px solid var(--bg-dark)

        .user
            height: 100%
            width: 200px
            position: relative
            vertical-align: top
            display: inline-block
            margin-left: 10px
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