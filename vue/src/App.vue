<template>
    <div id="app">
        <splash-create-room v-show="view === 'create-room'"></splash-create-room>
        <splash-join-room v-show="view === 'join-room'"></splash-join-room>
        <control-panel v-show="view === 'room'" v-if="room"></control-panel>
    </div>
</template>

<script>
    const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = window
    import SplashCreateRoom from './components/views/SplashCreateRoom.vue'
    import SplashJoinRoom from './components/views/SplashJoinRoom.vue'
    import ControlPanel from './components/views/ControlPanel.vue'

    export default {
        name: 'App',

        data() {
            return {
                url: {
                    roomId: new URLSearchParams(window.location.search).get('room'),
                },
    
                audioContext: new AudioContext(),
                audioOutput: null,
                buffers: {
                    audio: [],
                },
    
                peerConnectionConfig: {
                    'iceServers': [
                        {'urls': 'stun:stun.stunprotocol.org:3478'},
                        {'urls': 'stun:stun.l.google.com:19302'},
                    ],
                },
            }
        },

        created() {
            // this.audioOutput = this.audioContext.createMediaStreamDestination()

            // this.audioOutput.stream.getAudioTracks().forEach(track => {
            //     this.peerConnection.addTrack(track, this.audioOutput.stream)
            // })
            // this.peerConnection.addTrack(this.audioOutput.stream)
            // console.log(this.audioOutput.getTracks())

            // this.loadAudio('./IntruderAlert.mp3')

            this.socket.on("join-request-answer", async data => {
                let peer = this.peers.get(data.from)

                if (!peer) return
                
                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer))

                if (!peer.isConnected)
                {
                    // Why do we do this two times? Like for real, I don't get it
                    peer.isConnected = true
                    this.connectToPeer(data.from)
                }
            })





            this.socket.on('client.sync', data => {
                this.$store.commit('overlays', data.overlays)
            })

            this.socket.on('room.join', data => {
                this.$store.commit('view', 'room')

                for (const userId of data.users)
                {
                    if (userId !== this.socket.id)
                    {
                        this.connectToPeer(userId)
                    }
                }
            })

            this.socket.on('room.sync', data => {
                this.$store.commit('room', data.room)
            })

            this.socket.on('room.user.left', data => {
                this.$store.commit('removeUserFromRoom', data.userId)
            })



            if (this.url.roomId)
            {
                this.socket.emit('server.check.room-id', {
                    id: this.url.roomId,
                })
            }



            this.socket.on('join-request-offer', async data => {
                console.log('Offer received!')

                let peer = await this.getOrCreatePeer(data.from)

                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.offer))
                const answer = await peer.connection.createAnswer()
                await peer.connection.setLocalDescription(new RTCSessionDescription(answer))
                
                this.socket.emit('join-request-answer', {
                    answer,
                    to: data.from
                })
                
                console.log('Answer sent!')
            })



            this.socket.on('peer.add.candidate', async data => {
                let peer = this.getPeerOrNull(data.from)

                if (!peer)
                {
                    console.log('Could not find affiliated peer')
                    return
                }

                peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate))
                console.log('added remote candidate')
            })
        },

        computed: {
            view() {
                return this.$store.getters.view
            },

            room() {
                return this.$store.getters.room
            },

            peers() {
                return this.$store.getters.peers
            },

            socket() {
                return this.$store.getters.socket
            },
        },

        methods: {
            async connectToPeer(socketId) {
                let peer = await this.getOrCreatePeer(socketId)
                
                let offer = await peer.connection.createOffer()
                await peer.connection.setLocalDescription(new RTCSessionDescription(offer))

                this.socket.emit('join-request-offer', {
                    offer,
                    to: socketId
                })
            },

            getPeerOrNull(socketId) {
                return this.peers.get(socketId) || null
            },

            async getOrCreatePeer(socketId) {
                if (this.peers.get(socketId))
                {
                    return this.peers.get(socketId)
                }

                let peer = {
                    socketId: socketId,
                    isConnected: false,
                    connection: new RTCPeerConnection(this.peerConnectionConfig),
                }
                
                peer.connection.ontrack = (e) => {
                    const remoteVideo = document.getElementById('video_'+socketId)
                    
                    if (remoteVideo)
                    {
                        remoteVideo.srcObject = e.streams[0]
                        remoteVideo.play()
                    }
                }

                peer.connection.onicecandidate = (e) => {
                    if (e.candidate)
                    {
                        console.log('generated ice candidate... about to send')
                        this.socket.emit('peer.add.candidate', {
                            candidate: e.candidate,
                            to: socketId
                        })
                    }
                }

                try {
                    let stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    })
                    
                    stream.getTracks().forEach(track => {
                        peer.connection.addTrack(track, stream)
                    })
                } catch (error) {
                    console.log(error.message)
                }

                this.peers.set(socketId, peer)

                return peer
            },



            loadAudio(url) {
                fetch(url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    this.buffers.audio.push(audioBuffer)
                });
            },

            playAudio(index) {
                console.log(index)
                let source = this.audioContext.createBufferSource()
                source.buffer = this.buffers.audio[index]
                source.connect(this.audioOutput)
                source.start()
                console.log(source)
            },
        },

        components: {
            SplashCreateRoom,
            SplashJoinRoom,
            ControlPanel,
        }
    }
</script>

<style lang="sass">
    html, #app
        height: 100%
        width: 100%

    body
        height: 100%
        width: 100%
        --bg: #fff
        --bg-dark: #f4f4f4
        --text-color: #252525
        --primary: #6930c3
        --accent: #64dfdf
        --accent-light: #80ffdb
        margin: 0
        padding: 0
        font-family: "Roboto", sans-serif
        -webkit-font-smoothing: antialiased
        -moz-osx-font-smoothing: grayscale
        background: var(--bg)
        color: var(--text-color)

    a,
    button
        display: inline-block
        height: 40px
        line-height: 40px
        padding: 0 15px
        font-size: 13px
        text-transform: uppercase
        letter-spacing: 2px
        border-radius: 5px
        background: var(--accent)
        color: #252525
        border: none
        font-weight: 600
        user-select: none
        cursor: pointer
        transition: background 100ms
        filter: drop-shadow(0 3px 7px #00000040)
        font-family: "Roboto", sans-serif
        text-decoration: none

        &:hover
            background: var(--accent-light)

    select, input
        width: 100%
        border: none
        height: 40px
        padding: 0 10px
        border-radius: 5px
        font-family: "Roboto", sans-serif

    *
        box-sizing: border-box

    *:focus
        outline: none

    h1, h2, h3, h4, h5, h6
        font-family: 'Poppins', sans-serif
        letter-spacing: 0.5px
        color: var(--accent)
</style>
