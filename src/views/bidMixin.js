import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { ethers } from "ethers";
const { ethereum } = window;
const EthCrypto = require('eth-crypto');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');
import globalMixin from "./globalMixin";

export default {
  filters: {
    hexToDate: function (hex_unix_timestamp) {
      let unix_timestamp = parseInt(hex_unix_timestamp);
      let a = new Date(unix_timestamp * 1000);
      let months = [
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
      let year = a.getFullYear();
      let month = months[a.getMonth()];    
      let date = (a.getDate().toString().length == 1) ? '0' + a.getDate() : a.getDate();
      let hour = (a.getHours().toString().length == 1) ? '0' + a.getHours() : a.getHours();
      let min = (a.getMinutes().toString().length == 1) ? '0' + a.getMinutes() : a.getMinutes();
      let sec = (a.getSeconds().toString().length == 1) ? '0' + a.getSeconds() : a.getSeconds();
      let time =
        date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
      return time;
    },
  },
  mixins: [globalMixin],
  computed: {
    ...mapGetters({
    }),
    ...mapState({
        sortBy: state => state.bids.sortBy,
        sortDirection: state => state.bids.sortDirection,
        decryptedPrivateKey: state => state.auth.decryptedPrivateKey,
        BID: state => state.bids.BID,
        BlockTime: state => state.bids.BlockTime,
        BlockNumber: state => state.bids.BlockNumber
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
          return [...this.filteredBids].sort((a,b) => -(a[this.BID.timestamp]-b[this.BID.timestamp]))
        } 
        else if(this.sortBy == 'Date' && this.sortDirection == 'asc'){
          return [...this.filteredBids].sort((a,b) => (a[this.BID.timestamp]-b[this.BID.timestamp]))
        }
        else if(this.sortBy == 'Bid' && this.sortDirection == 'desc'){
          return [...this.filteredBids].sort((a,b) => -(a[this.BID.value]-b[this.BID.value]))
        } 
        else if(this.sortBy == 'Bid' && this.sortDirection == 'asc'){
          return [...this.filteredBids].sort((a,b) => (a[this.BID.value]-b[this.BID.value]))
        } else{
          return this.filteredBids
        }
    },
    options(){
      return {
        //gasPrice: 10000000000,
        //gasLimit: 10000000,
        from: this.address
      };
    }
  },
  methods: {
    async getBid(questionId) {

      const data = await this.contract.getBid(questionId, this.options);
      //const response = await this.provider.call(data);

      // create a copy of the bidData (readonly)
      let decryptedData = data.slice(0,8).concat([[...data[8]]])
      //console.log(data);
      //console.log(response);

      //i am the owner, decrypt question and answer crypted with owener public key with owner private key
      if (decryptedData[this.BID.ownerAddress] == this.address) {
        decryptedData[this.BID.messages][this.BID.questionForOwner] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.questionForOwner])
        decryptedData[this.BID.messages][this.BID.answerForOwner] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.answerForOwner])
      } 
      // i am the beneficaiary
      else {
        decryptedData[this.BID.messages][this.BID.questionForBenificiary] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.questionForBenificiary])
        decryptedData[this.BID.messages][this.BID.answerForBenificiary] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.answerForBenificiary])
      }

      //console.log(decryptedData)

      return decryptedData;
    },
    async getBids(questionIds) {
      const datas = await this.contract.getBids(questionIds, this.options);
      //console.log(datas)
      const decryptedDatas = [];
      datas.forEach(data => {
        //console.log(data)
        this.decryptBidObject(data).then(value => decryptedDatas.push(value))
      });
      //console.log(decryptedDatas)
      return decryptedDatas
    },
    async decryptBidObject(data){
      // create a copy of the bidData (readonly)
      let decryptedData = data.slice(0,this.BID.messages).concat([[...data[this.BID.messages]]]).concat([data[this.BID.questionId]])
      
      //console.log(response);

      //i am the owner, decrypt question and answer crypted with owener public key with owner private key
      if (decryptedData[this.BID.ownerAddress] == this.address) {
        decryptedData[this.BID.messages][this.BID.questionForOwner] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.questionForOwner])
        decryptedData[this.BID.messages][this.BID.answerForOwner] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.answerForOwner])
      } 
      // i am the beneficaiary
      else {
        decryptedData[this.BID.messages][this.BID.questionForBenificiary] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.questionForBenificiary])
        decryptedData[this.BID.messages][this.BID.answerForBenificiary] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][this.BID.answerForBenificiary])
      }

      //console.log(decryptedData);

      return decryptedData;
    },
    async getBidsOwner() {

      const data = await this.contract.getBidsOwner(this.options);
      // const response = await this.provider.call(data);
      //console.log(data);
      // console.log(response);
      return data;
    },
    async getBidsBeneficiary() {

      const data = await this.contract.getBidsBeneficiary(this.options);
      // const response = await this.provider.call(data);
      //console.log(data);
      // console.log(response);
      return data;
    },
    async makeNew() {
      this.startLoading();

      try {
        // get beneficiaryAddress public key which will be used for encryption
        const identityPublicKeyBeneficiary = await this.contract.publicKeys(this.question.toAddress);
        //console.log(identityPublicKeyBeneficiary)

        // if beneficiaryAddress public key is not generated already his keys
        if(identityPublicKeyBeneficiary == ''){
          throw new Error('The beneficiary has not already registered with the provided (to) address. Please contact him to register to be able to recieve questions.')
        }

        const beneficiaryBidLimit = await this.contract.bidLimits(this.question.toAddress);
        // if beneficiaryAddress bid limit is larger than the bid
        if(Number(beneficiaryBidLimit)/1e18 > Number(Number(this.question.bid).toFixed(16))){
          throw new Error(`The minimum bid limit of the benificiary address provided is ${Number(beneficiaryBidLimit)/1e18} ETH. Please increase your bid value.`)
        }
        
        // encrypt the question text with the beneficiary public key
        const encryptedQuestionBeneficiary = EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyBeneficiary, this.question.text)
        )
        //console.log(encryptedQuestionBeneficiary)

        //check if user already generated their private key (owner user)
        let encryptedPrivateKey = await this.getEncryptedPrivateKey();

        //true: privateKey is already NOT set => makeNew with Set Keys
        //false: privateKey is already set => makeNew
        const isOwnerKeysAlreadySet = encryptedPrivateKey.length !== 0
            
        let data = null;
        let encryptedKeys = null;

        //console.log(ethers.utils.parseEther(Number(this.question.bid).toFixed(16)))

        if (!isOwnerKeysAlreadySet) {
          //console.log('isOwnerKeysAlreadySet: ',isOwnerKeysAlreadySet)
          encryptedKeys = await this.generateEncryptedKeys()
          //console.log(encryptedKeys)

          const encryptedPublicKeyOwner = encryptedKeys.identity.publicKey;
          //encrypted question by owner public key
          const encryptedQuestionOwner = EthCrypto.cipher.stringify(
            await EthCrypto.encryptWithPublicKey(encryptedPublicKeyOwner, this.question.text)
          )
          data = await this.contract.populateTransaction.makeNewWithSetKey(
            ethers.utils.parseEther(Number(this.question.bid).toFixed(16)), //reward 
            this.question.toAddress, // toAddress
            [encryptedQuestionOwner, //question text
            encryptedQuestionBeneficiary],
            Math.abs(this.question.timeLimit.value/this.BlockTime), // time limit [s]  ----> if not =0, then it works
            encryptedKeys.identity.publicKey, // fromAddress encrypted public key
            encryptedKeys.encryptedPrivateKey, // fromAddress encrypted private key
            ethers.utils.parseEther(Number(0.0001).toString()) // bidlimit minimum of 0.0001 ETH
          );

          //save locally the decrypted private key
          const privateKey = encryptedKeys.identity.privateKey;
          this.$store.commit("auth/SET_DECRYPTED_PRIVATE_KEY", privateKey);
          this.$store.commit("auth/SET_IS_KEYS_SET", true)
        }
        else{
          //console.log('isOwnerKeysAlreadySet: ',isOwnerKeysAlreadySet)
          const encryptedPublicKeyOwner = await this.getPublicKey();
          
          //encrypted question by from public key
          const encryptedQuestionOwner = EthCrypto.cipher.stringify(
            await EthCrypto.encryptWithPublicKey(encryptedPublicKeyOwner, this.question.text)
          )
          //console.log(encryptedQuestionOwner)

          data = await this.contract.populateTransaction.makeNew(
            ethers.utils.parseEther(Number(this.question.bid).toFixed(16)), //reward 
            this.question.toAddress, // toAddress
            [encryptedQuestionOwner, //question encrypted by to user public key
            encryptedQuestionBeneficiary], //question encrypted by to user public key
            Math.abs(this.question.timeLimit.value/this.BlockTime) //Math.abs(this.question.timeLimit) // time limit [s]
          );
        }

        let fee = 1; // 1%
        let bidAmountWei = Number(ethers.utils.parseEther(Number(this.question.bid).toFixed(16)))
        let feeAmountWei = Math.ceil(bidAmountWei*fee/100);
        let transactionAmount = (bidAmountWei + feeAmountWei)/1e18;
        data.value = ethers.utils.parseEther(transactionAmount.toString());
        //console.log(data);

        // sign with my address
        const response = await this.signer.populateTransaction(data);
        // send transation
        let transaction = await this.signer.sendTransaction(response);
    
        //wait for the transaction
        await this.waitForMetaMaskTransaction(transaction);
        if (!isOwnerKeysAlreadySet && encryptedKeys !== null) {
          //save locally the decrypted private key
          const privateKey = encryptedKeys.identity.privateKey;
          this.$store.commit("auth/SET_DECRYPTED_PRIVATE_KEY", privateKey);
          this.$store.commit("auth/SET_IS_KEYS_SET", true)
        }
        await this.updateMyBids();

        this.dialog = false
        this.resetForm();

        this.openNotificationSnackbar("You question has been sent successfully.")

      } catch (error) {
        console.log(error)
        this.openNotificationSnackbar("MetaMask: " + error.message)
        this.endLoading()
      }
      

    },
    async withdrawExpiredBid(questionId) {
        this.startLoading();
        try {
          const data = await this.contract.populateTransaction.withdrawExpiredBid(
            questionId
          );
          // sign with my address
          const response = await this.signer.populateTransaction(data);
          // send transation
          let transaction = await this.signer.sendTransaction(response);
          await this.waitForMetaMaskTransaction(transaction);
          await this.updateMyBids();
          this.openNotificationSnackbar("The question has been withdrawn successfully.")
          
        } catch (error) {
          this.openNotificationSnackbar(error.message)
          this.endLoading()
        }
  
        
    },
    async rewardSolvedBid(questionId,answer,ownerAddress) {
      
      this.startLoading();

      try {
        //console.log(questionId,answer,ownerAddress)

        // ownerAddress public key to use for encryption
        const encryptedPublicKeyOwner = await this.contract.publicKeys(ownerAddress);
        //console.log(encryptedPublicKeyOwner)

        const encryptedAnswerByOwner = EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(encryptedPublicKeyOwner, answer)
        )
        //console.log(encryptedAnswerByOwner)

        // identityPublicKeyBeneficiary public key to use for encryption
        const identityPublicKeyBeneficiary = await this.contract.publicKeys(this.address);
        //console.log(identityPublicKeyBeneficiary)

        const encryptedAnswerByBeneficiary = EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyBeneficiary, answer)
        )
        //console.log(encryptedAnswerByBeneficiary)
  
        //console.log(questionId)
        //console.log(encryptedAnswerByOwner)
        //console.log(encryptedAnswerByBeneficiary)

        const data = await this.contract.populateTransaction.rewardSolvedBid(
          questionId,
          [encryptedAnswerByOwner,
          encryptedAnswerByBeneficiary]
        );
        data.value = 0;
        //console.log(data);
  
        // sign with my address
        const response = await this.signer.populateTransaction(data);
        // send transation
        let transaction = await this.signer.sendTransaction(response);
        await this.waitForMetaMaskTransaction(transaction);
        await this.updateBidsToMe();
        this.openNotificationSnackbar("The question has been answered successfully.")

      } catch (error) {
        this.openNotificationSnackbar(error.message)
        this.endLoading()
      }

        
    },
    async generateEncryptedKeys(){
      const metamaskPublicKey = await ethereum.request({ 
          method: "eth_getEncryptionPublicKey", 
          params: [this.address] 
      })
      //console.log("Pubkey for account ", this.address, " is: ", metamaskPublicKey);

      const identity  = EthCrypto.createIdentity();
      //console.log("Identity: ", identity)

      const encryptedPrivateKey = ethUtil.bufferToHex(
        Buffer.from(
        JSON.stringify(
        sigUtil.encrypt({
         publicKey: metamaskPublicKey,
         data: identity.privateKey,
         version: 'x25519-xsalsa20-poly1305',
       })),'utf8'));
       //console.log("Encrypted privatekey: ", encryptedPrivateKey)

       return {identity, encryptedPrivateKey}
    },
    async getPublicKey() {
      const data = await this.contract.publicKeys(this.address);
      //const response = await this.provider.call(data);
      // console.log(data);
      // console.log(response);
      return data;
    },
    async getEncryptedPrivateKey() {
      const data = await this.contract.getEncryptedPrivateKey(this.options);
      //const response = await this.provider.call(data);
      // console.log(data);
      // console.log(response);
      return data;
    },
    async decryptTextWithPrivateKey(encryptedText){
      // if no answer given the answer is an empty strings.......
      if(encryptedText == '')
        return encryptedText;
      else{
        try {
          const parsedEncryptedText = EthCrypto.cipher.parse(encryptedText)
          //console.log(this.decryptedPrivateKey)
          const plainText = await EthCrypto.decryptWithPrivateKey(this.decryptedPrivateKey, parsedEncryptedText);
          return plainText
        } catch (error) {
          //console.log(error)
          return 'Text cannot be decrypted.'
          //throw new Error('This text cannot be decrypted.');
        }
        
      }
    },
    async updateMyBids() {
        this.startLoading();
        const ids = await this.getBidsOwner();
        //const bids = [];
        let errors = [];
        //console.log(ids)

        // for(const id of ids){
        //   try {
        //     const bid = await this.getBid(id)
        //     console.log(bid)
        //     const array = [...bid];
        //     array.push(id);
        //     bids.push(array);
        //   } catch (error) {
        //     errors.push(error)
        //   }
        // }

        try {
          const bids = await this.getBids(ids);
          await this.$store.dispatch("bids/updateMyBids", bids);
        } catch (error) {
          errors.push(error)
          console.log(errors)
        }
        
        this.endLoading();
    },
    async updateBidsToMe() {
        this.startLoading();
        const ids = await this.getBidsBeneficiary();
        //const bids = [];
        let errors = [];

        // for(const id of ids){
        //   try {
        //     const bid = await this.getBid(id)
        //     const array = [...bid];
        //     array.push(id);
        //     bids.push(array);
        //   } catch (error) {
        //     errors.push(error)
        //   }
        // }

        try {
          const bids = await this.getBids(ids);
          await this.$store.dispatch("bids/updateBidsToMe", bids);
        } catch (error) {
          errors.push(error)
          console.log(errors)
        }
        
        this.endLoading();

    },
    shortAddress(address){
        return address.slice(0, 5) + "..." + address.slice(-4);
    },
    expiryTimeStamp(item){
      const dueStamp = Number(item[this.BID.timestamp]) + Number(item[this.BID.deltaBlockNumber]*this.BlockTime)
      const dueStampHex = "0x" + Number(dueStamp).toString(16) 
      return this.$options.filters.hexToDate(dueStampHex)
    },
    expiryBlockTime(item){
      return Number(item[this.BID.deltaBlockNumber]) + Number(item[this.BID.blockNumber])
    },
    isNotExpired(item){
      //if there is no expiration then the time limit was set to 0
      if(item[this.BID.deltaBlockNumber] == 0)
        return true;
      const dueStamp = Number(item[this.BID.timestamp]) + Number(item[this.BID.deltaBlockNumber]*this.BlockTime)
      return dueStamp > this.now/1000
    },
    expiriesInSeconds(item){
      const dueStamp = Number(item[this.BID.timestamp]) + Number(item[this.BID.deltaBlockNumber]*this.BlockTime)
      if(dueStamp < this.now/1000){
        return 0
      }
      else{
        let distance = dueStamp - this.now/1000
        distance = distance.toFixed(0)
        return distance
      }
    },
    countdown(item){
      let distance = this.expiriesInSeconds(item)
      let hours = Math.floor((distance % (1 * 60 * 60 * 24)) / (1 * 60 * 60));
      let minutes = Math.floor((distance % (1 * 60 * 60)) / (1 * 60));
      let seconds = Math.floor((distance % (1 * 60)) / 1);
      return hours + "h " + minutes + "m " + seconds + "s "
    },
    resetForm(){
      this.question = {
        toAddress: "",
        bid: null,
        text: "",
        timeLimit: { name: "No Limit", value: 0 },
      }
    }
  },
  mounted() {
    console.log("hello from mixin!");
  },
};
