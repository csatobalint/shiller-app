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
              <v-card>
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
                            `Fee of 1% will be added to the bid. Total value is ` +
                            this.question.bid * 1.01 +
                            ' ETH'
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
                  <v-btn color="primary darken-1" outlined @click="makeNew">
                    Send
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
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
        <template v-for="(item, index) in sortedBids">
          <template>
            <v-row :key="index" class="pb-5">
              <v-card
                class="rounded-xl pa-2"
                :class="[item[BID.answered] ? 'answerQuestionBackground' : '']"
                width="100%"
              >
                <v-card-subtitle class="pl-5 d-flex justify-space-between">
                  <div>
                    <span class="pr-2">Question</span>
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                          small
                          v-bind="attrs"
                          v-on="on"
                          @click="
                            copyAddress('question' + item[BID.questionId])
                          "
                          >To:
                          {{
                            shortAddress(item[BID.beneficiaryAddress])
                          }}</v-chip
                        >
                      </template>
                      <v-icon>mdi-content-copy</v-icon>
                      <span>{{ item[BID.beneficiaryAddress] }} </span>
                    </v-tooltip>
                    <input
                      v-on:focus="$event.target.select()"
                      :ref="'question' + item[BID.questionId]"
                      readonly
                      type="hidden"
                      :value="item[BID.beneficiaryAddress]"
                    />
                  </div>
                  <span>{{ item[BID.timestamp] | hexToDate }}</span>
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
                  <div v-if="item[BID.answered]" class="my-4">Answer</div>
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
                    <v-col class="text-left"
                      >{{ parseInt(item[BID.value]) / 1e18 }} ETH
                    </v-col>
                    <v-col
                      cols=""
                      v-if="
                        !item[BID.answered] &&
                        !item[BID.withdrawn] &&
                        item[BID.deadline] != 0
                      "
                      class="text-body-2 text-right"
                    >
                      <span
                        v-if="
                          countdown(item[BID.timestamp], item[BID.deadline]) > 0
                        "
                      >
                        Expires in
                        {{
                          formatCountdownTime(
                            countdown(item[BID.timestamp], item[BID.deadline])
                          )
                        }}
                        at
                        {{ dueStamp(item[BID.timestamp], item[BID.deadline]) }}
                      </span>
                      <span v-else>
                        Expired at
                        {{ dueStamp(item[BID.timestamp], item[BID.deadline]) }}
                      </span>
                    </v-col>
                    <v-col
                      v-if="
                        !item[BID.answered] &&
                        !item[BID.withdrawn] &&
                        item[BID.deadline] == 0
                      "
                      class="text-right"
                    >
                      <v-btn
                        :disabled="
                          isTimeLimitExpired(
                            item[BID.timestamp],
                            item[BID.deadline]
                          )
                        "
                        color="seondary"
                        outlined
                        small
                        @click="withdrawExpiredBid(item[BID.questionId])"
                        >Withdraw</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card-title>

                <v-card-actions class="pl-5">
                  <v-row> </v-row>
                </v-card-actions>
              </v-card>
            </v-row>
          </template>
        </template>
        <div v-if="sortedBids.length == 0">
          <v-card class="rounded-xl mt-5 pa-2 darken-1" outlined width="100%">
            <v-card-subtitle>No questions have been found.</v-card-subtitle>
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
        toAddress: "0x13c5DB04644f9cfE79C79bBB1a74aaB9A04C98ea",
        bid: 0,
        text: "randomstring_" + Math.random().toString().substr(2, 5),
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
      rules: {
        required: (value) => !!value || "Required",
        positiveNumber: (value) => value > 0 || "Must be greater than 0",
        isValidHex: (value) =>
          (value.length == 42 && !isNaN(parseInt(value, 16))) ||
          "This is not a valid address",
        counter: (value) => value.length <= 20 || "Max 20 characters",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
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
    NumbersOnly(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    autoFillToAddress() {
      this.question.toAddress = this.toMetamaskAuto;
    },
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) {
      this.$store.commit("bids/SET_TAB_FILTER", "Answered");
      this.updateMyBids();
      this.$store.dispatch("bindUsers");
    }
    else{
      this.endLoading()
    }
  },
};
</script>
