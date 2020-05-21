import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../pages/dashboard'

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard,
            meta: {
                title: 'Dash',
              }
        }
    ],
    mode: 'history'
})