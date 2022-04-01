import { mapGetters, mapActions } from "vuex";
import { ethers } from "ethers";
const { ethereum } = window;
const EthCrypto = require('eth-crypto');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');
import firebase from "firebase";

export default {
  filters: {
  },
  data() {
    return {
      now: 0,
      rules: {
        required: (value) => !!value || "Required",
        positiveNumber: (value) => value > 0 || "Must be greater than 0",
        isValidHex: (value) =>
          (value.length == 42 && !isNaN(parseInt(value, 16))) ||
          "This is not a valid address",
        counter: (value) => value.length <= 20 || "Max 20 characters",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
      isAuthenticated: "auth/isAuthenticated",
      userName: "auth/userName",
      provider: "auth/metaMaskProvider",
      signer: "auth/metaMaskSigner",
      address: "auth/metaMaskAddress",
      contract: "auth/metaMaskContract",
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated",
      isLoading: "system/isLoading",
      isNotificationDialog: "system/isNotificationDialog",
      isNotificationDialogTitle: "system/isNotificationDialogTitle",
      isNotificationDialogText: "system/isNotificationDialogText",
      isNotificationSnackbar: "system/isNotificationSnackbar",
      isNotificationSnackbarText: "system/isNotificationSnackbarText",
    }),
    // isNotificationSnackbar:{
    //   get(){
    //     return state => state.system.isNotificationSnackbar
    //   },
    //   set(){
    //     this.$store.dispatch('system/closeNotificationSnackbar');
    //   }
    // }
  },
  methods: {
    ...mapActions({
      startLoading: 'system/startLoading',
      endLoading: 'system/endLoading',
      openNotificationDialog: 'system/openNotificationDialog',
      closeNotificationDialog: 'system/closeNotificationDialog',
      openNotificationSnackbar: 'system/openNotificationSnackbar',
      closeNotificationSnackbar: 'system/closeNotificationSnackbar'
    }),
    signInWithTwitter() {
      var provider = new firebase.auth.TwitterAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then((userCredential) => {
          // Get the Twitter screen name.
          this.$store.dispatch(
            "auth/updateUserName",
            userCredential.additionalUserInfo.username
          );
        })
        .catch((error) => {
          alert(error);
          return;
        });
      firebase
        .auth()
        .getRedirectResult()
        .then(() => {
          //console.log(res.user.additionalUserInfo);
          //this.$router.replace({ name: "app" });
        })
        .catch((error) => {
          alert(error);
          return;
        });
    },
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$store.dispatch("auth/clearUser");
          // this.$router.replace({
          //   name: "login",
          // });
        });
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    copyAddress(refName) {
      // console.log(refName)
      // console.log(this.$refs[refName])
      let text = '';
      if(this.$refs[refName].constructor  == Array){
        text = this.$refs[refName][0].value;
      }else{
        text = this.$refs[refName].value;
      }
      let listener = function (ev) {
        ev.clipboardData.setData("text/plain", text);
        ev.preventDefault();
      };
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    },
    getNow() {
      this.now = Date.now();
    },
    NumbersOnly(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    async getBidLimit() {
      const data = await this.contract.bidLimits(this.address);
      //const response = await this.provider.call(data);
      console.log(data);
      // console.log(response);
      return data / 1e18;
    },
    async setBidLimit(bidLimit) {
      const data = await this.contract.populateTransaction.setBidLimit(
        ethers.utils.parseEther(bidLimit.toString())
      );
      // console.log("Data: ", data)

      // const response = await this.signer.populateTransaction(data);
      // console.log("Response: ", response)

      // const tx = this.signer.sendTransaction(response);
      // console.log("Tx: ", tx);
      await this.waitForMetaMaskTransaction(data);
      alert('done');
    },
    async setKeysWithBidLimit(bidLimit){
      //get owner ethereum public key -> used for identity private key encryption
      const metamaskPublicKey = await ethereum.request({ 
          method: "eth_getEncryptionPublicKey", 
          params: [this.address] 
      })

      console.log("Pubkey for account ", this.address, " is: ", metamaskPublicKey);

      //generate public-private key pair
      const identity  = EthCrypto.createIdentity();
      console.log("Identity: ", identity)
      console.log("Identity public key: ", identity.publicKey)
      console.log("!!!!!!Identity private key: ", identity.privateKey)
      
      // let identityPublicKeyFromPrivateKey = EthCrypto.publicKeyByPrivateKey( identity.privateKey )
      // console.log("Identity public key: ", identityPublicKeyFromPrivateKey)

      // encrypt generated private key with ethereum wallet public key
      const encryptedPrivateKey = ethUtil.bufferToHex(
        Buffer.from(
        JSON.stringify(
        sigUtil.encrypt({
         publicKey: metamaskPublicKey,
         data: identity.privateKey,
         version: 'x25519-xsalsa20-poly1305',
       })),'utf8'));
       console.log("Encrypted privatekey: ", encryptedPrivateKey)

      // construct transaction object
      const data = await this.contract.populateTransaction.setKeysWithBidLimit(
        identity.publicKey, //my public key
        encryptedPrivateKey, // my private key
        ethers.utils.parseEther(bidLimit.toString()) //bid limit
      );

      this.waitForMetaMaskTransaction(data)
    },
    async waitForMetaMaskTransaction(data){
      // sign with my address
      const response = await this.signer.populateTransaction(data);
      //console.log(response);
      // send transation
      let transaction = await this.signer.sendTransaction(response);
      transaction = await this.provider.getTransaction ( transaction.hash )
      while (transaction.blockNumber === null) {
        await this.sleep(1000)
        transaction = await this.provider.getTransaction ( transaction.hash )
      }
      const transactionReceipt = await this.provider.getTransactionReceipt(transaction.hash)
      //console.log(transactionReceipt);
      return transactionReceipt;
    },
    async decryptPrivateKey() {
      let options = {
        from: this.address,
      };
      const encryptedPrivateKey = await this.contract.getEncryptedPrivateKey(options);
      console.log(encryptedPrivateKey);

      return await ethereum.request({
        method: "eth_decrypt",
        params: [encryptedPrivateKey, this.address],
      });
      //console.log(this.decryptedPrivateKey);
    },
    async updateBlockNumber(){
      if(this.provider !== null){
        const blockNumber = await this.provider.getBlockNumber();
        console.log(blockNumber)
        this.$store.commit("bids/SET_BLOCK_NUMBER", blockNumber);
      }
    }
  },
  mounted() {

  },
  created() {
    setInterval(() => {
      this.getNow();
      //this.updateBlockNumber()
    }, 20)
  },
};
