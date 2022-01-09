<template>
  <v-container>
    <v-row v-if="!submitted">
      <v-col>
        <v-text-field name="title" label="Title" id="title" v-model="tutorial.title"></v-text-field>
        <v-text-field name="description" label="Description" id="description" v-model="tutorial.description"></v-text-field>
        <v-btn color="success" @click="saveQuestion">Add</v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-btn color="success" @click="newTutorial">Add</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import QuestionDataService from "../../services/QuestionDataService";
export default {
  name: "add-questions",
  data() {
    return {
      tutorial: {
        title: "",
        description: ""
      },
      submitted: false,
    };
  },
  methods: {
    saveQuestion() {
      var data = {
        title: this.tutorial.title,
        description: this.tutorial.description,
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

    newTutorial() {
      this.submitted = false;
      this.tutorial = {
        title: "",
        description: "",
        published: false,
      };
    },
  },
};
</script>
