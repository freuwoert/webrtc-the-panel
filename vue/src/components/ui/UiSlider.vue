<template>
    <div class="ui-container" @mousedown="down($event)" ref="input">
        <div class="deco-bar">
            <div class="progress" :style="'height: '+percentage+'%;'"></div>
        </div>
        <div class="bar" ref="bar">
            <div class="handle" :style="'bottom: '+percentage+'%;'"></div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 100,
            },
            step: {
                type: Number,
                default: 1,
            },
            value: {}
        },

        data() {
            return {
                value_: 0,
                percentage: 0,
                isGrabbing: false,
            }
        },

        mounted() {
            this.calculate(typeof this.value === 'number' && !isNaN(this.value) ? parseFloat(this.value) : this.value)

            window.addEventListener('mouseup', () => {
                this.up()
            })

            window.addEventListener('mousemove', (event) => {
                this.move(event)
            })
        },

        watch: {
            value() {
                if (!this.isGrabbing) this.calculate(typeof this.value === 'number' && !isNaN(this.value) ? parseFloat(this.value) : this.value_)
            }
        },

        methods: {
            calculate(value) {
                this.value_ = this.clamp(value, this.min, this.max)
                this.value_ = this.value_ - this.value_ % this.step
                this.percentage = this.clamp((this.value_ - this.min) / (this.max - this.min) * 100, 0, 100)
            },

            clamp(value, min, max) {
                return value <= min ? min : value >= max ? max : value;
            },



            down(event) {
                this.isGrabbing = true

                this.calc(event)
            },

            move(event) {
                if (!this.isGrabbing) return

                this.calc(event)
            },

            calc(event) {
                let max = this.$refs.bar.clientHeight
                let pos = event.clientY - this.$refs.bar.getBoundingClientRect().top
                let percentage = 1 - this.clamp(pos / max, 0, 1)
                let value = (this.max - this.min) * percentage + this.min

                this.calculate(value)
                this.emit()
            },

            up() {
                this.isGrabbing = false
            },

            emit(value = this.value_) {
                this.$emit('input', parseFloat(value))
            },
        },
    }
</script>

<style lang="sass" scoped>
    .ui-container
        --width: 30px
        width: var(--width)
        height: 100%
        position: relative
        user-select: none

        .deco-bar
            height: 100%
            width: 10px
            position: absolute
            left: 50%
            top: 0
            transform: translateX(-50%)
            background: var(--bg-dark)
            pointer-events: none
            border-left: 3px solid var(--bg)
            border-right: 3px solid var(--bg)

            .progress
                position: absolute
                bottom: 0
                left: 0
                max-height: 100%
                width: 100%
                background: var(--primary)
                pointer-events: none

        .bar
            height: calc(100% - var(--width) - 16px)
            width: 0
            position: absolute
            left: 50%
            top: calc(var(--width) / 2 + 8px)
            cursor: pointer
            pointer-events: none

            .handle
                position: absolute
                left: 0
                height: 40px
                width: 24px
                border-radius: 3px
                background: var(--bg-dark)
                border: 2px solid var(--bg)
                transform: translate(-50%, 50%)
                pointer-events: none

                &::before
                    content: ''
                    position: absolute
                    top: calc(50% - 3px)
                    left: 50%
                    height: 2px
                    width: 10px
                    transform: translate(-50%, -50%)
                    background: var(--bg)

                &::after
                    content: ''
                    position: absolute
                    top: calc(50% + 3px)
                    left: 50%
                    height: 2px
                    width: 10px
                    transform: translate(-50%, -50%)
                    background: var(--bg)
</style>