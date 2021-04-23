<template>
    <div id="wrapper">
        <app-bar class="app-bar"></app-bar>

        <div class="main-panel">
            <users class="users"></users>
            <mixer class="mixer"></mixer>
        </div>
    </div>
</template>

<script>
    import Mixer from '../mixer/Mixer.vue'
    import Users from '../users/Users.vue'
    import AppBar from '../app-bar/AppBar.vue'

    export default {
        components: {
            Mixer,
            Users,
            AppBar
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