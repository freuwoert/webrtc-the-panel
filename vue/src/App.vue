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



            this.socket.on('room.user.joined', async (data) => {
                this.$store.commit('addUser', data.user)
            })

            this.socket.on('room.self.joined', async (data) => {
                let users = []

                for (let user of data.room.users)
                {
                    if(user.id === this.socket.id)
                    {
                        user.isSelf = true
                    }
                    
                    users.push(user)
                }
                
                this.$store.commit('view', 'room')
                this.$store.commit('room', {...data.room, users})

                await this.$store.dispatch('setUserMediaInput', {
                    requestAudio: true,
                })

                for (const user of this.room.users)
                {
                    if (!user.isSelf)
                    {
                        this.connectToPeer(user.id)
                    }
                }
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
                let user = this.room.users.find(e => e.id === id)

                if (!user)
                {
                    return null
                }

                return user.peer
            },

            async getOrCreatePeer(id) {
                let userIndex = this.room.users.findIndex(e => e.id === id)

                if (userIndex < 0)
                {
                    return
                }

                if (this.room.users[userIndex].peer)
                {
                    return this.room.users[userIndex].peer
                }

                let audio = {
                    volume: 100,
                    overlayVolume: 100,
                    level: 0,
                    freq: new Uint8Array(16),
                    audioContext: new AudioContext(),
                    audioSource: null,
                    audioAnalyzer: null,
                    audioGainNode: null,
                    audioDestination: null,
                }

                let peer = {
                    id: id,
                    videoTrack: null,
                    audioTrack: null,
                    connection: new RTCPeerConnection(this.peerConnectionConfig),
                }
                
                peer.connection.ontrack = (e) => {
                    console.log('sfdfdsfsd')
                    const remoteVideo = document.getElementById('video_'+id)
                    
                    if (!remoteVideo) return

                    remoteVideo.srcObject = e.streams[0]
                    remoteVideo.play()

                    let selfUser = () => {
                        return this.room.users.find(e => e.id === id)
                    }

                    console.log(id)


                    this.$store.commit('setUserAudio', {id, data: {audioSource: selfUser().audio.audioContext.createMediaStreamSource(e.streams[0])}})
                    this.$store.commit('setUserAudio', {id, data: {audioAnalyzer: selfUser().audio.audioContext.createAnalyser()}})
                    this.$store.commit('setUserAudio', {id, data: {audioGainNode: selfUser().audio.audioContext.createGain()}})
                    this.$store.commit('setUserAudio', {id, data: {audioDestination: selfUser().audio.audioContext.createMediaStreamDestination()}})
        
                    selfUser().audio.audioSource.connect(selfUser().audio.audioGainNode)
                    selfUser().audio.audioGainNode.connect(selfUser().audio.audioAnalyzer)
                    selfUser().audio.audioGainNode.connect(selfUser().audio.audioDestination)
                    
                    selfUser().audio.audioAnalyzer.fftSize = 32
                    selfUser().audio.audioAnalyzer.maxDecibels = 0
                    selfUser().audio.audioAnalyzer.minDecibels = -56
        
                    selfUser().audio.audioGainNode.gain.setValueAtTime(1, selfUser().audio.audioContext.currentTime)
                }

                peer.connection.onicecandidate = (e) => {
                    if (!e.candidate) return

                    console.log('🔹 ice candidate')
                    this.socket.emit('peer.add.candidate', {
                        candidate: e.candidate,
                        to: id
                    })
                }

                peer.connection.addEventListener('negotiationneeded', () => {
                    console.log('🔸 renegotiation')
                    this.connectToPeer(id)
                }, false)
                
                if (this.localAudioTrack){ peer.audioTrack = peer.connection.addTrack(this.localAudioTrack, this.localStream)}
                if (this.localVideoTrack){ peer.videoTrack = peer.connection.addTrack(this.localVideoTrack, this.localStream)}

                this.$store.commit('setUser', { id, data: {peer, audio} })

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
