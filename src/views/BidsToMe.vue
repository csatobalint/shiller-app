<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5 align-center">
          <v-col class="text-h4">Questions sent to me</v-col>
          <v-col class="text-right">
            <!-- <v-btn
              class="mr-2"
              fab
              outlined
              color="primary"
              @click="updateBidsToMe()"
            >
              <v-icon dark> mdi-refresh </v-icon>
            </v-btn> -->
          </v-col>
        </v-row>
        <Tab
          :tab-items="[
            { tab: 'Pending' },
            { tab: 'Answered' },
            { tab: 'Expired' },
            { tab: 'All' },
          ]"
        ></Tab>
        <template v-if="!isLoading">
          <template v-for="(item, index) in sortedBids">
            <template v-if="!item[BID.withdrawn]">
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
                            v-bind="attrs"
                            v-on="on"
                            small
                            @click="copyAddress('question' + item[BID.questionId])"
                          >
                            From: {{ shortAddress(item[BID.ownerAddress]) }}
                          </v-chip>
                        </template>
                        <v-icon>mdi-content-copy</v-icon>
                        <span>{{ item[BID.ownerAddress] }} </span>
                      </v-tooltip>
                      <input
                        v-on:focus="$event.target.select()"
                        :ref="'question' + item[BID.questionId]"
                        readonly
                        type="hidden"
                        :value="item[BID.ownerAddress]"
                      />
                    </div>
                    <span>
                      {{ item[BID.timestamp] | hexToDate }} #{{item[BID.questionId]}}
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
                          <v-col> {{ item[BID.messages][1] }} </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>

                    <div 
                      class="my-4 d-flex justify-space-between align-center"
                    >
                      <span
                        v-show="!item[BID.withdrawn] && (item[BID.answered] || isNotExpired(item))"
                      >
                        Answer
                      </span>
                      <v-btn
                        v-if="
                          !item[BID.answered] &&
                          !item[BID.withdrawn] &&
                          isNotExpired(item)
                        "
                        color="secondary"
                        outlined
                        small
                        @click="reward(item)"
                        >
                        Send
                      </v-btn>
                    </div>
                    <v-card
                      :style="questionAnswerCardBackgroundColor"
                      class="rounded-lg"
                      outlined
                      width="100%"
                      v-if="item[BID.answered]"
                    >
                      <v-card-text class="text-body-1">
                        <v-row>
                          <v-col> {{ item[BID.messages][3] }} </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                    <v-card
                      :style="questionAnswerCardBackgroundColor"
                      class="rounded-lg"
                      outlined
                      width="100%"
                      v-show="
                        !item[BID.answered] &&
                        !item[BID.withdrawn] &&
                        isNotExpired(item)
                      "
                      v-else
                    >
                      <v-card-text class="text-body-1">
                        <v-row>
                          <v-col>
                            <v-textarea
                              :disabled="
                                !(
                                  !item[BID.answered] &&
                                  !item[BID.withdrawn] &&
                                  isNotExpired(item)
                                )
                              "
                              name="answer"
                              label=""
                              v-model="answers[item[BID.questionId]]"
                            ></v-textarea>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-card-text>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-title class="text-body-1">
                    <v-row>
                      <v-col cols="2" class="text-left"
                        >{{ parseInt(item[BID.sum]) / 1e18 }} ETH
                      </v-col>
                      <v-col class="text-body-2 text-right">
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
                      </v-col>
                    </v-row>
                  </v-card-title>
                </v-card>
              </v-row>
            </template>
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
import mixinBids from "./bidMixin";
import Tab from "./components/Tab.vue";

export default {
  components: {
    Tab,
  },
  mixins: [mixinBids],
  data() {
    return {
      answers: {},
    };
  },
  methods: {
    reward(item) {
      if (this.answers[item[this.BID.questionId]] === (undefined || ""))
        this.openNotificationSnackbar("You cannot send an empty answer.");
      else
        this.rewardSolvedBid(
          item[this.BID.questionId],
          this.answers[item[this.BID.questionId]],
          item[this.BID.ownerAddress]
        );
    },
  },
  computed: {
    ...mapGetters({
      filteredBids: "bids/filteredBidsToMe",
    }),
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) {
      this.$store.commit("bids/SET_TAB_FILTER", "Pending");
      this.updateBidsToMe();
    } else {
      this.endLoading();
    }
  },
};
</script>
