<template>
  <v-container>

    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="questions"
          :items-per-page="5"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn color="error" @click="removeAllQuestions">Delete All</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import QuestionDataService from "../../services/QuestionDataService";

export default {
  name: "questions-list",
  data() {
    return {
      questions: [],
      currentQuestion: null,
      currentIndex: -1,
      headers: [
        {
          text: "Title",
          align: "start",
          sortable: false,
          value: "title",
        },
        { text: "Description", value: "description" }, 
        { text: "Email", value: "email" }, 
      ],
    };
  },
  methods: {
    onDataChange(items) {
      let _questions = [];

      items.forEach((item) => {
        let key = item.key;
        let data = item.val();
        _questions.push({
          key: key,
          title: data.title,
          description: data.description,
          email: data.email,
        });
      });

      this.questions = _questions;
    },

    refreshList() {
      this.currentQuestion = null;
      this.currentIndex = -1;
    },

    setActiveQuestion(question, index) {
      this.currentQuestion = question;
      this.currentIndex = index;
    },

    removeAllQuestions() {
      QuestionDataService.deleteAll()
        .then(() => {
          this.refreshList();
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    QuestionDataService.getAll().on("value", this.onDataChange);
  },
  beforeDestroy() {
    QuestionDataService.getAll().off("value", this.onDataChange);
  },
};
</script>
