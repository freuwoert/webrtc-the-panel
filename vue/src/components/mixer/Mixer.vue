<template>
    <div class="mixer">
        <ui-fader label="User Cap" :level="0" :uv="100" :ov="100"></ui-fader>
        <ui-fader label="Guest Cap" :level="0" :uv="100" :ov="100"></ui-fader>

        <div class="minimal-spacer"></div>

        <ui-fader v-for="user in room.users" :key="user.id" :label="user.id !== socket.id ? user.name : 'Local'" :level="levels[user.id]" :uv="user.audio.volume" @uv="setUserVolume(user, $event)" :ov="user.audio.overlayVolume"></ui-fader>

        <div class="spacer">
            <img src="../../assets/images/logo_white.svg" alt="The Panel Logo" class="logo">
        </div>

        <ui-screws></ui-screws>
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
        },

        computed: {
            room() {
                return this.$store.getters.room
            },

            socket() {
                return this.$store.getters.socket
            },
        },

        methods: {
            setUserVolume(user, volume) {
                this.socket.emit('room.user.set-volume', {
                    userId: user.id,
                    volume,
                })
            },
        },
    }
</script>

<style lang="sass" scoped>
    .mixer
        background: var(--bg)
        border-radius: 4px
        position: relative
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

</style>