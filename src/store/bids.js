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
            questionId: 9,
            questionForOwner: 0,
            questionForBenificiary: 1,
            answerForOwner: 2,
            answerForBenificiary: 3
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
                return state.myBids.filter(item => item[state.BID.answered] && !item[state.BID.withdrawn])
            }
            else if (state.tabFilter == 'Expired'){
                return state.myBids.filter(item => 
                    !item[state.BID.answered]  // not answered
                    && !item[state.BID.withdrawn]  // not withdrawn
                    && item[state.BID.deadline] != 0 // not zero timelimit set
                    && ((Number(item[state.BID.timestamp]) + Number(item[state.BID.deadline])) < Date.now()/1000) //time > deadline
                )
            }
            else if (state.tabFilter == 'Pending'){
                return state.myBids.filter(item => 
                    !item[state.BID.answered]  // not answered
                    && !item[state.BID.withdrawn]  // not withdrawn
                    && (
                        item[state.BID.deadline] == 0 // zero timelimit set
                        || 
                        ((Number(item[state.BID.timestamp]) + Number(item[state.BID.deadline])) >= Date.now()/1000) //time < deadline
                    ) 
                )
            }
            else{
                return state.myBids.filter(item => !item[state.BID.withdrawn])
            }
        },
        filteredBidsToMe(state){
            if(state.tabFilter == 'Answered'){
                return state.bidsToMe.filter(item => item[state.BID.answered] && !item[state.BID.withdrawn])
            }
            else if (state.tabFilter == 'Expired'){
                return state.bidsToMe.filter(item => 
                    !item[state.BID.answered]  // not answered
                    && !item[state.BID.withdrawn]  // not withdrawn
                    && item[state.BID.deadline] != 0 // not zero timelimit set
                    && ((Number(item[state.BID.timestamp]) + Number(item[state.BID.deadline])) < Date.now()/1000) //time > deadline
                )
            }
            else if (state.tabFilter == 'Pending'){
                return state.bidsToMe.filter(item => 
                    !item[state.BID.answered]  // not answered
                    && !item[state.BID.withdrawn]  // not withdrawn
                    && (
                        item[state.BID.deadline] == 0 // zero timelimit set
                        || 
                        ((Number(item[state.BID.timestamp]) + Number(item[state.BID.deadline])) >= Date.now()/1000) //time < deadline
                    ) 
                )
            }
            else{
                return state.bidsToMe.filter(item => !item[state.BID.withdrawn])
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
            //commit('SET_TAB_FILTER','Answered');
            commit('SET_MY_BIDS',data);
        },
        updateBidsToMe({commit},data){
            //commit('SET_TAB_FILTER','Pending');
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
