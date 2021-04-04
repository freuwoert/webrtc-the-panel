<template>
    <div id="app">
        <splash-create-room v-show="view === 'create-room'"></splash-create-room>
        <splash-join-room v-show="view === 'join-room'"></splash-join-room>
        <control-panel v-show="view === 'room'" v-if="room"></control-panel>
    </div>
</template>

<script>
    const { RTCSessionDescription, RTCIceCandidate } = window
    const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
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

        async created() {
            // this.audioOutput.stream.getAudioTracks().forEach(track => {
            //     this.peerConnection.addTrack(track, this.audioOutput.stream)
            // })
            // this.peerConnection.addTrack(this.audioOutput.stream)
            // console.log(this.audioOutput.getTracks())

            // this.loadAudio('./IntruderAlert.mp3')

            this.socket.on("join-request-answer", async data => {
                console.log('🔹 answer')
                let peer = this.getPeerOrNull(data.from)

                if (!peer) return
                
                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer))
            })





            this.socket.on('client.sync', data => {
                this.$store.commit('overlays', data.overlays)
            })

            this.socket.on('room.join', async () => {
                this.$store.commit('view', 'room')

                await this.$store.dispatch('setUserMediaInput', {
                    requestAudio: true,
                })

                setTimeout(() => {
                    for (const user of Array.from(this.room.users.values()))
                    {
                        if (!user.isSelf)
                        {
                            this.connectToPeer(user.id)
                        }
                    }
                }, 1000)

                this.localAudioContext.resume()
            })

            this.socket.on('room.sync', async (data) => {
                let users = new Map

                for (let user of data.room.users)
                {
                    if(user.id === this.socket.id)
                    {
                        user.isSelf = true
                        user.freq = new Uint8Array(16)
                    }
                    
                    users.set(user.id, user)
                }
                
                this.$store.commit('room', {...data.room, users})
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
                console.log('🔹 offer')

                let peer = await this.getOrCreatePeer(data.from)

                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.offer))
                const answer = await peer.connection.createAnswer()
                await peer.connection.setLocalDescription(new RTCSessionDescription(answer))
                
                this.socket.emit('join-request-answer', {
                    answer,
                    to: data.from
                })
                
                console.log('🔸 answer')
            })



            this.socket.on('peer.add.candidate', async data => {
                let peer = this.getPeerOrNull(data.from)

                if (!peer)
                {
                    console.log('Could not find affiliated peer')
                    return
                }

                peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate))
                console.log('🔹 ice candidate')
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

            localStream() {
                return this.$store.getters.localStream
            },

            localAudioTrack() {
                return this.$store.getters.localAudioTrack
            },

            localVideoTrack() {
                return this.$store.getters.localVideoTrack
            },

            localAudioContext() {
                return this.$store.getters.localAudioContext
            },

            localAudioSource() {
                return this.$store.getters.localAudioSource
            },

            localAudioGainNode() {
                return this.$store.getters.localAudioGainNode
            },

            localAudioDestination() {
                return this.$store.getters.localAudioDestination
            },
        },

        methods: {
            async connectToPeer(id) {
                let peer = await this.getOrCreatePeer(id)
                
                let offer = await peer.connection.createOffer()
                await peer.connection.setLocalDescription(new RTCSessionDescription(offer))

                this.socket.emit('join-request-offer', {
                    offer,
                    to: id
                })
            },

            getPeerOrNull(id) {
                let user = this.room.users.get(id)

                if (!user)
                {
                    return null
                }

                return user.peer
            },

            async getOrCreatePeer(id) {
                let user = this.room.users.get(id)

                if (!user)
                {
                    return
                }

                if (user.peer)
                {
                    return user.peer
                }

                user.peer = {
                    id: id,
                    videoTrack: null,
                    audioTrack: null,
                    audioContext: new AudioContext(),
                    audioSource: null,
                    audioAnalyzer: null,
                    audioGainNode: null,
                    audioDestination: null,
                    connection: new RTCPeerConnection(this.peerConnectionConfig),
                }
                
                user.peer.connection.ontrack = (e) => {
                    const remoteVideo = document.getElementById('video_'+id)
                    
                    if (!remoteVideo) return

                    remoteVideo.srcObject = e.streams[0]
                    remoteVideo.play()

                    user.peer.audioSource = user.peer.audioContext.createMediaStreamSource(e.streams[0])
                    user.peer.audioAnalyzer = user.peer.audioContext.createAnalyser()
                    user.peer.audioGainNode = user.peer.audioContext.createGain()
                    user.peer.audioDestination = user.peer.audioContext.createMediaStreamDestination()
        
                    user.peer.audioSource.connect(user.peer.audioGainNode)
                    user.peer.audioGainNode.connect(user.peer.audioAnalyzer)
                    user.peer.audioGainNode.connect(user.peer.audioDestination)
                    
                    user.peer.audioAnalyzer.fftSize = 32
                    user.peer.audioAnalyzer.maxDecibels = 0
                    user.peer.audioAnalyzer.minDecibels = -56
        
                    user.peer.audioGainNode.gain.setValueAtTime(1, user.peer.audioContext.currentTime)
                }

                user.peer.connection.onicecandidate = (e) => {
                    if (!e.candidate) return

                    console.log('🔹 ice candidate')
                    this.socket.emit('peer.add.candidate', {
                        candidate: e.candidate,
                        to: id
                    })
                }

                user.peer.connection.addEventListener('negotiationneeded', () => {
                    console.log('🔸 renegotiation')
                    this.connectToPeer(id)
                }, false)
                
                if (this.localAudioTrack){ user.peer.audioTrack = user.peer.connection.addTrack(this.localAudioTrack, this.localStream); console.log('AUDIO TRACK ADDED')}
                if (this.localVideoTrack){ user.peer.videoTrack = user.peer.connection.addTrack(this.localVideoTrack, this.localStream); console.log('VIDEO TRACK ADDED')}

                return user.peer
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
    @font-face
        font-family: 'Material Icons'
        src: url("assets/fonts/mdi/materialdesignicons-webfont.eot?v=5.7.55")
        src: url("assets/fonts/mdi/materialdesignicons-webfont.eot?#iefix&v=5.7.55") format("embedded-opentype"), url("assets/fonts/mdi/materialdesignicons-webfont.woff2?v=5.7.55") format("woff2"), url("assets/fonts/mdi/materialdesignicons-webfont.woff?v=5.7.55") format("woff"), url("assets/fonts/mdi/materialdesignicons-webfont.ttf?v=5.7.55") format("truetype")
        font-weight: normal
        font-style: normal

    html, #app
        height: 100%
        width: 100%

    body
        --bg: #393e46
        --bg-dark: #222831
        --text-color: #ebefff
        --primary: #6930c3
        --accent: #64dfdf
        --accent-light: #80ffdb
        --border: 1px solid var(--bg-dark)
        
        height: 100%
        width: 100%
        margin: 0
        padding: 0
        font-family: "Roboto", sans-serif
        -webkit-font-smoothing: antialiased
        -moz-osx-font-smoothing: grayscale
        background: var(--bg-dark)
        color: var(--text-color)

    a,
    button
        display: inline-block
        height: 40px
        line-height: 40px
        padding: 0 15px
        font-size: 13px
        text-align: center
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
        vertical-align: top

        &.icon
            font-family: 'Material Icons'
            font-size: 20px
            width: 40px
            padding: 0
            font-weight: 300
            letter-spacing: 0

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
