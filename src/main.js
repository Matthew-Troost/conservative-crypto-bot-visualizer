import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import vuetify from './plugins/vuetify';
import apolloProvider from './plugins/vue-apollo'
import vueMoment from './plugins/vue-moment'

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  apolloProvider,
  vueMoment,
  render: h => h(App)
}).$mount('#app')
