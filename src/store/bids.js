console.log("bids.js")

const bids = {
	namespaced: true,

    state: {
        myBids: [],
        bidsToMe: []
    },

    getters: {
      myBids(state){
          return state.myBids
      }
    },
    mutations: {
      SET_MY_BIDS(state, data) {
        state.myBids = data;
      },
      SET_BIDS_TO_ME(state, data) {
        state.bidsToMe = data;
      },
    },
    actions: {
        updateMyBids({commit},data){
            commit('SET_MY_BIDS',data);
        },
        updateBidsToMe({commit},data){
            commit('SET_BIDS_TO_ME',data);
        }
    }
};

export default bids
