import Vue from 'vue'
import App from './App.vue'
import store from './store'
import UiFader from './components/ui/UiFader.vue'
import UiSlider from './components/ui/UiSlider.vue'
import UiSpinner from './components/ui/UiSpinner.vue'
import UiScrews from './components/ui/UiScrews.vue'

Vue.config.productionTip = false

Vue.component('ui-screws', UiScrews)
Vue.component('ui-fader', UiFader)
Vue.component('ui-slider', UiSlider)
Vue.component('ui-spinner', UiSpinner)

new Vue({
    store,
    render: h => h(App)
}).$mount('#app')
