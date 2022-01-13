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
    deleteAllQuestion() {
        db.collection("questions")
        .get()
        .then(res => {
          res.forEach(element => {
            element.ref.delete();
          });
        });
    },
    updateQuestion: firestoreAction((context, payload) => {
        db.collection('questions')
            .doc(payload.id)
            .set(payload)
    }),
  },
  modules: {
    auth
  }
})
