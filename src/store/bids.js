console.log("bids.js")

const bids = {
	namespaced: true,

    state: {
        BID:{
            answered: 0,
            withdrawn: 1,
            timestamp: 2,
            deadline: 3,
            value: 4,
            sum: 5,
            ownerAddress: 6,
            beneficiaryAddress: 7,
            messages: 8,
            questionId: 9
        },
        myBids: [],
        bidsToMe: [],
        sortBy: "Date",
        sortDirection: "desc",
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
        filteredBidsToMe(state){
            if(state.tabFilter == 'Answered'){
                return state.bidsToMe.filter(item => item[0] && !item[1])
            }
            else if (state.tabFilter == 'Pending'){
                return state.bidsToMe.filter(item => !item[0]  && !item[1])
            }
            else{
                return state.bidsToMe.filter(item => !item[1])
            }
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
      SET_SORT_BY(state, data) {
        state.sortBy = data;
      },
      SET_SORT_DIRECTION(state, data) {
        state.sortDirection = data;
      }
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
        },
        updateSortBy({commit},data){
            commit('SET_SORT_BY',data);
        },
        updateSortDirection({commit},data){
            commit('SET_SORT_DIRECTION',data);
        }
    }
};

export default bids
