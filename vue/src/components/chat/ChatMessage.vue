<template>
    <div class="chat-message-aligner" :class="{'own': source.isOwn}">
        <div class="chat-message-wrapper">
            <span class="name">{{getUserFromId(source.senderId).name || 'UNNAMED'}}</span>
            <span class="message">{{source.rawMessage}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'item-component',
        props: {
            index: Number,
            source: {
                type: Object,
                default () {
                    return {}
                }
            }
        },

        computed: {
            room() {
                return this.$store.getters.room
            },
        },

        methods: {
            getUserFromId(id) {
                return this.room.users.find(e => e.id === id) || {}
            },
        }
    }
</script>

<style lang="sass" scoped>
    .chat-message-aligner
        text-align: left
        margin-bottom: 5px
        filter: drop-shadow(0px 1px 1px #00000030)

        .chat-message-wrapper
            border-radius: 0 5px 5px 5px
            text-align: left
            display: inline-block
            max-width: calc(100% - 70px)
            padding: 8px
            --bg-chat: #3f454e
            background: var(--bg-chat)
            position: relative

            &:after
                position: absolute
                top: 0
                left: -6px
                height: 0
                width: 0
                background: transparent
                border: 3px solid transparent
                border-top-color: var(--bg-chat)
                border-right-color: var(--bg-chat)
                content: ''
                border-radius: 2px 0 0 0

            .name
                width: 100%
                font-size: 12px
                color: #ffffff90
                display: block
                margin-bottom: 5px

            .message
                width: 100%
                font-size: 14px
                display: block
                line-height: 140%
                letter-spacing: 0.3px

        &.own
            text-align: right

            .chat-message-wrapper
                border-radius: 5px 0 5px 5px
                --bg-chat: #556070

                &:after
                    left: unset
                    right: -6px
                    border-top-color: var(--bg-chat)
                    border-right-color: transparent
                    border-left-color: var(--bg-chat)
                    border-radius: 0 2px 0 0

                .name
                    display: none
</style>