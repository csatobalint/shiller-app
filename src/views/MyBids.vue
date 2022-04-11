<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5 align-center">
          <v-col class="text-h4">My questions</v-col>
          <v-col class="text-right">
            <!-- <v-btn
              class="mr-2"
              fab
              outlined
              color="primary"
              @click="updateMyBids()"
            >
              <v-icon dark> mdi-refresh </v-icon>
            </v-btn> -->
            <v-form v-model="isFormValid">
            <v-dialog v-model="dialog" persistent max-width="800px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class=""
                  fab
                  outlined
                  color="primary"
                  dark
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </template>
              <v-card :disabled="isLoading">
                <v-card-title>
                  <span class="text-h5 py-5">New question</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" class="d-flex flex-row">
                        <v-text-field
                          name="to_address"
                          label="To (public address)"
                          id="to_address"
                          v-model="question.toAddress"
                          :rules="[rules.required, rules.isValidHex]"
                          outlined
                        ></v-text-field>
                        <v-autocomplete
                          v-show="isSearchByUsername"
                          class="ml-2"
                          name="to_username"
                          label="Username"
                          id="to_username"
                          outlined
                          :items="Object.keys(userMetamaskDict)"
                          v-model="question.toUser"
                          @change="
                            autoFillToAddress();
                            isSearchByUsername = !isSearchByUsername;
                          "
                        ></v-autocomplete>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              v-bind="attrs"
                              v-on="on"
                              class="mx-2"
                              fab
                              dark
                              outlined
                              color="primary"
                              label="asd"
                              @click="isSearchByUsername = !isSearchByUsername"
                            >
                              <v-icon dark> mdi-account-search </v-icon>
                            </v-btn>
                          </template>
                          <span>Search by username</span>
                        </v-tooltip>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          name="text"
                          label="Question"
                          v-model="question.text"
                          :rules="[rules.required]"
                          outlined
                        ></v-textarea>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          name="bid"
                          label="Bid amount"
                          id="bid"
                          v-model="question.bid"
                          :rules="[rules.required, rules.positiveNumber]"
                          :hint="
                            `Total question price is ` +
                            Number(this.question.bid * 1.01).toFixed(16) +
                            ' ETH including an extra fee of 1%.'
                          "
                          persistent-hint
                          outlined
                          @keypress="NumbersOnly"
                          suffix="ETH"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <!-- <v-text-field
                          name="time_limit"
                          label="Time limit"
                          id="time_limit"
                          v-model="question.timeLimit"
                          @keypress="NumbersOnly"
                          outlined
                          suffix="s"
                        ></v-text-field> -->
                        <v-select
                          v-model="question.timeLimit"
                          :hint="
                            question.timeLimit.value == 0
                              ? 'Your question will be answerable anytime unless withdrawn'
                              : 'Your question will be answerable for ' +
                                question.timeLimit.name
                          "
                          :items="timeLimitItems"
                          item-text="name"
                          item-value="value"
                          label="Time limit"
                          persistent-hint
                          return-object
                          outlined
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions class="pb-5">
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary darken-1"
                    outlined
                    @click="dialog = false"
                  >
                    Close
                  </v-btn>
                  <v-btn
                    color="primary darken-1"
                    outlined
                    @click="resetForm"
                  >
                    Reset
                  </v-btn>
                  <v-btn color="primary darken-1" outlined :disabled="!isMetaMaskAuthenticated || !isFormValid" @click="makeNew" >
                    Send
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            </v-form >
          </v-col>
        </v-row>
        <Tab
          :tab-items="[
            { tab: 'Answered' },
            { tab: 'Pending' },
            { tab: 'Expired' },
            { tab: 'All' },
          ]"
        ></Tab>
        <template v-if="!isLoading">
          <template v-for="(item, index) in sortedBids">
            <v-row :key="index" class="pb-5">
              <v-card
                class="rounded-xl pa-2"
                :class="[item[BID.answered] ? 'answerQuestionBackground' : '']"
                width="100%"
              >
                <v-card-subtitle class="pl-5 d-flex justify-space-between">
                  <div>
                    <span class="pr-2">Question #{{item[BID.questionId]}}</span>
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                          small
                          v-bind="attrs"
                          v-on="on"
                          @click="copyAddress('question' + item[BID.questionId])"
                          >
                          To: {{shortAddress(item[BID.beneficiaryAddress])}}
                        </v-chip>
                      </template>
                      <v-icon>mdi-content-copy</v-icon>
                      <span>{{ item[BID.beneficiaryAddress] }} </span>
                    </v-tooltip>
                    &nbsp;
                    <a 
                      v-if="Object.keys(userMetamaskDict).find(key => userMetamaskDict[key] === item[BID.beneficiaryAddress])" 
                      style="text-decoration: none;" 
                      href="https://twitter.com/_BalintCsato" 
                      target="_blank"
                    >
                      @{{Object.keys(userMetamaskDict).find(key => userMetamaskDict[key] === item[BID.beneficiaryAddress])}}
                    </a>
                    <input
                      v-on:focus="$event.target.select()"
                      :ref="'question' + item[BID.questionId]"
                      readonly
                      type="hidden"
                      :value="item[BID.beneficiaryAddress]"
                    />
                  </div>
                  <span>
                    {{ item[BID.timestamp] | hexToDate }}
                  </span>
                </v-card-subtitle>
                <v-card-text>
                  <v-card
                    :style="questionAnswerCardBackgroundColor"
                    class="rounded-lg mb-2"
                    outlined
                    width="100%"
                  >
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col>{{ item[BID.messages][0] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <span v-if="item[BID.answered]" class="my-4">
                    Answer
                  </span>
                  <v-card
                    :style="questionAnswerCardBackgroundColor"
                    class="rounded-lg"
                    outlined
                    width="100%"
                    v-if="item[BID.answered]"
                  >
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> {{ item[BID.messages][2] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-card-text>
                <v-divider class="mx-4"></v-divider>
                <v-card-title class="text-body-1">
                  <v-row>
                    <v-col cols="2" bidDetails class="text-left"
                      >{{ parseInt(item[BID.value]) / 1e18 }} ETH
                    </v-col>
                    <v-col expireDetails class="text-body-2 text-right">
                      <template
                        v-if="
                          !item[BID.answered] &&
                          !item[BID.withdrawn] &&
                          item[BID.deltaBlockNumber] != 0
                        "
                      >
                        <span v-if="expiriesInSeconds(item) > 0">
                          Expires in
                          {{ countdown(item) }} at
                          {{ expiryTimeStamp(item) }}
                        </span>
                        <span v-else>
                          Expired at {{ expiryTimeStamp(item) }}
                        </span>
                        <v-tooltip right>
                          <template v-slot:activator="{ on, attrs }">
                            <span small v-bind="attrs" v-on="on">
                              <v-icon>mdi-information-outline</v-icon>
                            </span>
                          </template>
                          <span>
                            <template v-if="expiriesInSeconds(item) > 0">
                              Expires
                            </template>
                            <template v-else> Expired </template>
                            at blocknumber: {{ expiryBlockTime(item) }}
                          </span>
                          <br />
                          <span>Current chain blocknumber: {{ BlockNumber }}
                          </span>
                        </v-tooltip>
                      </template>
                      &nbsp;
                      <template
                        v-if="!item[BID.answered] && !item[BID.withdrawn]"
                      >
                        <v-btn
                          :disabled="expiriesInSeconds(item) > 0"
                          outlined
                          small
                          @click="withdrawExpiredBid(item[BID.questionId])"
                          >Withdraw
                        </v-btn>
                      </template>
                    </v-col>
                  </v-row>
                </v-card-title>
              </v-card>
            </v-row>
          </template>
        </template>
        <template v-else>
          <v-row>
            <v-col class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </v-col>
          </v-row>
        </template>
        <div v-if="sortedBids.length == 0 && !isLoading">
          <v-card class="rounded-xl mt-5 pa-2 darken-1" outlined width="100%">
            <v-card-subtitle v-if="!isMetaMaskAuthenticated">You have to authenticate with your wallet to see your questions.</v-card-subtitle>
            <v-card-subtitle v-else>
              <span v-if="$store.state.bids.tabFilter == 'Pending'">
                You do not have any {{$store.state.bids.tabFilter}} questions.
              </span>
              <span v-else-if="$store.state.bids.tabFilter == 'Answered'">
                You do not have any {{$store.state.bids.tabFilter}} questions.
              </span>
              <span v-else-if="$store.state.bids.tabFilter == 'Expired'">
                You do not have any {{$store.state.bids.tabFilter}} questions.
              </span>
              <span v-else>
                No questions have been made with this address.
              </span>
            </v-card-subtitle>
          </v-card>
        </div>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import bidMixin from "./bidMixin";
import Tab from "./components/Tab.vue";

export default {
  components: {
    Tab,
  },
  mixins: [bidMixin],
  data() {
    return {
      dialog: false,
      isSearchByUsername: false,
      question: {
        toAddress: "",
        bid: null,
        text: "",
        timeLimit: { name: "No Limit", value: 0 },
      },
      timeLimitItems: [
        { name: "No Limit", value: 0 },
        { name: "1 hour", value: 3600 },
        { name: "3 hours", value: 10800 },
        { name: "6 hours", value: 21600 },
        { name: "12 hours", value: 43200 },
        { name: "1 day", value: 24 * 3600 },
        { name: "3 days", value: 72 * 3600 },
        { name: "1 week", value: 168 * 3600 },
      ],
      isFormValid: false
    };
  },
  computed: {
    ...mapGetters({
      filteredBids: "bids/filteredMyBids",
      userMetamaskDict: "getUserMetamaskDictionary",
    }),
    toMetamaskAuto() {
      if (this.userMetamaskDict[this.question.toUser]) {
        return this.userMetamaskDict[this.question.toUser];
      } else {
        return "";
      }
    },
  },
  methods: {
    autoFillToAddress() {
      this.question.toAddress = this.toMetamaskAuto;
    },
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) {
      this.$store.commit("bids/SET_TAB_FILTER", "Answered");
      this.updateMyBids();
      this.$store.dispatch("bindUsers");
    } else {
      this.$router.push('/')
      this.endLoading();
    }
  },
};
</script>
