<template>
  <v-container class="pt-10">
    <v-row>
      <v-col></v-col>
      <v-col cols="8">
        <v-row class="py-5">
          <h1>My Bids</h1>
        </v-row>
        <div v-for="(item, index) in myBids" :key="index">
          <v-row v-if="!item[1]" class="py-3">
              <v-card class="rounded-xl px-2 foreground" outlined>
                <v-card-title> To: {{ item[7] }} </v-card-title>
                <v-card-subtitle
                  >At: {{ item[4] | hexToDate }}
                </v-card-subtitle>
                <v-card-text> Q: {{ item[8] }} </v-card-text>
                <v-card-text> Bid: {{ parseInt(item[5], 16) }} ETC</v-card-text>
                <v-card-text v-if="item[0]">A: {{ item[2] }}</v-card-text>
                <v-card-actions>
                  <v-btn v-if="!item[1]" primary>Withdraw</v-btn>
                </v-card-actions>
              </v-card>
          </v-row>
        </div>
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
      let unix_timestamp = parseInt(hex_unix_timestamp, 16);
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
      const myBids = [];
      ids.forEach((id) => {
        this.getBidWithEtherJs(id).then((res) => {
          const array = [...res];
          array.push(id);
          myBids.push(array);
        });
      });
      this.$store.dispatch("bids/updateMyBids", myBids);
    },
  },
  mounted() {
    this.updateMyBids();
    //this.getBidWithEtherJs('asd');
  },
};
</script>
