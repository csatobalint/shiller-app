import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed)
import VueMeta from 'vue-meta'
Vue.use(VueMeta)

Vue.config.productionTip = false

window.app = new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
