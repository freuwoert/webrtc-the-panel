import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        view: 'create-room',
        room: null,
        peers: new Map,
        overlays: [],
        socket: io('localhost:5000'),
    },

    getters: {
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
        view(state, data) {
            state.view = data
        },

        room(state, data) {
            state.room = data
        },

        overlays(state, data) {
            state.overlays = data
        },
    },
})
