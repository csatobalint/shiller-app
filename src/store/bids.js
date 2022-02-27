console.log("bids.js")

const bids = {
	namespaced: true,

    state: {
        myBids: [],
        bidsToMe: [],
        tabFilter: "",
    },

    getters: {
        myBids(state){
            return state.myBids
        },
        filteredMyBids(state){
            if(state.tabFilter == 'Answered'){
                return state.myBids.filter(item => item[0] && !item[1])
            }
            else if (state.tabFilter == 'Pending'){
                return state.myBids.filter(item => !item[0]  && !item[1])
            }
            else{
                return state.myBids.filter(item => !item[1])
            }
        },
        bidsToMe(state){
            return state.bidsToMe
        }
    },
    mutations: {
      SET_MY_BIDS(state, data) {
        state.myBids = data;
      },
      SET_BIDS_TO_ME(state, data) {
        state.bidsToMe = data;
      },
      SET_TAB_FILTER(state, data) {
        state.tabFilter = data;
      },
    },
    actions: {
        updateMyBids({commit},data){
            commit('SET_TAB_FILTER','Answered');
            commit('SET_MY_BIDS',data);
        },
        updateBidsToMe({commit},data){
            commit('SET_TAB_FILTER','Pending');
            commit('SET_BIDS_TO_ME',data);
        },
        updateTabFilter({commit},data){
            commit('SET_TAB_FILTER',data);
        }
    }
};

export default bids
