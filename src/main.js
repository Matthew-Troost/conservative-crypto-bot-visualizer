import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from "./vuex"
import head from './plugins/vue-head'
import './assets/styles/index.css'
import vuetify from './plugins/vuetify';
import apolloProvider from './plugins/vue-apollo'
import vueMoment from './plugins/vue-moment'
import vuescroll from './plugins/vue-scroll'
import vueLodash from './plugins/vue-lodash'

Vue.config.productionTip = false

new Vue({
  router,
  head,
  vuetify,
  apolloProvider,
  vueMoment,
  store,
  vuescroll,
  vueLodash,
  render: h => h(App)
}).$mount('#app')
