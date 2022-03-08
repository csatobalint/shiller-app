import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { ethers } from "ethers";
const { ethereum } = window;
const EthCrypto = require('eth-crypto');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');

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
        process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
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
        process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.provider
      );

      let options = {
        gasPrice: 5000000000,
        gasLimit: 1000000,
        from: this.address,
      };
      const data = await contract.getBidsContract(options);
      //await this.provider.call(data);
      console.log(data);
      //console.log(response);
      return data;
    },
    async getBidsBeneficiaryWithEtherJs() {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
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
          process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
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
    async makeNewWithEtherJs2() {

      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.signer
      );
      console.log(contract);

      //check if user already generated their private keys (from user)
      let encryptedPrivateKey = await this.getPrivateKey();
      console.log(encryptedPrivateKey);
      console.log(encryptedPrivateKey.length);
      console.log(typeof encryptedPrivateKey);
      const isKeysAlreadyNotSet = encryptedPrivateKey.length === 0
      console.log(isKeysAlreadyNotSet);

           
      // toAddress public key to use for encryption
      const identityPublicKey = await contract.publicKeys(this.question.toAddress);
      console.log(identityPublicKey)

      // if toAddress is not generated already his keys
      if(identityPublicKey === ''){
        throw new Error('ToAddress is not already registered.')
      }

      const encryptedQuestion = await EthCrypto.cipher.stringify(
        await EthCrypto.encryptWithPublicKey(identityPublicKey, this.question.text)
      )
      console.log(encryptedQuestion)

      let data = null;

      if (isKeysAlreadyNotSet) {
        console.log('isKeysAlreadyNotSet: ',isKeysAlreadyNotSet)
        const generatedKeys = await this.generateKeys()
        console.log(generatedKeys)
        //from user public key
        const identityPublicKeyFrom = generatedKeys.identity.publicKey;
        //encrypted question by from public key
        const encryptedQuestionFrom = await EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyFrom, this.question.text)
        )
        data = await contract.populateTransaction.makeNewWithSetKey(
          this.question.toAddress, // toAddress
          encryptedQuestion, //question text
          encryptedQuestionFrom,
          0, //Math.abs(this.question.timeLimit), // time limit [s]  ----> if not =0, then it works
          generatedKeys.identity.publicKey, // fromAddress generated public key
          generatedKeys.encryptedPrivateKey, // fromAddress encrypted private key
          0 // bidlimit TODO
        );
      }
      else{
        console.log('isKeysAlreadyNotSet: ',isKeysAlreadyNotSet)
        //from user public key
        const identityPublicKeyFrom = await contract.publicKeys(this.address);
        //encrypted question by from public key
        const encryptedQuestionFrom = await EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyFrom, this.question.text)
        )

        data = await contract.populateTransaction.makeNew(
          this.question.toAddress, // toAddress
          encryptedQuestion, //question encrypted by to user public key
          encryptedQuestionFrom, //question encrypted by to user public key
          Math.abs(this.question.timeLimit) // time limit [s]
        );
      }

      data.value = ethers.utils.parseEther(this.question.bid.toString());
      console.log(data);
  
      const response = await this.signer.populateTransaction(data);
      this.signer.sendTransaction(response);

  },
    async withdrawExpiredBidWithEtherJs(id) {
        const contract = new ethers.Contract(
          process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
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
          process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
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
    async generateKeys(){
      const metamaskPublicKey = await ethereum.request({ 
          method: "eth_getEncryptionPublicKey", 
          params: [this.address] 
      })

      console.log("Pubkey for account ", this.address, " is: ", metamaskPublicKey);

      const identity  = EthCrypto.createIdentity();
      console.log("Identity: ", identity)

      const encryptedPrivateKey = ethUtil.bufferToHex(
        Buffer.from(
        JSON.stringify(
        sigUtil.encrypt({
         publicKey: metamaskPublicKey,
         data: identity.privateKey,
         version: 'x25519-xsalsa20-poly1305',
       })),'utf8'));
       console.log("Encrypted privatekey: ", encryptedPrivateKey)

       return {identity, encryptedPrivateKey}


      //  const contract = new ethers.Contract(
      //   process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
      //   process.env.VUE_APP_ABI,
      //   this.provider
      // );

      //  const data = await contract.populateTransaction.setKeys(
      //   identity.publicKey,
      //   encryptedPrivateKey
      // );

      // console.log("Data: ", data)
      // const response = await this.signer.populateTransaction(data);
      // console.log("Response: ", response)
      // const tx = this.signer.sendTransaction(response);
      // console.log("Tx: ", tx);
    },
    async setKeys(){
      const metamaskPublicKey = await ethereum.request({ 
          method: "eth_getEncryptionPublicKey", 
          params: [this.address] 
      })

      console.log("Pubkey for account ", this.address, " is: ", metamaskPublicKey);

      const identity  = EthCrypto.createIdentity();
      console.log("Identity: ", identity)
      console.log("Identity public key: ", identity.publicKey)
      
      let identityPublicKeyFromPrivateKey = EthCrypto.publicKeyByPrivateKey( identity.privateKey )
      console.log("Identity public key: ", identityPublicKeyFromPrivateKey)

      const encryptedPrivateKey = ethUtil.bufferToHex(
        Buffer.from(
        JSON.stringify(
        sigUtil.encrypt({
         publicKey: metamaskPublicKey,
         data: identity.privateKey,
         version: 'x25519-xsalsa20-poly1305',
       })),'utf8'));
       console.log("Encrypted privatekey: ", encryptedPrivateKey)

       const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.provider
      );

       const data = await contract.populateTransaction.setKeysWithBidLimit(
        identity.publicKey, //my public key
        encryptedPrivateKey, // my private key
        0 //bid limit
      );


      console.log("Data: ", data)
      const response = await this.signer.populateTransaction(data);
      console.log("Response: ", response)
      const tx = this.signer.sendTransaction(response);
      console.log("Tx: ", tx);
    },
    async getPrivateKey() {
      const contract = new ethers.Contract(
        process.env.VUE_APP_CONTRACT_ADDRESS_V3.toLowerCase(), //contract address in .env file
        process.env.VUE_APP_ABI,
        this.provider
      );

      let options = {
        gasPrice: 5000000000,
        gasLimit: 1000000,
        from: this.address,
      };
      const data = await contract.getPrivateKey(options);
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
    //this.setKeys();
    //this.makeNewWithEtherJs2();
  },
};
