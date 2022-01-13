console.log("auth.js")
import { db } from './firebase'

const auth = {
	namespaced: true,

	state: {
        isAuthenticated: false,
        user: null,
        metamask: null
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
      },
      SET_METAMASK(state,data){
        state.metamask = data
      }
    },
    actions: {
      fetchUser({ commit, state }, user) {
        commit("SET_LOGGED_IN", user !== null);

        if(user.providerData[0] !== null){
            let userProfile = {
              ...user.providerData[0],
            }
            userProfile.metamask = state.metamask
            db
            .collection('users')
            .doc(user.email)
            .update(userProfile)
            .then(() => {
              commit("SET_USER", userProfile);
            })
        }else {
            commit("SET_USER", null);
        }
      },
      clearUser({commit}){
        commit("DELETE_USER");
      },
      updateMetamask({commit, state}, metamask){
        commit("SET_METAMASK",metamask);
        if(state.user){
          db
          .collection('users')
          .doc(state.user.email)
          .update({metamask: state.metamask})
          .then((data) => {
            console.log(data)
          })
        }
        
      }
    }
};

export default auth
