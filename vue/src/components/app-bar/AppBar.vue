<template>
    <div class="app-bar">
        <div class="logo-wrapper">
            <img src="../../assets/images/logo_white.svg" alt="The Panel Logo" class="logo">
        </div>
        
        <div class="spacer"></div>

        <div class="button-wrapper">
            <!-- <button class="icon" v-tooltip="'Deafen'">&#983755;</button> -->
            <button class="icon" v-tooltip="this.selfUser.video.stream ? 'Camera off' : 'Camera on'" :class="{'red': this.selfUser.video.stream === null}" @click="$store.dispatch('toggleCamera')">{{this.selfUser.video.stream ? '&#984423;' : '&#984424;'}}</button>
            <!-- <button class="icon" v-tooltip="'Share Screen'">&#988291;</button> -->
            <button class="icon" v-tooltip="this.selfUser.audio.isMuted ? 'Unmute' : 'Mute'" :class="{'red': this.selfUser.audio.isMuted}" @click="$store.dispatch('toggleMute')">{{this.selfUser.audio.isMuted ? '&#983917;' : '&#983916;'}}</button>
            <div class="divider"></div>
            <button class="icon" v-tooltip="'Copy invite-link'" v-clipboard:success="copiedInviteLink" v-clipboard="() => roomInviteLink">&#983060;</button>
            <a class="icon" v-tooltip="'Open invite-link'" :href="roomInviteLink" target="_blank">&#984012;</a>
            <!-- <div class="divider"></div>
            <button class="icon" v-tooltip="'Settings'">&#984211;</button> -->
        </div>

        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
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

            selfUser() {
                return this.room.users.find(e => e.id === this.socket.id)
            },
        },

        methods: {
            copiedInviteLink() {
                alert('Invite link copied to clipboard!')
            },
        },
    }
</script>

<style lang="sass" scoped>
    .app-bar
        background: var(--bg)
        border-radius: 4px
        position: relative
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
                border-left: 2px solid var(--bg-dark)
                height: 30px
                width: 0
                margin: 5px 10px
                vertical-align: top
                pointer-events: none
</style>