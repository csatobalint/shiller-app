<template>
  <v-container>
    <v-row>
      <v-col>
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
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      name="from_account"
                      label="My account"
                      id="from_account"
                      :value="fromUserAuto"
                      disabled
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      name="from_address"
                      label="My address*"
                      id="from_address"
                      v-model="fromAddressAuto"
                      :disabled="fromAddressAuto !== null"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      name="to_account"
                      label="Influencer account"
                      id="to_account"
                      :items="Object.keys(userMetamaskDict)"
                      v-model="question.toUser"
                      @change="autoFillToAddress()"
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
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="shortQuestions"
          :items-per-page="5"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>

    <v-row v-for="(question, index) in questions" :key="index">
      <v-col>
        <template>
          <v-card class="mx-auto">
            <v-card-text>
              <div>
                From
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <a v-bind="attrs" v-on="on">
                      {{ question.fromUser }}
                    </a>
                  </template>
                  <span>{{ question.fromAddress }}</span>
                </v-tooltip>
                To
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <a v-bind="attrs" v-on="on">
                      {{ question.toUser }}
                    </a>
                  </template>
                  <span>{{ question.toAddress }}</span>
                </v-tooltip>
              </div>
              <p class="text-h4 text--primary">{{ question.title }}</p>
              <p>{{ question.bid }} ETC</p>
              <div class="text--primary">
                {{ question.description }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="green accent-4"> Reward </v-btn>
              <v-btn text color="red accent-4" @click="deleteQuestion(question.id)"> Delete </v-btn>
            </v-card-actions>
          </v-card>
        </template>
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
      userName: "auth/userName",
      userMetamaskDict: "getUserMetamaskDictionary",
      shortQuestions: "getShortQuestions"
    }),
    ...mapState({
      fromAddressAuto: (state) => state.auth.metamask,
      questions: (state) => state.questions,
    }),
    fromUserAuto() {
      if (this.user) return this.userName;
      else return "";
    },
    toMetamaskAuto() {
      if (this.userMetamaskDict[this.question.toUser]) {
        return this.userMetamaskDict[this.question.toUser];
      } else {
        return "";
      }
    }
  },
  methods: {
    createNewQuestion() {
      let data = { ...this.question };
      data.fromUser = this.fromUserAuto;
      data.fromAddress = this.fromAddressAuto;
      this.$store.dispatch("addQuestion", data);
      this.dialog = false;
    },
    ...mapActions({
      deleteAllQuestion: "deleteAllQuestion",
    }),
    autoFillToAddress() {
      this.question.toAddress = this.toMetamaskAuto;
    },
    deleteQuestion(payload) {
      this.$store.dispatch("deleteQuestion", payload);
    },
  },
  created() {
    this.$store.dispatch("bindQuestions");
    this.$store.dispatch("bindUsers");
  },
};
</script>

<style lang="scss" scoped></style>
