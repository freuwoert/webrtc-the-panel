<template>
    <div class="fader">
        
        <div class="on-indicator" :class="{'on': level > 2}"></div>
        <div class="label">{{label || 'unnamed'}}</div>

        <div class="column">
            <div class="slider-wrapper">
                <div class="level-bar">
                    <div class="level" :style="'clip-path: inset( calc(100% - '+level+'%) 0 0 0)'"></div>
                </div>
                <ui-slider class="slider" :value="uv" @input="$emit('uv', $event)"></ui-slider>
            </div>
            <div class="text">U</div>
        </div>

        <div class="column">
            <div class="slider-wrapper">
                <div class="level-bar">
                    <div class="level" :style="'clip-path: inset( calc(100% - '+level+'%) 0 0 0)'"></div>
                </div>
                <ui-slider class="slider" :value="ov" @input="$emit('ov', $event)"></ui-slider>
            </div>
            <div class="text">Ov</div>
        </div>

        <div class="column">
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
            <div class="text">
                dB
            </div>
        </div>

        <ui-screws></ui-screws>
    </div>
</template>

<script>
    export default {
        props: {
            uv: Number,
            ov: Number,
            level: Number,
            label: String,
        },
    }
</script>

<style lang="sass" scoped>
    .fader
        height: 100%
        background: var(--bg)
        padding: 10px 10px 10px 30px
        border-radius: 4px
        position: relative
        display: flex
        gap: 10px

        .on-indicator
            height: 6px
            width: 6px
            border-radius: 6px
            position: absolute
            background: var(--bg-dark)
            top: 15px
            left: 12px
            pointer-events: none
            user-select: none

            &.on
                box-shadow: 0 0 4px red
                background: red

        .label
            position: absolute
            top: 24px
            left: 14px
            font-size: 12px
            letter-spacing: 1px
            font-weight: 500
            white-space: nowrap
            text-transform: uppercase
            transform: translateX(-100%) rotate(-90deg)
            transform-origin: center right
            pointer-events: none
            user-select: none

        .column
            display: flex
            flex-direction: column
            height: 100%
            gap: 10px

            .text
                height: 20px
                width: 100%
                font-size: 12px
                display: grid
                place-content: center
                font-weight: 300
                opacity: 0.7
                user-select: none

            .decibel-labels
                font-size: 9px
                flex: 1
                margin: 5px 0
                width: 20px
                display: flex
                flex-direction: column
                align-items: flex-start
                justify-content: space-between
                opacity: 0.7
                user-select: none
                pointer-events: none

            .slider-wrapper
                width: 30px
                flex: 1
                position: relative

                .level-bar
                    width: 100%
                    height: 100%
                    background: var(--bg-dark)
                    position: absolute
                    top: 0
                    left: 0
                    overflow: hidden
                    border-radius: 3px

                    .level
                        height: 100%
                        width: 100%
                        position: absolute
                        top: 0
                        left: 0
                        background: rgb(70,232,80)
                        background: linear-gradient(0deg, rgba(70,232,80,1) 60%, rgba(236,206,33,1) 60.1%, rgba(236,206,33,1) 85%, rgba(255,44,13,1) 85.1%)
                        clip-path: inset(100% 0 0 0)

        .slider
            height: 100%
            position: absolute
            top: 0
            left: 0
</style>