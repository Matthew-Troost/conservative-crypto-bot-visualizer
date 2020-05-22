import Vue from 'vue'
import VueLodash from 'vue-lodash'
import cloneDeep from 'lodash/cloneDeep'
import meanBy from 'lodash/meanBy'
import take from 'lodash/take'
import sum from 'lodash/sum'
 
Vue.use(VueLodash, { lodash: { cloneDeep, meanBy, take, sum } })

export default VueLodash