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
  mixins: [globalMixin],
  computed: {
    ...mapGetters({
    }),
    ...mapState({
        sortBy: state => state.bids.sortBy,
        sortDirection: state => state.bids.sortDirection,
        decryptedPrivateKey: state => state.auth.decryptedPrivateKey,
        BID: state => state.bids.BID
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
    },
    options(){
      return {
        gasPrice: 5000000000,
        gasLimit: 1000000,
        from: this.address
      };
    }
  },
  methods: {
    async getBid(questionId) {

      const data = await this.contract.getBid(questionId, this.options);
      //await this.provider.call(data);

      let decryptedData = data.slice(0,8).concat([[...data[8]]])
      console.log(decryptedData);
      //console.log(response);

      //i am the owner
      if (decryptedData[this.BID.ownerAddress] == this.address) {
        decryptedData[this.BID.messages][0] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][0])
        decryptedData[this.BID.messages][2] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][2])
      } 
      // i am the beneficaiary
      else {
        decryptedData[this.BID.messages][1] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][1])
        decryptedData[this.BID.messages][3] = await this.decryptTextWithPrivateKey(decryptedData[this.BID.messages][3])
      }

      return decryptedData;
    },
    async getBidsContract() {

      const data = await this.contract.getBidsContract(this.options);
      //await this.provider.call(data);
      console.log(data);
      //console.log(response);
      return data;
    },
    async getBidsBeneficiary() {

      const data = await this.contract.getBidsBeneficiary(this.options);
      const response = await this.provider.call(data);
      console.log(data);
      console.log(response);
      return data;
    },
    async makeNew() {

      // get beneficiaryAddress public key which will be used for encryption
      const identityPublicKeyBeneficiary = await this.contract.publicKeys(this.question.toAddress);
      console.log(identityPublicKeyBeneficiary)

      // if beneficiaryAddress public key is not generated already his keys
      if(identityPublicKeyBeneficiary !== ''){
        throw new Error('Beneficiary is not already registered.')
      }
      
      // encrypt the question text with the beneficiary public key
      const encryptedQuestionBeneficiary = EthCrypto.cipher.stringify(
        await EthCrypto.encryptWithPublicKey(identityPublicKeyBeneficiary, this.question.text)
      )
      console.log(encryptedQuestionBeneficiary)

      //check if user already generated their private key (owner user)
      let encryptedPrivateKey = await this.getPrivateKey();
      console.log(encryptedPrivateKey);
      // console.log(encryptedPrivateKey.length);
      // console.log(typeof encryptedPrivateKey);

      //true: privateKey is already NOT set => makeNew with Set Keys
      //false: privateKey is already set => makeNew
      const isOwnerKeysAlreadySet = encryptedPrivateKey.length !== 0
      console.log(isOwnerKeysAlreadySet);
           

      

      let data = null;

      if (!isOwnerKeysAlreadySet) {
        console.log('isOwnerKeysAlreadySet: ',isOwnerKeysAlreadySet)
        const generatedKeys = await this.generateKeys()
        console.log(generatedKeys)
        //from user public key
        const identityPublicKeyOwner = generatedKeys.identity.publicKey;
        //encrypted question by from public key
        const encryptedQuestionOwner = EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyOwner, this.question.text)
        )
        data = await this.contract.populateTransaction.makeNewWithSetKey(
          this.question.toAddress, // toAddress
          encryptedQuestionOwner, //question text
          encryptedQuestionBeneficiary,
          0, //Math.abs(this.question.timeLimit), // time limit [s]  ----> if not =0, then it works
          generatedKeys.identity.publicKey, // fromAddress generated public key
          generatedKeys.encryptedPrivateKey, // fromAddress encrypted private key
          0 // bidlimit TODO
        );
      }
      else{
        console.log('isOwnerKeysAlreadySet: ',isOwnerKeysAlreadySet)
        //from user public key
        const identityPublicKeyOwner = await this.contract.publicKeys(this.address);
        //encrypted question by from public key
        const encryptedQuestionOwner = EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyOwner, this.question.text)
        )

        data = await this.contract.populateTransaction.makeNew(
          this.question.toAddress, // toAddress
          encryptedQuestionOwner, //question encrypted by to user public key
          encryptedQuestionBeneficiary, //question encrypted by to user public key
          0 //Math.abs(this.question.timeLimit) // time limit [s]
        );
      }

      data.value = ethers.utils.parseEther(this.question.bid.toString());
      console.log(data);
  
      const response = await this.signer.populateTransaction(data);
      let transaction = await this.signer.sendTransaction(response);
      console.log(transaction)

      transaction = await this.provider.getTransaction ( transaction.hash )

      while (transaction.blockNumber === null) {
        await this.sleep(100)
        transaction = await this.provider.getTransaction ( transaction.hash )
      }
      
      const transactionReceipt = await this.provider.getTransactionReceipt(transaction.hash)
      console.log(transactionReceipt);

    },
    async withdrawExpiredBid(id) {

  
        const data = await this.contract.populateTransaction.withdrawExpiredBid(
          id //question text
        );
        data.value = 0;
        console.log(data);
  
        const response = await this.signer.populateTransaction(data);
        this.signer.sendTransaction(response);
    },
    async rewardSolvedBid(id,answer,ownerAddress) {
        console.log(id,answer,ownerAddress)

        // ownerAddress public key to use for encryption
        const identityPublicKeyOwner = await this.contract.publicKeys(ownerAddress);
        console.log(identityPublicKeyOwner)

        const encryptedAnswerByOwner = await EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyOwner, answer)
        )
        console.log(encryptedAnswerByOwner)

        // identityPublicKeyBeneficiary public key to use for encryption
        const identityPublicKeyBeneficiary = await this.contract.publicKeys(this.address);
        console.log(identityPublicKeyBeneficiary)

        const encryptedAnswerByBeneficiary = await EthCrypto.cipher.stringify(
          await EthCrypto.encryptWithPublicKey(identityPublicKeyBeneficiary, answer)
        )
        console.log(encryptedAnswerByBeneficiary)
  
        console.log(id)
        console.log(encryptedAnswerByOwner)
        console.log(encryptedAnswerByBeneficiary)

        const data = await this.contract.populateTransaction.rewardSolvedBid(
          id, //question id
          encryptedAnswerByOwner,
          encryptedAnswerByBeneficiary
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

      //  const data = await contract.populateTransaction.setKeysWithBidLimit(
      //   identity.publicKey,
      //   encryptedPrivateKey
      // );

      // console.log("Data: ", data)
      // const response = await this.signer.populateTransaction(data);
      // console.log("Response: ", response)
      // const tx = this.signer.sendTransaction(response);
      // console.log("Tx: ", tx);
    },
    async setKeysWithBidLimit(){
      const metamaskPublicKey = await ethereum.request({ 
          method: "eth_getEncryptionPublicKey", 
          params: [this.address] 
      })

      console.log("Pubkey for account ", this.address, " is: ", metamaskPublicKey);

      const identity  = EthCrypto.createIdentity();
      console.log("Identity: ", identity)
      console.log("Identity public key: ", identity.publicKey)
      console.log("!!!!!!Identity private key: ", identity.privateKey)
      
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

       const data = await this.contract.populateTransaction.setKeysWithBidLimit(
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
      const data = await this.contract.getPrivateKey(this.options);
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
          const plainText = await EthCrypto.decryptWithPrivateKey(this.decryptedPrivateKey, parsedEncryptedText);
          return plainText
        } catch (error) {
          console.log(error)
          return "This text cannot be decrypted with your account."
        }
        
      }
    },
    async updateMyBids() {
        const ids = await this.getBidsContract();
        const bids = [];
        ids.forEach((id) => {
          this.getBid(id).then((res) => {
            const array = [...res];
            array.push(id);
            bids.push(array);
          });
        });
        this.$store.dispatch("bids/updateMyBids", bids);
    },
    async updateBidsToMe() {
        const ids = await this.getBidsBeneficiary();
        const bids = [];
        ids.forEach((id) => {
          this.getBid(id).then((res) => {
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
    },
  },
  mounted() {
    console.log("hello from mixin!");
  },
};
