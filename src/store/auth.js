console.log("auth.js")
import { db } from './firebase'

const auth = {
	namespaced: true,

	state: {
        isAuthenticated: false,
        user: null
    },

    getters: {
      user(state){
        return state.user
      },
      isAuthenticated(state){
          return state.isAuthenticated
      }
    },
    mutations: {
      SET_LOGGED_IN(state, value) {
        state.isAuthenticated = value;
      },
      SET_USER(state, data) {
        state.user = data;
        localStorage.setItem('isAuthenticated', true)
      },
      DELETE_USER(state){
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('isAuthenticated')
      }
    },
    actions: {
      fetchUser({ commit }, user) {
        commit("SET_LOGGED_IN", user !== null);

        if(user.providerData[0] !== null){
            let userProfile = {
              ...user.providerData[0],
            }
            db
            .collection('users')
            .doc(user.email)
            .set(userProfile)
            .then(() => {
              commit("SET_USER", userProfile);
            })
        }else {
            commit("SET_USER", null);
        }
      },
      clearUser({commit}){
        commit("DELETE_USER");
      }
    }
};

export default auth
