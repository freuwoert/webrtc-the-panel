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

        controlPanelSetup: {
            visibleContentPanel: 'main-panel',
        },

        hotkeySetup: {
            scope: 'default',
        },

        view: 'create-room',
        url: {
            roomId: null,
            overlayId: null,
        },
        overlays: [],
        lobby: null, // Lobby is a pre-room without a "selfUser"
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

        lobby(state) {
            return state.lobby
        },

        url(state) {
            return state.url
        },

        overlays(state) {
            return state.overlays
        },

        socket(state) {
            return state.socket
        },

        controlPanelSetup(state) {
            return state.controlPanelSetup
        },

        hotkeySetup(state) {
            return state.hotkeySetup
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

            let id = selfUser().id

            // Run audio setup
            if (options.requestAudio && selfUser())
            {
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
                
                let level = selfUser().audio.isMuted ? 0 : selfUser().audio.volume / 100
                
                selfUser().audio.audioGainNode.gain.setValueAtTime(level, selfUser().audio.audioContext.currentTime)
                
                selfUser().audio.audioDestination.stream.getAudioTracks().forEach(track => {
                    state.commit('localAudioTrack', track, selfUser().audio.audioDestination.stream)
                })

                state.commit('setUserAudioStream', {id, data: selfUser().audio.audioDestination.stream})
            }
            else if (state.getters.localAudioTrack)
            {
                state.getters.localAudioTrack.stop()
                state.commit('localAudioTrack', null)
                state.commit('setUserAudioStream', {id, data: null})
            }



            // Run video setup
            if (options.requestVideo)
            {
                stream.getVideoTracks().forEach(track => {
                    state.commit('localVideoTrack', track)
                })

                state.commit('setUserVideoStream', {id, data: stream})
            }
            else if (state.getters.localVideoTrack)
            {
                state.getters.localVideoTrack.stop()
                state.commit('localVideoTrack', null)
                state.commit('setUserVideoStream', {id, data: null})
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
                if (user.id === state.getters.socket.id) continue // Exclude self
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
                if (user.id === state.getters.socket.id) continue // Exclude self
                user.peer.audioTrack = user.peer.connection.addTrack(state.getters.localAudioTrack, state.getters.localStream)
                user.peer.videoTrack = user.peer.connection.removeTrack(user.peer.videoTrack) || null
            }
        },

        toggleCamera(state) {
            state.dispatch(state.getters.localVideoTrack ? 'turnOffUserCam' : 'turnOnUserCam')
        },

        toggleMute(state) {
            let user = state.getters.room.users.find(e => e.isSelf === true)

            state.commit('setMute', !user.audio.isMuted)
        },
    },

    mutations: {
        localVideoTrack(state, data) {
            state.local.video.track = data
        },

        localAudioTrack(state, data) {
            state.local.audio.track = data
        },

        setMute(state, data) {
            let user = state.room.users.find(e => e.id === state.socket.id)

            user.audio.isMuted = data
            user.audio.audioGainNode.gain.setValueAtTime(data ? 0 : 1, user.audio.audioContext.currentTime)

            state.socket.emit('room.user.set-mute', {
                userId: user.id,
                isMuted: data,
            })
        },

        localStream(state, data) {
            state.local.stream = data
        },



        view(state, data) {
            state.view = data
        },

        lobby(state, data) {
            state.lobby = data
        },

        room(state, data) {
            state.room = data
        },

        url(state, data) {
            Vue.set(state, 'url', {...state.url, ...data})
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

        setUserVideo(state, data) {
            let index = state.room.users.findIndex(e => e.id === data.id)
            
            Vue.set(state.room.users[index], 'video', {...state.room.users[index].video, ...data.data})
        },

        setUserAudioStream(state, data) {
            let index = state.room.users.findIndex(e => e.id === data.id)
            
            Vue.set(state.room.users[index].audio, 'stream', data.data)
        },

        setUserVideoStream(state, data) {
            let index = state.room.users.findIndex(e => e.id === data.id)
            
            Vue.set(state.room.users[index].video, 'stream', data.data)
        },



        addMessage(state, data) {
            data.message.isOwn = data.message.senderId === state.socket.id
            state.room.chat.push(data.message)
        },

        removeUserFromRoom(state, data) {
            state.room.users = state.room.users.filter(e => e.id !== data)
        },

        overlays(state, data) {
            state.overlays = data
        },



        setVisibleContentPanel(state, data) {
            state.controlPanelSetup.visibleContentPanel = data
        },
    },
})
