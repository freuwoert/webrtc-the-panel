<template>
    <div id="wrapper">
        <app-bar class="app-bar"></app-bar>

        <div class="main-panel" v-show="controlPanelSetup.visibleContentPanel === 'main-panel'">
            <users class="users"></users>
            <launchpad class="launchpad"></launchpad>
            <player class="player"></player>
            <chat class="chat"></chat>
            <mixer class="mixer"></mixer>
        </div>

        <fullscreen-video-panel class="fullscreen-video-panel" v-show="controlPanelSetup.visibleContentPanel === 'fullscreen-video-panel'"></fullscreen-video-panel>
    </div>
</template>

<script>
    import FullscreenVideoPanel from './FullscreenVideoPanel.vue'
    import Chat from '../chat/Chat.vue'
    import Mixer from '../mixer/Mixer.vue'
    import Users from '../users/Users.vue'
    import Launchpad from '../launchpad/Launchpad.vue'
    import Player from '../player/Player.vue'
    import AppBar from '../app-bar/AppBar.vue'

    export default {
        mounted() {
            // Toggle Camera
            hotkeys('ctrl+v', (event, handler) => {
                this.$store.dispatch('toggleCamera')
            })

            // Toggle Mute
            hotkeys('ctrl+m', (event, handler) => {
                this.$store.dispatch('toggleMute')
            })
        },

        computed: {
            controlPanelSetup() {
                return this.$store.getters.controlPanelSetup
            },
        },

        components: {
            Chat,
            Mixer,
            Users,
            Launchpad,
            Player,
            AppBar,
            FullscreenVideoPanel
        },
    }
</script>

<style lang="sass" scoped>
    #wrapper
        width: 100%
        height: 100%
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 60px 1fr
        grid-template-areas: "app-bar" "content"
        padding: 3px
        gap: 3px

    .app-bar
        grid-area: app-bar

    .main-panel
        width: 100%
        height: 100%
        grid-area: content
        display: grid
        grid-template-columns: 400px 1fr 450px
        grid-template-rows: 150px 1fr 350px
        grid-template-areas: "users users users" "launchpad player chat" "mixer mixer chat"
        gap: 3px
        position: relative

        .users
            grid-area: users

        .launchpad
            grid-area: launchpad

        .player
            grid-area: player

        .chat
            grid-area: chat

        .mixer
            grid-area: mixer
</style>