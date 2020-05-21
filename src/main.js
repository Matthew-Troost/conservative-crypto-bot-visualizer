import Vue from 'vue'
import App from './App.vue'
import router from './router'
import head from './plugins/vue-head'
import './assets/styles/index.css'
import vuetify from './plugins/vuetify';
import apolloProvider from './plugins/vue-apollo'
import vueMoment from './plugins/vue-moment'
import vuescroll from './plugins/vue-scroll'

Vue.config.productionTip = false

new Vue({
  router,
  head,
  vuetify,
  apolloProvider,
  vueMoment,
  vuescroll,
  render: h => h(App)
}).$mount('#app')
