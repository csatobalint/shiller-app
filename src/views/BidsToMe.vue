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
          :tab-items="[{ tab: 'Pending' }, { tab: 'Answered' }, { tab: 'All' }]"
        ></Tab>
        <template v-for="(item, index) in sortedBids">
          <template v-if="!item[BID.withdrawn]">
            <v-row :key="index" class="pb-5">
              <v-card
                class="rounded-xl pa-2"
                :class="[item[BID.timestamp] ? 'answerQuestionBackground' : '']"
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
                        <v-col> Q: {{ item[BID.messages][1] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <span>Answer</span>
                  <v-card
                    :style="questionAnswerCardBackgroundColor"
                    class="rounded-lg"
                    outlined
                    width="100%"
                    v-if="item[BID.answered]"
                  >
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> A: {{ item[BID.messages][3] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <v-card
                    :style="questionAnswerCardBackgroundColor"
                    class="rounded-lg"
                    outlined
                    width="100%"
                    v-else
                  >
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col>
                          <v-textarea
                            name="answer"
                            label=""
                            v-model="answers[item[9]]"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-card-text>
                <v-divider class="mx-4"></v-divider>
                <v-card-title class="text-body-1">
                  <v-row>
                    <v-col
                      ><v-chip
                        >From:
                        {{ shortAddress(item[BID.ownerAddress]) }}</v-chip
                      ></v-col
                    >
                    <v-col class="text-right"
                      >{{ parseInt(item[BID.sum]) / 1e18 }} ETH
                    </v-col>
                  </v-row>
                </v-card-title>

                <v-card-actions class="pl-5">
                  <v-row>
                    <!-- <v-col cols="" v-if="!item[BID.timestamp]" class="text-body-2">
                      Expiries at: {{ dueDate(item[BID.value],item[BID.deadline]) }}
                    </v-col> -->
                    <v-col cols="" class="text-right">
                      <v-btn
                        v-if="!item[BID.withdrawn]"
                        color="seondary"
                        outlined
                        @click="
                          rewardSolvedBid(
                            item[9],
                            answers[item[9]],
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
    if (this.isMetaMaskAuthenticated) this.updateBidsToMe();
  },
};
</script>
