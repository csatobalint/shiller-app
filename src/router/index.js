console.log('router/index.js')
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
//import firebase from "firebase/app"

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
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
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // redirect to login page if user is not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)

  //const loggedIn = !!firebase.auth()
  const loggedIn = localStorage.getItem('isAuthenticated')

  if (authRequired && !loggedIn) {
    return next('/login')
  }

  next()

  // if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
  //   next('/')
  // } else {
  //   next()
  // }
})

export default router
