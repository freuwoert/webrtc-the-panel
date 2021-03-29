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
