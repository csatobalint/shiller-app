console.log("auth.js")
import { db } from './firebase'

const auth = {
	namespaced: true,

	state: {
        isAuthenticated: false,
        user: null,
        metamask: null,
        userName: localStorage.getItem('userName'),
    },

    getters: {
      user(state){
        return state.user
      },
      userName(state){
        return state.userName
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
        localStorage.removeItem('userName')
      },
      SET_METAMASK(state,data){
        state.metamask = data
      },
      SET_USERNAME(state,data){
        state.userName = data
        localStorage.setItem('userName', data)
      }
    },
    actions: {
      async fetchUser({ commit, state }, user) {
        commit("SET_LOGGED_IN", user !== null);
        if(user.providerData[0] !== null){
            let userProfile = {
              email: user.providerData[0].email,
              displayName: user.providerData[0].displayName,
            }

            if(state.metamask)
              userProfile.metamask = state.metamask
            
            if(state.userName)
              userProfile.userName = state.userName

            let isExists = await db.collection("users")
              .doc(user.email)
              .get()            
            isExists = isExists.exists;

            if (isExists) {
              await db.collection('users').doc(user.email).update(userProfile)
              commit("SET_USER", user.providerData[0]);
            } else {
              await db.collection('users').doc(user.email).set(userProfile)
              commit("SET_USER", user.providerData[0]);
            }

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
          }).
          catch((error)=>{
            console.log(`Error: ${error}`)
          })
        }
      },
      updateUserName({commit, state}, userName){
        commit("SET_USERNAME",userName);
        if(state.user){
          db
          .collection('users')
          .doc(state.user.email)
          .update({userName: state.userName})
          .then((data) => {
            console.log(data)
          }).
          catch((error)=>{
            console.log(`Error: ${error}`)
          })
        }
      },
    }
};

export default auth
