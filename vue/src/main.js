import Vue from 'vue'
import App from './App.vue'
import store from './store'
import UiFader from './components/ui/UiFader.vue'
import UiScrews from './components/ui/UiScrews.vue'

Vue.config.productionTip = false

Vue.component('ui-screws', UiScrews)
Vue.component('ui-fader', UiFader)

new Vue({
    store,
    render: h => h(App)
}).$mount('#app')
