// return(bid.answered, bid.withdrawn, bid.timestamp, bid.deadline, bid.value, bid.sum, bid.ownerAddress, bid.beneficiaryAddress, bid.messages);
// window.BID_ANSWERED = 1;
// window.BID_WITHDRAWN = 2;
// window.BID_TIMESTAMP = 3;
// window.BID_DEADLINE = 4;
// window.BID_VALUE = 5;
// window.BID_SUM = 6;
// window.BID_OWNER_ADDRESS = 7;
// window.BID_BENEFICIARY_ADDRESS = 8;
// window.BID_MESSAGES = 9;

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
