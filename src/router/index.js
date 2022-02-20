console.log('router/index.js')
import Vue from 'vue'
import store from './../store'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
//import firebase from "firebase/app"

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
  {
   path: '/questions',
   name: 'questions',
   component: () => import('../views/Questions.vue'),
  },
  {
    path: '/mybids',
    name: 'mybids',
    component: () => import('../views/MyBids.vue'),
   },
   {
    path: '/bidstome',
    name: 'bidstome',
    component: () => import('../views/BidsToMe.vue'),
   },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


 router.beforeEach((to, from, next) => {
  // redirect to login page if user is not logged in and trying to access a restricted page
  //const publicPages = ['/login', '/register']
  const publicPages = ['/']
  const authRequired = !publicPages.includes(to.path)

  //const loggedIn = !!firebase.auth()
  //const loggedIn = localStorage.getItem('isAuthenticated')
  const loggedIn = store.state.auth.isMetaMaskAuthenticated

  if (authRequired && !loggedIn) {
    return next('/')
    //return next('/login')
  }

  next()

  // if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
  //   next('/')
  // } else {
  //   next()
  // }
})

export default router
