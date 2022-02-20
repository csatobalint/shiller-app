<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <v-col><h1>My Bids</h1> </v-col>
          <v-col class="text-right">
            <v-btn class="mr-2" fab outlined color="primary" @click="updateMyBids()">
                <v-icon dark> mdi-refresh </v-icon>
            </v-btn>
            <v-dialog v-model="dialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="" fab outlined color="primary" dark v-bind="attrs" v-on="on">
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
                <v-btn color="primary darken-1" outlined @click="dialog = false">
                  Close
                </v-btn>
                <v-btn color="primary darken-1" outlined @click="makeNewWithEtherJs">
                  Send
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          </v-col>
        </v-row>
        <template v-for="(item, index) in myBids">
          <template v-if="!item[1]">
            <v-row :key="index" class="pb-5">
              <v-card class="rounded-xl pa-2" :class="[item[2] ? 'answerQuestionBackground' : '']" width="100%">
                <v-card-text >
                  <v-card :style="questionAnswerCardBackgroundColor" class="rounded-lg mb-2" outlined width="100%">
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> Q: {{ item[8] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                  <v-card :style="questionAnswerCardBackgroundColor" class="rounded-lg" outlined width="100%" v-if="item[0]">
                    <v-card-text class="text-body-1">
                      <v-row>
                        <v-col> A: {{ item[2] }} </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-card-text>
                <v-divider class="mx-4"></v-divider>
                <v-card-title  class="text-body-1">
                  <v-row>
                    <v-col>
                      <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                          <v-chip v-bind="attrs" v-on="on">To: {{ shortAddress(item[7]) }}</v-chip>
                        </template>
                        <span>{{item[7]}} <v-icon dark> mdi-content-copy </v-icon></span> 
                      </v-tooltip>
                    </v-col>
                    <v-col class="text-right">{{ parseInt(item[5])/1e18 }} ETH </v-col>
                  </v-row>
                </v-card-title>
                <v-card-subtitle class="pl-5">
                  {{ item[4] | hexToDate }}
                </v-card-subtitle>
                
                <v-card-actions class="pl-5">
                  <v-row>
                    <v-col cols="" v-if="!item[2]" class="text-body-2">
                      Due at: {{ dueDate(item[4],item[3]) }}
                    </v-col>
                    <v-col cols="" class="text-right">
                      <v-btn v-if="!item[2]" color="seondary" outlined @click="withdrawExpiredBidWithEtherJs(item[8])">Withdraw</v-btn>
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
  computed: {
    ...mapGetters({
      userName: "auth/userName",
      provider: "auth/metaMaskProvider",
      signer: "auth/metaMaskSigner",
      address: "auth/metaMaskAddress",
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
      myBids: "bids/myBids",
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
    async updateMyBids() {
      const ids = await this.getBidsContractWithEtherJs();
      const bids = [];
      ids.forEach((id) => {
        this.getBidWithEtherJs(id).then((res) => {
          const array = [...res];
          array.push(id);
          bids.push(array);
        });
      });
      this.$store.dispatch("bids/updateMyBids", bids);
    },
    async makeNewWithEtherJs() {
      
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V2.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.signer
      );
      console.log(this.contract);

      const data = await contract.populateTransaction.makeNew(
        this.question.toAddress, // toAddress
        this.question.text, //question text
        Math.abs(this.question.timeLimit) // time limit [s]
      );
      data.value = ethers.utils.parseEther(this.question.bid.toString());
      console.log(data);

      const response = await this.signer.populateTransaction(data);
      this.signer.sendTransaction(response);
    },
    async withdrawExpiredBidWithEtherJs(id) {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V2.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.signer
      );
      console.log(this.contract);

      const data = await contract.populateTransaction.withdrawExpiredBid(
        id //question text
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
  data() {
    return {
      dialog: false,
      question: {
        toAddress: "0x13c5DB04644f9cfE79C79bBB1a74aaB9A04C98ea",
        bid: 0,
        text: "randomstring_" + Math.random().toString().substr(2, 5),
        timeLimit: 60
      }
    }
  },
  mounted() {
    if (this.isMetaMaskAuthenticated) this.updateMyBids();
    //this.getBidWithEtherJs('asd');
  },
};
</script>
