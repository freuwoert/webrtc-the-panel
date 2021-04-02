import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        socket: io(),

        local: {
            stream: null,
            audio: {
                track: null,
                stream: null,
                context: new AudioContext(),
                source: null,
                gainNode: null,
                analyzer: null,
                destination: null,
            },
            video: {
                track: null,
            },
        },

        view: 'create-room',
        overlays: [],
        room: null,
        peers: new Map,
    },

    getters: {
        localAudioTrack(state) {
            return state.local.audio.track
        },

        localVideoTrack(state) {
            return state.local.video.track
        },

        localStream(state) {
            return state.local.stream
        },

        localAudioContext(state) {
            return state.local.audio.context
        },

        localAudioSource(state) {
            return state.local.audio.source
        },

        localAudioGainNode(state) {
            return state.local.audio.gainNode
        },

        localAudioAnalyzer(state) {
            return state.local.audio.analyzer
        },

        localAudioDestination(state) {
            return state.local.audio.destination
        },



        view(state) {
            return state.view
        },

        room(state) {
            return state.room
        },

        overlays(state) {
            return state.overlays
        },

        peers(state) {
            return state.peers
        },

        socket(state) {
            return state.socket
        },
    },
    
    actions: {
        async setUserMediaInput(state, options) {
            let stream

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: options.requestAudio || false,
                    video: options.requestVideo || false,
                })
            } catch (error) {
                throw error.message
            }

            state.commit('localStream', stream)



            // Run audio setup
            if (options.requestAudio)
            {
                // AUDIO SETUP:
                // Source -> GainNode -> Analyzer & Destination
                state.commit('localAudioSource', state.getters.localAudioContext.createMediaStreamSource(state.getters.localStream))
                state.commit('localAudioAnalyzer', state.getters.localAudioContext.createAnalyser())
                state.commit('localAudioGainNode', state.getters.localAudioContext.createGain())
                state.commit('localAudioDestination', state.getters.localAudioContext.createMediaStreamDestination())
    
                state.getters.localAudioSource.connect(state.getters.localAudioGainNode)
                state.getters.localAudioGainNode.connect(state.getters.localAudioAnalyzer)
                state.getters.localAudioGainNode.connect(state.getters.localAudioDestination)
                
                state.getters.localAudioAnalyzer.fftSize = 32
                state.getters.localAudioAnalyzer.maxDecibels = 0
                state.getters.localAudioAnalyzer.minDecibels = -56
    
                state.getters.localAudioGainNode.gain.setValueAtTime(1, state.getters.localAudioContext.currentTime)
    
                state.getters.localAudioDestination.stream.getAudioTracks().forEach(track => {
                    state.commit('localAudioTrack', track, state.getters.localAudioDestination.stream)
                })
            }
            else if (state.getters.localAudioTrack)
            {
                state.getters.localAudioTrack.stop()
                state.commit('localAudioTrack', null)
            }



            // Run video setup
            if (options.requestVideo)
            {
                stream.getVideoTracks().forEach(track => {
                    state.commit('localVideoTrack', track)
                })
            }
            else if (state.getters.localVideoTrack)
            {
                state.getters.localVideoTrack.stop()
                state.commit('localVideoTrack', null)
            }
        },

        async turnOnUserCam(state) {
            await state.dispatch('setUserMediaInput', {
                requestAudio: true,
                requestVideo: true,
            })
            
            let peers = Array.from(state.getters.peers.values())

            for (let peer of peers)
            {
                peer.audioTrack = peer.connection.addTrack(state.getters.localAudioTrack, state.getters.localStream)
                peer.videoTrack = peer.connection.addTrack(state.getters.localVideoTrack, state.getters.localStream)
            }
        },

        async turnOffUserCam(state) {
            await state.dispatch('setUserMediaInput', {
                requestAudio: true,
                requestVideo: false,
            })
            
            let peers = Array.from(state.getters.peers.values())
            
            for (let peer of peers)
            {
                peer.audioTrack = peer.connection.addTrack(state.getters.localAudioTrack, state.getters.localStream)
                peer.videoTrack = peer.connection.removeTrack(peer.videoTrack) || null
            }
        },
    },

    mutations: {
        localVideoTrack(state, data) {
            state.local.video.track = data
        },

        localAudioTrack(state, data) {
            state.local.audio.track = data
        },

        setMuteOnLocalAudioTrack(state, data) {
            Vue.set(state.local.audio.track, 'enabled', data)
        },

        localStream(state, data) {
            state.local.stream = data
        },

        localAudioSource(state, data) {
            state.local.audio.source = data
        },

        localAudioGainNode(state, data) {
            state.local.audio.gainNode = data
        },

        localAudioAnalyzer(state, data) {
            state.local.audio.analyzer = data
        },

        localAudioDestination(state, data) {
            state.local.audio.destination = data
        },



        view(state, data) {
            state.view = data
        },

        room(state, data) {
            state.room = data
        },

        removeUserFromRoom(state, data) {
            state.room.users.splice(state.room.users.findIndex(e => e.id === data), 1)
        },

        overlays(state, data) {
            state.overlays = data
        },
    },
})
