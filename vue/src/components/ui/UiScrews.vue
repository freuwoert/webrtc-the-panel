<template>
    <div class="screws">
        <div class="screw screw-top-left"></div>
        <div class="screw screw-top-right"></div>
        <div class="screw screw-bottom-left"></div>
        <div class="screw screw-bottom-right"></div>
    </div>
</template>

<style lang="sass" scoped>
    .screws
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        pointer-events: none
        
        .screw
            height: 4px
            width: 4px
            border-radius: 4px
            background: var(--bg-dark)
            position: absolute
            --screw-space: 3px

            &.screw-top-left
                left: var(--screw-space)
                top: var(--screw-space)

            &.screw-top-right
                right: var(--screw-space)
                top: var(--screw-space)

            &.screw-bottom-left
                left: var(--screw-space)
                bottom: var(--screw-space)

            &.screw-bottom-right
                right: var(--screw-space)
                bottom: var(--screw-space)
</style>