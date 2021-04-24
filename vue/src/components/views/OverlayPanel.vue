<template>
    <div id="wrapper">
        <div class="main-panel">
            <div class="users">
                <div class="user" v-for="user in room.users.filter(e => !e.isOverlay)" :key="user.id">
                    <span class="name">
                        {{user.name}}
                    </span>

                    <video autoplay muted class="video" :class="{'local-video': user.isSelf}" :id="'video_'+user.id"></video>
                </div>
            </div>
        </div>
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
        components: {},
    }
</script>

<style lang="sass" scoped>
    html, body
        background: transparent !important

    #wrapper
        width: 100%
        height: 100%
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 1fr
        grid-template-areas: "content"

    .app-bar
        grid-area: app-bar

    .main-panel
        width: 100%
        height: 100%
        grid-area: content
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 170px 1fr
        grid-template-areas: "users" "mixer"
        position: relative

        .users
            grid-area: users
            padding: 5px

            .user
                height: calc(100% - 10px)
                width: 200px
                position: relative
                vertical-align: top
                display: inline-block
                margin: 5px
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
</style>