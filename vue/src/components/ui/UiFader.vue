<template>
    <div class="fader">
        
        <div class="on-indicator" :class="{'on': level > 2}"></div>
        <div class="label">{{label || 'unnamed'}}</div>

        <div class="level-bar">
            <div class="level" :style="'clip-path: inset( calc(100% - '+level+'%) 0 0 0)'"></div>
        </div>

        <div class="decibel-labels">
            <span>- 0</span>
            <span>- 8</span>
            <span>- 16</span>
            <span>- 24</span>
            <span>- 32</span>
            <span>- 40</span>
            <span>- 48</span>
            <span>- 56</span>
        </div>

        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
        props: {
            level: Number,
            label: String,
        },
    }
</script>

<style lang="sass" scoped>
    .fader
        width: 100px
        height: 100%
        background: var(--bg)
        padding: 10px
        border-radius: 4px
        position: relative

        .on-indicator
            height: 6px
            width: 6px
            border-radius: 6px
            position: absolute
            background: var(--bg-dark)
            top: 15px
            left: 11px

            &.on
                box-shadow: 0 0 4px red
                background: red

        .label
            position: absolute
            top: 24px
            left: 13px
            font-size: 12px
            letter-spacing: 1px
            font-weight: 500
            white-space: nowrap
            text-transform: uppercase
            transform: translateX(-100%) rotate(-90deg)
            transform-origin: center right

        .level-bar
            width: 34px
            height: calc(100% - 20px)
            background: var(--bg-dark)
            position: absolute
            top: 10px
            left: calc(50% - 17px)

            .level
                height: 100%
                width: 100%
                position: absolute
                top: 0
                left: 0
                background: rgb(70,232,80)
                background: linear-gradient(0deg, rgba(70,232,80,1) 60%, rgba(236,206,33,1) 60.1%, rgba(236,206,33,1) 85%, rgba(255,44,13,1) 85.1%)
                clip-path: inset(100% 0 0 0)

        .decibel-labels
            font-size: 9px
            height: calc(100% - 30px)
            width: 20px
            position: absolute
            top: 15px
            right: 5px
            display: flex
            flex-direction: column
            align-items: flex-start
            justify-content: space-between
            opacity: 0.7
</style>