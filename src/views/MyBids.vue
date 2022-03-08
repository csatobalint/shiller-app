<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5 align-center">
          <v-col class="text-h4">My questions</v-col>
          <v-btn @click="setKeys">Set Keys</v-btn>
          <v-col class="text-right">
            <v-btn
              class="mr-2"
              fab
              outlined
              color="primary"
              @click="updateMyBids()"
            >
              <v-icon dark> mdi-refresh </v-icon>
            </v-btn>
            <v-dialog v-model="dialog" persistent max-width="600px">
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
                  <span class="text-h5">New question</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          name="to_address"
                          label="Public address"
                          id="to_address"
                          v-model="question.toAddress"
                          outlined
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          name="text"
                          label="Text"
                          v-model="question.text"
                          outlined
                        ></v-textarea>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          name="bid"
                          label="Bid amount (ETC)"
                          id="bid"
                          v-model="question.bid"
                          outlined
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          name="time_limit"
                          label="Time limit (s)"
                          id="time_limit"
                          v-model="question.timeLimit"
                          outlined
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
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
                    @click="makeNewWithEtherJs"
                  >
                    Send
                  </v-btn>
                  <v-btn
                    color="primary darken-1"
                    outlined
                    @click="makeNewWithEtherJs2"
                  >
                    Send2
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
        <Tab :tab-items="[{ 'tab': 'Answered' }, { 'tab': 'Pending' }, { 'tab': 'All' }]"></Tab>
        <template v-for="(item, index) in sortedBids">
          <template>
            <v-row :key="index" class="pb-5">
              <v-card
                class="rounded-xl pa-2"
                :class="[item[2] ? 'answerQuestionBackground' : '']"
                width="100%"
              >
                <v-card-subtitle class="pl-5 d-flex justify-space-between">
                  <span>Question</span>
                  <span>{{ item[2] | hexToDate }}</span>
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
                        <v-col>{{ item[8][0] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <div v-if="item[0]" class="my-4">Answer</div>
                  <v-card
                    :style="questionAnswerCardBackgroundColor"
                    class="rounded-lg"
                    outlined
                    width="100%"
                    v-if="item[0]"
                  >
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> {{ item[8][2] }} </v-col>
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
                          <v-chip v-bind="attrs" v-on="on"
                            >To: {{ shortAddress(item[7]) }}</v-chip
                          >
                        </template>
                        <span
                          >{{ item[7] }}
                          <v-icon dark> mdi-content-copy </v-icon></span
                        >
                      </v-tooltip>
                    </v-col>
                    <v-col class="text-right"
                      >{{ parseInt(item[4]) / 1e18 }} ETH
                    </v-col>
                  </v-row>
                </v-card-title>

                <v-card-actions class="pl-5">
                  <v-row>
                    <!-- <v-col cols="" v-if="!item[2]" class="text-body-2">
                      Locked until: {{ dueDate(item[4],item[3]) }}
                    </v-col> -->
                    <v-col cols="" class="text-right">
                      <v-btn
                        v-if="!item[1]"
                        color="seondary"
                        outlined
                        @click="withdrawExpiredBidWithEtherJs(item[9])"
                        >Withdraw</v-btn
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
import mixinBids from './components/mixin';
import Tab from './components/Tab.vue'

export default {
  components: {
    Tab,
  },
  mixins: [mixinBids],
  data() {
    return {
      dialog: false,
      question: {
        toAddress: "0x13c5DB04644f9cfE79C79bBB1a74aaB9A04C98ea",
        bid: 0,
        text: "randomstring_" + Math.random().toString().substr(2, 5),
        timeLimit: 60,
      },
    };
  },
  computed: {
    ...mapGetters({
      filteredBids: "bids/filteredMyBids"
    }),
    
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) this.updateMyBids();
  },
};
</script>
