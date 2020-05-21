import Vue from 'vue'
import VueLodash from 'vue-lodash'
import cloneDeep from 'lodash/cloneDeep'
 
Vue.use(VueLodash, { lodash: { cloneDeep } })

export default VueLodash