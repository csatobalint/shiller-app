<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <v-col><h1>Bids to Me</h1> </v-col>
          <v-col class="text-right">
            <v-btn class="mr-2" fab outlined color="primary" @click="updateBidsToMe()">
                <v-icon dark> mdi-refresh </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <template v-for="(item, index) in bidsToMe">
          <template v-if="!item[1]">
            <v-row :key="index" class="pb-5">
              <v-card class="rounded-xl pa-2" :class="[item[2] ? 'answerQuestionBackground' : '']" width="100%">
                 <v-card-subtitle class="pl-5">
                  {{ item[4] | hexToDate }}
                </v-card-subtitle>
                <v-card-text >
                  <span>Question</span>
                  <v-card :style="questionAnswerCardBackgroundColor" class="rounded-lg mb-2" outlined width="100%">
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> Q: {{ item[8] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <span>Answer</span>
                  <v-card :style="questionAnswerCardBackgroundColor" class="rounded-lg" outlined width="100%" v-if="item[0]">
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> A: {{ item[2] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <v-card :style="questionAnswerCardBackgroundColor" class="rounded-lg" outlined width="100%" v-else>
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> 
                          <v-textarea
                            name="answer"
                            label=""
                            v-model="answers[item[8]]"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-card-text>
                <v-divider class="mx-4"></v-divider>
                <v-card-title  class="text-body-1">
                  <v-row>
                    <v-col><v-chip>From: {{ shortAddress(item[6]) }}</v-chip></v-col>
                    <v-col class="text-right">{{ parseInt(item[5])/1e18 }} ETH </v-col>
                  </v-row>
                </v-card-title>
               
                
                <v-card-actions class="pl-5">
                  <v-row>
                    <!-- <v-col cols="" v-if="!item[2]" class="text-body-2">
                      Expiries at: {{ dueDate(item[4],item[3]) }}
                    </v-col> -->
                    <v-col cols="" class="text-right">
                      <v-btn v-if="!item[2]" color="seondary" outlined @click="rewardSolvedBidWithEtherJs(item[8],answers[item[8]])">Send Answer</v-btn>
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
import { ethers } from "ethers";

export default {
  filters: {
    hexToDate: function (hex_unix_timestamp) {
      let unix_timestamp = parseInt(hex_unix_timestamp);
      var a = new Date(unix_timestamp * 1000);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time =
        date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
      return time;
    },
  },
  data() {
    return {
      answers: {}
    }
  },
  computed: {
    ...mapGetters({
      userName: "auth/userName",
      provider: "auth/metaMaskProvider",
      signer: "auth/metaMaskSigner",
      address: "auth/metaMaskAddress",
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
      bidsToMe: "bids/bidsToMe",
    }),
    questionAnswerCardBackgroundColor(){
      if (this.$vuetify.theme.dark) {
        return {
          'background-color': 'rgba(0,0,0,0.1)',
        }
      } else {
        return {
          'background-color': 'rgba(0,0,0,0.0)',
        }
      }
    }
  },
  methods: {
    async getBidWithEtherJs(questionText) {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V2.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.provider
      );

      let options = {
        gasPrice: 5000000000,
        gasLimit: 1000000,
        from: this.address,
      };
      const data = await contract.getBid(questionText, options);
      const response = await this.provider.call(data);
      console.log(data);
      console.log(response);
      return data;
    },
    async getBidsContractWithEtherJs() {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V2.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.provider
      );

      let options = {
        gasPrice: 5000000000,
        gasLimit: 1000000,
        from: this.address,
      };
      const data = await contract.getBidsContract(options);
      const response = await this.provider.call(data);
      console.log(data);
      console.log(response);
      return data;
    },
    async getBidsBeneficiaryWithEtherJs() {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V2.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.provider
      );

      let options = {
        gasPrice: 5000000000,
        gasLimit: 1000000,
        from: this.address,
      };
      const data = await contract.getBidsBeneficiary(options);
      const response = await this.provider.call(data);
      console.log(data);
      console.log(response);
      return data;
    },
    async updateBidsToMe() {
      const ids = await this.getBidsBeneficiaryWithEtherJs();
      const bids = [];
      ids.forEach((id) => {
        this.getBidWithEtherJs(id).then((res) => {
          const array = [...res];
          array.push(id);
          bids.push(array);
        });
      });
      this.$store.dispatch("bids/updateBidsToMe", bids);
    },
    async rewardSolvedBidWithEtherJs(id,answer) {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V2.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.signer
      );
      console.log(contract);

      const data = await contract.populateTransaction.RewardSolvedBid(
        id, //question text
        answer
      );
      data.value = 0;
      console.log(data);

      const response = await this.signer.populateTransaction(data);
      this.signer.sendTransaction(response);
    },
    shortAddress(address){
      return address.slice(0, 5) + "..." + address.slice(-4);
    },
    dueDate(timestamp,timeLimit){
      const shift = timeLimit
      const dueStamp = Number(timestamp) + Number(shift)
      const dueStampHex = "0x" + Number(dueStamp).toString(16)
      console.log(timestamp)
      console.log(dueStamp)
      console.log(dueStampHex)

      return this.$options.filters.hexToDate(dueStampHex)
    }
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) 
      this.updateBidsToMe();
  },
};
</script>
