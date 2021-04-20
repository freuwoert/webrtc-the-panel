import Vue from 'vue'
import App from './App.vue'
import store from './store'
import UiFader from './components/ui/UiFader.vue'
import UiSlider from './components/ui/UiSlider.vue'
import UiSpinner from './components/ui/UiSpinner.vue'
import UiScrews from './components/ui/UiScrews.vue'
import Clipboard from 'v-clipboard'
import VTooltip from 'v-tooltip'
import hotkeys from 'hotkeys-js'

Vue.use(VTooltip)
Vue.use(Clipboard)

Vue.config.productionTip = false

Vue.component('ui-screws', UiScrews)
Vue.component('ui-fader', UiFader)
Vue.component('ui-slider', UiSlider)
Vue.component('ui-spinner', UiSpinner)

new Vue({
    store,
    render: h => h(App),
    mounted() {
        // Toggle Camera
        hotkeys('ctrl+v', (event, handler) => {
            this.$store.dispatch('toggleCamera')
        })

        // Toggle Mute
        hotkeys('ctrl+m', (event, handler) => {
            this.$store.dispatch('toggleMute')
        })
    },
}).$mount('#app')
