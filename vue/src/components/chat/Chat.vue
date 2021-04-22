<template>
    <div class="chat">
        <virtual-list class="chat-list" ref="chatList" :data-key="'id'" :data-sources="room.chat" :data-component="messageComponent"/>
        
        <form @submit.prevent="sendMessage(message)" class="message-form">
            <input placeholder="Message Chat" type="text" v-model="message" class="chat-bar">
        </form>

        <ui-screws></ui-screws>
    </div>
</template>

<script>
    import VirtualList from 'vue-virtual-scroll-list'
    import ChatMessage from './ChatMessage.vue'

    export default {
        data() {
            return {
                message: '',
                messageComponent: ChatMessage,
            }
        },

        mounted() {
            this.$refs.chatList.scrollToBottom()

            this.socket.on('room.message.sent', () => {
                this.$refs.chatList.scrollToBottom()
            })
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
            sendMessage(message)
            {
                message = message.trim()

                if (!message) return

                this.socket.emit('room.message.send', {
                    message,
                })

                this.message = ''
            },
        },

        components: {
            'virtual-list': VirtualList,
        }
    }
</script>

<style lang="sass" scoped>
    .chat
        background: var(--bg)
        border-radius: 4px
        position: relative

        .chat-list
            height: calc(100% - 76px)
            width: 100%
            padding: 0 10px
            position: absolute
            top: 10px
            left: 0
            overflow-x: hidden
            overflow-y: scroll

        .chat-bar
            height: 46px
            border-radius: 5px
            width: calc(100% - 20px)
            background: var(--bg-dark)
            color: #fff
            position: absolute
            bottom: 10px
            left: 10px
            padding: 0 15px
            letter-spacing: 0.3px
            font-family: 'Roboto'

            &::placeholder
                color: #ffffff30
                letter-spacing: 0.5px
</style>