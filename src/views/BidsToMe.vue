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
                <v-card-subtitle class="pl-5">
                  {{ item[BID.timestamp] | hexToDate }}
                </v-card-subtitle>
                <v-card-text>
                  <span>Question</span>
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
                  <span
                    v-show="
                      !item[BID.withdrawn] &&
                      ((item[BID.deadline] != 0 &&
                        countdown(item[BID.timestamp], item[BID.deadline]) >
                          0) ||
                        item[BID.deadline] == 0)
                    "
                  >
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
                    <v-col>
                      <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                          <v-chip
                            v-bind="attrs"
                            v-on="on"
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
                    </v-col>
                    <v-col class="text-right"
                      >{{ parseInt(item[BID.sum]) / 1e18 }} ETH
                    </v-col>
                  </v-row>
                </v-card-title>

                <v-card-actions class="pl-5">
                  <v-row>
                    <v-col
                      cols=""
                      v-if="
                        !item[BID.answered] &&
                        !item[BID.withdrawn] &&
                        item[BID.deadline] != 0
                      "
                      class="text-body-2"
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
                    <v-col cols="" class="text-right">
                      <v-btn
                        v-if="
                          !item[BID.answered] &&
                          !item[BID.withdrawn] &&
                          ((item[BID.deadline] != 0 &&
                            countdown(item[BID.timestamp], item[BID.deadline]) >
                              0) ||
                            item[BID.deadline] == 0)
                        "
                        color="seondary"
                        outlined
                        @click="
                          rewardSolvedBid(
                            item[BID.questionId],
                            answers[item[BID.questionId]],
                            item[BID.ownerAddress]
                          )
                        "
                        >Send Answer</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-row>
          </template>
        </template>
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
  computed: {
    ...mapGetters({
      filteredBids: "bids/filteredBidsToMe",
    }),
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) {
      this.$store.commit("bids/SET_TAB_FILTER", "Pending");
      this.updateBidsToMe();
    }
  },
};
</script>
