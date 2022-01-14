import Vue from 'vue'
import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from 'vuexfire'
import { db } from './firebase'
console.log('store/index.js')

Vue.use(Vuex)

import auth from "./auth.js";

export default new Vuex.Store({
  state: {
    questions: [],
    users: [],
  },
  getters: {
    getUserMetamaskDictionary: state => {
      const key = "userName"
      const value = "metamask"
      const initialValue = {};
      return state.users.reduce((acc, item) => {
        acc[item[key]] = item[value]
        return acc
      }, initialValue);
    },
    getShortQuestions: state => {
      let data = JSON.parse ( JSON.stringify ( state.questions) )
      data.map((value) => {
        value.description = value.description.slice(0,6) + '...'
        value.fromAddress = value.fromAddress.slice(0,6) + '...'
        value.toAddress = value.toAddress.slice(0,6) + '...'
        return value
      });
      return data
    }
  },
  mutations: {
    ...vuexfireMutations,
  },
  actions: {
    bindQuestions: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('questions', db.collection('questions'))
    }),
    addQuestion: firestoreAction((context, payload) => {
        return db.collection('questions').add(payload)
    }),
    deleteQuestion: firestoreAction((context, payload) => {
        db.collection('questions')
            .doc(payload)
            .delete()
    }),
    updateQuestion: firestoreAction((context, payload) => {
        db.collection('questions')
            .doc(payload.id)
            .set(payload)
    }),
    deleteAllQuestion() {
        db.collection("questions")
        .get()
        .then(res => {
          res.forEach(element => {
            element.ref.delete();
          });
        });
    },
    bindUsers: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('users', db.collection('users'))
    }),
    addUser: firestoreAction((context, payload) => {
        return db.collection('users').add(payload)
    }),
    deleteUser: firestoreAction((context, payload) => {
        db.collection('users')
            .doc(payload)
            .delete()
    }),
    updateUser: firestoreAction((context, payload) => {
        db.collection('users')
            .doc(payload.id)
            .set(payload)
    }),
  },
  modules: {
    auth
  }
})
