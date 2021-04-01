<template>
    <div class="fader">
        <div class="level-bar">
            <div class="level" :style="'clip-path: inset( calc(100% - '+level+'%) 0 0 0)'"></div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            level: Number,
        },
    }
</script>

<style lang="sass" scoped>
    .fader
        width: 80px
        height: 250px
        background: var(--bg)
        padding: 10px
        border-radius: 4px

        .level-bar
            width: 5px
            height: 100%
            background: var(--bg-dark)
            border-radius: 1px
            position: relative
            overflow: hidden

            .level
                height: 100%
                width: 100%
                position: absolute
                top: 0
                left: 0
                background: rgb(70,232,80)
                background: linear-gradient(0deg, rgba(70,232,80,1) 60%, rgba(236,206,33,1) 60.5%, rgba(236,206,33,1) 85%, rgba(255,44,13,1) 85.5%)
                clip-path: inset(100% 0 0 0)
</style>