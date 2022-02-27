import { mapState } from "vuex";
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
    }),
    ...mapState({
        sortBy: state => state.bids.sortBy,
        sortDirection: state => state.bids.sortDirection,
    }),
    questionAnswerCardBackgroundColor() {
      if (this.$vuetify.theme.dark) {
        return {
          "background-color": "rgba(0,0,0,0.1)",
        };
      } else {
        return {
          "background-color": "rgba(0,0,0,0.0)",
        };
      }
    },
    sortedBids(){
        if(this.sortBy == 'Date' && this.sortDirection == 'desc'){
          return [...this.filteredBids].sort((a,b) => (a[4]-b[4]))
        } 
        else if(this.sortBy == 'Date' && this.sortDirection == 'asc'){
          return [...this.filteredBids].sort((a,b) => -(a[4]-b[4]))
        }
        else if(this.sortBy == 'Bid' && this.sortDirection == 'desc'){
          return [...this.filteredBids].sort((a,b) => -(a[5]-b[5]))
        } 
        else if(this.sortBy == 'Bid' && this.sortDirection == 'asc'){
          return [...this.filteredBids].sort((a,b) => (a[5]-b[5]))
        } else{
          return this.filteredBids
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
      await this.provider.call(data);
      //console.log(data);
      //console.log(response);
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
      await this.provider.call(data);
      //console.log(data);
      //console.log(response);
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
      //console.log(data);
      console.log(response);
      return data;
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
    console.log("hello from mixin!");
  },
};
