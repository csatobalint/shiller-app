<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5 align-center">
          <v-col class="text-h4">Questions sent to me</v-col>
          <v-col class="text-right">
            <v-btn
              class="mr-2"
              fab
              outlined
              color="primary"
              @click="updateBidsToMe()"
            >
              <v-icon dark> mdi-refresh </v-icon>
            </v-btn>
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
                          @click="
                            copyAddress('question' + item[BID.questionId])
                          "
                          >From:
                          {{ shortAddress(item[BID.ownerAddress]) }}</v-chip
                        >
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
                  {{ item[BID.timestamp] | hexToDate }}
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

                  <div class="d-flex justify-space-between align-center">
                    <div
                      v-show="
                        !item[BID.withdrawn] &&
                        ((item[BID.deadline] != 0 &&
                          countdown(item[BID.timestamp], item[BID.deadline]) >
                            0) ||
                          item[BID.deadline] == 0)
                      "
                      class="my-4"
                    >
                      Answer
                    </div>
                    <v-btn
                      v-if="
                        !item[BID.answered] &&
                        !item[BID.withdrawn] &&
                        ((item[BID.deadline] != 0 &&
                          countdown(item[BID.timestamp], item[BID.deadline]) >
                            0) ||
                          item[BID.deadline] == 0)
                      "
                      color="secondary"
                      outlined
                      small
                      @click="reward(item)"
                      >Send</v-btn
                    >
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
                      ((item[BID.deadline] != 0 &&
                        countdown(item[BID.timestamp], item[BID.deadline]) >
                          0) ||
                        item[BID.deadline] == 0)
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
                                ((item[BID.deadline] != 0 &&
                                  countdown(
                                    item[BID.timestamp],
                                    item[BID.deadline]
                                  ) > 0) ||
                                  item[BID.deadline] == 0)
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
                    <v-col class="text-left"
                      >{{ parseInt(item[BID.sum]) / 1e18 }} ETH
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
                  </v-row>
                </v-card-title>
              </v-card>
            </v-row>
          </template>
        </template>
        <div v-if="sortedBids.length == 0">
          <v-card
            class="rounded-xl mt-5 pa-2 darken-1"
            outlined
            width="100%"
          >
            <v-card-subtitle
              >No questions have been found.</v-card-subtitle
            >
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

      if(this.answers[item[this.BID.questionId]] === undefined || this.answers[item[this.BID.questionId]] === '')
        this.openNotificationSnackbar('You cannot send an empty answer.')
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
    }else{
      this.endLoading()
    }
  },
};
</script>
