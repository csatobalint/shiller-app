<template>
  <v-container>
    <v-row justify="center">
      <v-btn color="error" dark @click="deleteAllQuestion"> Delete All </v-btn>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            New question
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="text-h5">New question</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    name="title"
                    label="Title*"
                    id="title"
                    v-model="question.title"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    name="description"
                    label="Description*"
                    v-model="question.description"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    name="bid"
                    label="Bid amount (ETC)*"
                    id="bid"
                    v-model="question.bid"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    name="from_account"
                    label="My account"
                    id="from_account"
                    :value="userEmail"
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    name="from_address"
                    label="My address*"
                    id="from_address"
                    v-model="metamask"
                    :disabled="metamask !== null"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    name="to_account"
                    label="Influencer account"
                    id="to_account"
                    :items="['User1', 'User2', 'User3']"
                    v-model="question.toUser"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    name="to_address"
                    label="Influencer address*"
                    id="to_address"
                    v-model="question.toAddress"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">
              Close
            </v-btn>
            <v-btn color="blue darken-1" text @click="createNewQuestion">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
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
  </v-container>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      dialog: false,
      headers: [
        {
          text: "Title",
          align: "start",
          sortable: false,
          value: "title",
        },
        { text: "Bid (ETH)", value: "bid" },
        { text: "Description", value: "description" },
        { text: "fromUser", value: "fromUser" },
        { text: "fromAddress", value: "fromAddress" },
        { text: "toUser", value: "toUser" },
        { text: "toAddress", value: "toAddress" },
      ],
      question: {
        title: "",
        description: "",
        bid: "",
        fromUser: "",
        toUser: "",
        fromAddress: "",
        toAddress: "",
      },
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
    }),
    ...mapState({
      metamask: (state) => state.auth.metamask,
    }),
    userEmail() {
      if (this.user) return this.user.email;
      else return "";
    },
    userMetamask() {
      return this.question.fromAddress;
    },
    questions() {
      return this.$store.state.questions;
    },
  },
  methods: {
    createNewQuestion() {
      let data = { ...this.question };
      data.fromUser = this.userEmail;
      data.fromAddress = this.metamask;
      this.$store.dispatch("addQuestion", data);
      this.dialog = false;
    },
    ...mapActions({
      deleteAllQuestion: "deleteAllQuestion",
    }),
  },
  created() {
    this.$store.dispatch("bindQuestions");
  },
};
</script>

<style lang="scss" scoped></style>
