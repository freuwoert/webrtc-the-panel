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
            },
            video: {
                track: null,
            },
        },

        view: 'create-room',
        overlays: [],
        room: null,
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



        view(state) {
            return state.view
        },

        room(state) {
            return state.room
        },

        overlays(state) {
            return state.overlays
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


            let selfUser = () => {
                return state.getters.room.users.find(e => e.isSelf === true)
            }

            // Run audio setup
            if (options.requestAudio && selfUser())
            {
                let id = selfUser().id

                // AUDIO SETUP:
                // Source -> GainNode -> Analyzer & Destination
                state.commit('setUserAudio', {id, data: {audioContext: new AudioContext()}})
                state.commit('setUserAudio', {id, data: {freq: new Uint8Array(16)}})
                state.commit('setUserAudio', {id, data: {audioSource: selfUser().audio.audioContext.createMediaStreamSource(state.getters.localStream)}})
                state.commit('setUserAudio', {id, data: {audioAnalyzer: selfUser().audio.audioContext.createAnalyser()}})
                state.commit('setUserAudio', {id, data: {audioGainNode: selfUser().audio.audioContext.createGain()}})
                state.commit('setUserAudio', {id, data: {audioDestination: selfUser().audio.audioContext.createMediaStreamDestination()}})
    
                selfUser().audio.audioSource.connect(selfUser().audio.audioGainNode)
                selfUser().audio.audioGainNode.connect(selfUser().audio.audioAnalyzer)
                selfUser().audio.audioGainNode.connect(selfUser().audio.audioDestination)
                
                selfUser().audio.audioAnalyzer.fftSize = 32
                selfUser().audio.audioAnalyzer.maxDecibels = 0
                selfUser().audio.audioAnalyzer.minDecibels = -56
    
                selfUser().audio.audioGainNode.gain.setValueAtTime(1, selfUser().audio.audioContext.currentTime)
    
                selfUser().audio.audioDestination.stream.getAudioTracks().forEach(track => {
                    state.commit('localAudioTrack', track, selfUser().audio.audioDestination.stream)
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
            
            let users = state.getters.room.users

            for (let user of users)
            {
                if (user.id === state.getters.socket.id) continue
                user.peer.audioTrack = user.peer.connection.addTrack(state.getters.localAudioTrack, state.getters.localStream)
                user.peer.videoTrack = user.peer.connection.addTrack(state.getters.localVideoTrack, state.getters.localStream)
            }
        },
        
        async turnOffUserCam(state) {
            await state.dispatch('setUserMediaInput', {
                requestAudio: true,
                requestVideo: false,
            })
            
            let users = state.getters.room.users
            
            for (let user of users)
            {
                if (user.id === state.getters.socket.id) continue
                user.peer.audioTrack = user.peer.connection.addTrack(state.getters.localAudioTrack, state.getters.localStream)
                user.peer.videoTrack = user.peer.connection.removeTrack(user.peer.videoTrack) || null
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



        view(state, data) {
            state.view = data
        },

        room(state, data) {
            state.room = data
        },

        addUser(state, data) {
            state.room.users.push(data)
        },

        setUser(state, data) {
            let index = state.room.users.findIndex(e => e.id === data.id)

            state.room.users[index] = {...state.room.users[index], ...data.data}
        },

        setUserAudio(state, data) {
            let index = state.room.users.findIndex(e => e.id === data.id)
            
            Vue.set(state.room.users[index], 'audio', {...state.room.users[index].audio, ...data.data})
        },

        removeUserFromRoom(state, data) {
            state.room.users = state.room.users.filter(e => e.id !== data)
        },

        overlays(state, data) {
            state.overlays = data
        },
    },
})
