import { mapGetters } from "vuex";
import { ethers } from "ethers";
const { ethereum } = window;
const EthCrypto = require('eth-crypto');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');

export default {
  filters: {
  },
  data() {
    return {
      now: 0
    }
  },
  computed: {
    ...mapGetters({
      provider: "auth/metaMaskProvider",
      signer: "auth/metaMaskSigner",
      address: "auth/metaMaskAddress",
      contract: "auth/metaMaskContract",
      isMetaMaskAuthenticated: "auth/isMetaMaskAuthenticated"
    }),
    
  },
  methods: {
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
      console.log("Data: ", data)

      const response = await this.signer.populateTransaction(data);
      console.log("Response: ", response)

      const tx = this.signer.sendTransaction(response);
      console.log("Tx: ", tx);
    },
    async setKeysWithBidLimit(bidLimit){
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
        ethers.utils.parseEther(bidLimit.toString()) //bid limit
      );

      console.log("Data: ", data)
      const response = await this.signer.populateTransaction(data);
      console.log("Response: ", response)
      const tx = this.signer.sendTransaction(response);
      console.log("Tx: ", tx);

      this.waitForMetaMaskTransaction(data)
    },
    async waitForMetaMaskTransaction(data){
      const response = await this.signer.populateTransaction(data);
      //console.log(response);
      let transaction = await this.signer.sendTransaction(response);
      transaction = await this.provider.getTransaction ( transaction.hash )
      while (transaction.blockNumber === null) {
        await this.sleep(100)
        transaction = await this.provider.getTransaction ( transaction.hash )
      }
      const transactionReceipt = await this.provider.getTransactionReceipt(transaction.hash)
      //console.log(transactionReceipt);
      return transactionReceipt;
    },
  },
  mounted() {

  },
  created() {
    setInterval(() => {
      this.getNow();
    }, 1000)
  },
};
