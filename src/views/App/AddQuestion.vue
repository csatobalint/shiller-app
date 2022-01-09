<template>
  <v-container>
    <v-row v-if="!submitted">
      <v-col>
        <v-text-field name="title" label="Title" id="title" v-model="question.title"></v-text-field>
        <v-text-field name="description" label="Description" id="description" v-model="question.description"></v-text-field>
        <v-btn color="success" @click="saveQuestion">Add</v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-btn color="success" @click="newQuestion">Add</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

import QuestionDataService from "../../services/QuestionDataService";
export default {
  name: "add-questions",
  data() {
    return {
      question: {
        title: "",
        description: ""
      },
      submitted: false,
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
    }),
  },
  methods: {
    saveQuestion() {
      var data = {
        title: this.question.title,
        description: this.question.description,
        email: this.user.email
      };

      QuestionDataService.create(data)
        .then(() => {
          console.log("Created new item successfully!");
          this.submitted = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    newQuestion() {
      this.submitted = false;
      this.question = {
        title: "",
        description: "",
      };
    },
  },
};
</script>
