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
              <v-btn color="blue darken-1" text @click="submitQuestion">
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
                 - id: {{question.id}}
              </div>
              <p class="text-h4 text--primary">{{ question.title }}</p>
              <p>{{ question.bid }} ETC</p>
              <div class="text--primary">
                {{ question.description }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="green accent-4" @click="contractOnReward(question.id)"> Reward </v-btn>
              <v-btn
                text
                color="red accent-4"
                @click="deleteQuestion(question.id)"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ethereum } = window;
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
      shortQuestions: "getShortQuestions",
      questions: "getQuestions",
    }),
    ...mapState({
      fromAddressAuto: (state) => state.auth.metamask,
    }),
    fromUserAuto() {
      return this.isAuthenticated ? this.userName : "";
    },
    toMetamaskAuto() {
      if (this.userMetamaskDict[this.question.toUser]) {
        return this.userMetamaskDict[this.question.toUser];
      } else {
        return "";
      }
    },
  },
  methods: {
    async submitQuestion() {
      // read automatic user from store (if authenticated)
      this.question.fromUser = this.fromUserAuto;
      // read the metamask address automatically if authenticated
      if (this.fromAddressAuto)
        this.question.fromAddress = this.fromAddressAuto;
      // push question to the database
      const question = await this.$store.dispatch("addQuestion", this.question);
      //call metamatask make new contract function
      this.contractMakeNew(question.id);
      //reset the state of the form
      this.dialog = false;
      // this.question = {
      //   title: "",
      //   description: "",
      //   bid: "",
      //   fromUser: "",
      //   toUser: "",
      //   fromAddress: "",
      //   toAddress: "",
      // };
    },
    ...mapActions({
      deleteAllQuestion: "deleteAllQuestion",
      deleteQuestion: "deleteQuestion",
    }),
    autoFillToAddress() {
      this.question.toAddress = this.toMetamaskAuto;
    },
    async contractMakeNew() {
      const txData =
        "0x9f771369" +
        this.paddedStr(this.question.toAddress.toLowerCase(), 64) +
        this.paddedHex(12, 64); // methodhash (8 hex digits) + address of solver of the question + question id  (64 hex digits/argument)
      console.log(txData);
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(this.question.id)
      const txParams = {
        to: process.env.VUE_APP_CONTRACT_ADDRESS,
        from: accounts[0],
        value: "0x" + Math.round(this.question.bid * 1e18).toString(16),
        data: txData,
        gas: "0x" + Number(250000).toString(16),
        gasPrice: "0x" + Number(5000000000).toString(16),
        chainId: "0x2a",
      };
      console.log(txParams);

      try {
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });
        console.log(txHash);
      } catch (error) {
        console.error(error);
      }
    },
    async contractOnReward() {
      const accounts = await ethereum.request({ method: "eth_accounts" });

      const txParams = {
        to: process.env.VUE_APP_CONTRACT_ADDRESS,
        from: accounts[0],
        data: "0x12d29ac5"
      };
      console.log(txParams);
      try {
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });
        console.log(txHash);
      } catch (error) {
        console.error(error);
      }
    },
    paddedHex(d, padding) {
      var hex = Number(d).toString(16);
      while (hex.length < padding) {
        hex = "0" + hex;
      }
      return hex;
    },
    paddedStr(str, padding) {
      var hex = str.slice(2);
      while (hex.length < padding) {
        hex = "0" + hex;
      }
      return hex;
    },
  },
  created() {
    this.$store.dispatch("bindQuestions");
    this.$store.dispatch("bindUsers");
  },
};
</script>

<style lang="scss" scoped></style>
