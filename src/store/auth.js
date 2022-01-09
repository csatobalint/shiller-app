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
      }
    },
    actions: {
      fetchUser({ commit }, user) {
        commit("SET_LOGGED_IN", user !== null);

        if(user.providerData[0] !== null){
            commit("SET_USER", user.providerData[0]);
        }else {
            commit("SET_USER", null);
        }

      }
    }
};

export default auth
