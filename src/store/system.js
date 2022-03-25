console.log("system.js")

const system = {
	namespaced: true,

    state: {
        isLoading: false,
        isNotificationDialog: false,
        isNotificationDialogText: "Notification dialog",
        isNotificationDialogTitle: "No notifications...",
        isNotificationSnackbar: false,
        isNotificationSnackbarText: "kkk",
    },

    getters: {
        isLoading: state => state.isLoading,
        isNotificationDialog: state => state.isNotificationDialog,
        isNotificationDialogTitle: state => state.isNotificationDialogTitle,
        isNotificationDialogText: state => state.isNotificationDialogText,
        isNotificationSnackbar: state => state.isNotificationSnackbar,
        isNotificationSnackbarText: state => state.isNotificationSnackbarText,
    },
    mutations: {
        SET_IS_LOADING(state,payload){
            state.isLoading = payload
        },
        SET_NOTIFICATION_DIALOG(state,payload){
          state.isNotificationDialog = true
          state.isNotificationDialogText = payload.text
          state.isNotificationDialogTitle = payload.title
        },
        CLEAR_NOTIFICATION_DIALOG(state){
          state.isNotificationDialog = false
          state.isNotificationDialogText = "Notification dialog"
          state.isNotificationDialogTitle = "No notifications..."
        },
        SET_NOTIFICATION_SNACKBAR(state,payload){
          state.isNotificationSnackbar = true
          state.isNotificationSnackbarText = payload
        },
        CLEAR_NOTIFICATION_SNACKBAR(state){
          state.isNotificationSnackbar = false
          state.isNotificationSnackbarText = "Notification snackbar"
        }
    },
    actions: {
        startLoading({commit}){
            commit('SET_IS_LOADING',true)
        },
        endLoading({commit}){
          commit('SET_IS_LOADING',false)
        },
        openNotificationDialog({commit},payload){
          commit('SET_NOTIFICATION_DIALOG',payload)
        },
        closeNotificationDialog({commit}){
          commit('CLEAR_NOTIFICATION_DIALOG')
        },
        openNotificationSnackbar({commit},payload){
          commit('SET_NOTIFICATION_SNACKBAR',payload)
          setTimeout(() => commit('CLEAR_NOTIFICATION_SNACKBAR'), 5000)
        },
        closeNotificationSnackbar({commit}){
          commit('CLEAR_NOTIFICATION_SNACKBAR')
        },
    }
};

export default system
