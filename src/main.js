// //return (bid.answered, bid.withdrawn, answerId, bid.timeLimit, bid.time, bid.sum, bid.ownerAddress, bid.beneficiaryAddress); 
// window.BID_ANSWERED = 1;
// window.BID_WITHDRAWN = 2;
// window.BID_ANSWER_ID = 3;
// window.BID_TIME_LIMIT = 4;
// window.BID_TIME = 5;
// window.BID_SUM = 6;
// window.BID_OWNER_ADDRESS = 7;
// window.BID_BENEFICIARY_ADDRESS = 8;

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

window.app = new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
