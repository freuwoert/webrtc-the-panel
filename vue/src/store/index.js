import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        socket: io(),

        localTracks: {
            video: null,
            audio: null,
        },
        
        localStreams: {
            main: null,
        },

        audio: {
            local: {
                context: new AudioContext(),
                source: null,
                gainNode: null,
                destination: null,
            },
        },

        view: 'create-room',
        overlays: [],
        room: null,
        peers: new Map,
    },

    getters: {
        localAudioTrack(state) {
            return state.localTracks.audio
        },

        localVideoTrack(state) {
            return state.localTracks.video
        },

        mainLocalStream(state) {
            return state.localStreams.main
        },

        localAudioContext(state) {
            return state.audio.local.context
        },

        localAudioSource(state) {
            return state.audio.local.source
        },

        localAudioGainNode(state) {
            return state.audio.local.gainNode
        },

        localAudioDestination(state) {
            return state.audio.local.destination
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
    },

    mutations: {
        localVideoTrack(state, data) {
            state.localTracks.video = data
        },

        localAudioTrack(state, data) {
            state.localTracks.audio = data
        },

        setMuteOnLocalAudioTrack(state, data) {
            Vue.set(state.localTracks.audio, 'enabled', data)
        },

        mainLocalStream(state, data) {
            state.localStreams.main = data
        },

        localAudioSource(state, data) {
            state.audio.local.source = data
        },

        localAudioGainNode(state, data) {
            state.audio.local.gainNode = data
        },

        localAudioDestination(state, data) {
            state.audio.local.destination = data
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
