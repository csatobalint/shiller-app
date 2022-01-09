<template>
  <v-container>

    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="tutorials"
          :items-per-page="5"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn color="error" @click="removeAllTutorials">Delete All</v-btn>
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
      tutorials: [],
      currentTutorial: null,
      currentIndex: -1,
      headers: [
        {
          text: "Title",
          align: "start",
          sortable: false,
          value: "title",
        },
        { text: "Description", value: "description" },
      ],
    };
  },
  methods: {
    onDataChange(items) {
      let _tutorials = [];

      items.forEach((item) => {
        let key = item.key;
        let data = item.val();
        _tutorials.push({
          key: key,
          title: data.title,
          description: data.description,
          published: data.published,
        });
      });

      this.tutorials = _tutorials;
    },

    refreshList() {
      this.currentTutorial = null;
      this.currentIndex = -1;
    },

    setActiveTutorial(tutorial, index) {
      this.currentTutorial = tutorial;
      this.currentIndex = index;
    },

    removeAllTutorials() {
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
